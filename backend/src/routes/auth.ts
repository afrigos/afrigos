import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { sendOTPEmail, sendVendorWelcomeEmail } from '../services/emailService';

const router = express.Router();
const prisma = new PrismaClient();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['VENDOR', 'CUSTOMER', 'ADMIN'])
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // For CUSTOMER and VENDOR roles: Generate OTP and require email verification
    // For ADMIN: Use existing flow (no OTP required)
    let emailVerificationCode: string | null = null;
    let emailVerificationCodeExpiry: Date | null = null;
    let isVerified = false;
    
    if (role === 'CUSTOMER' || role === 'VENDOR') {
      // Generate 6-digit OTP
      emailVerificationCode = generateOTP();
      // Set expiry to 10 minutes from now
      emailVerificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
      isVerified = false; // Customer and Vendor must verify email first
    } else {
      // For ADMIN, keep existing behavior (no email verification required)
      isVerified = false; // Admins also not verified by default
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone,
        isActive: role === 'CUSTOMER', // Only customers are active immediately, admins need approval
        isVerified,
        ...(emailVerificationCode && { emailVerificationCode }),
        ...(emailVerificationCodeExpiry && { emailVerificationCodeExpiry })
      } as any,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true
      }
    });

    // Create vendor profile if role is VENDOR
    let vendorBusinessName = '';
    if (role === 'VENDOR') {
      // Ensure we have valid names before creating business name
      const safeFirstName = firstName?.trim() || 'Vendor';
      const safeLastName = lastName?.trim() || 'User';
      vendorBusinessName = `${safeFirstName} ${safeLastName}'s Store`;
      
      await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: vendorBusinessName,
          businessType: 'Individual',
          description: 'New vendor on AfriGos platform'
        }
      });

      // Send welcome email to vendor
      try {
        await sendVendorWelcomeEmail({
          email,
          firstName: firstName.trim(),
          businessName: vendorBusinessName
        });
      } catch (emailError: any) {
        console.error('Failed to send vendor welcome email:', emailError);
        // Don't fail registration if email fails, but log it
      }
    }

    // Send OTP email for CUSTOMER and VENDOR roles
    if ((role === 'CUSTOMER' || role === 'VENDOR') && emailVerificationCode) {
      try {
        await sendOTPEmail({
          email,
          firstName: firstName.trim(),
          otp: emailVerificationCode,
          expiryMinutes: 10
        });
      } catch (emailError: any) {
        console.error('Failed to send OTP email:', emailError);
        // Don't fail registration if email fails, but log it
        // User can request resend later
      }
    }

    const message = role === 'ADMIN' 
      ? 'Admin account created successfully (pending approval)'
      : role === 'CUSTOMER'
      ? 'Account created! Please check your email for verification code.'
      : role === 'VENDOR'
      ? 'Vendor account created! Please check your email for verification code.'
      : 'User registered successfully';

    // For CUSTOMER and VENDOR, don't return token - they need to verify email first
    const responseData: any = {
      user
    };

    if (role !== 'CUSTOMER' && role !== 'VENDOR') {
      // Generate JWT token for ADMIN only (existing behavior)
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );
      responseData.token = token;
    }

    res.status(201).json({
      success: true,
      message,
      data: responseData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// @desc    Verify email with OTP
// @route   POST /api/v1/auth/verify-email
// @access  Public
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vendorProfile: {
          select: {
            id: true,
            businessName: true
          }
        },
        adminProfile: true
      }
    }) as any;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check if OTP exists and matches
    if (!user.emailVerificationCode || user.emailVerificationCode !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Check if OTP has expired
    if (!user.emailVerificationCodeExpiry || new Date() > user.emailVerificationCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify email: Clear OTP, mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationCode: null,
        emailVerificationCodeExpiry: null
      } as any
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, emailVerificationCode: __, emailVerificationCodeExpiry: ___, ...userWithoutPassword } = user;

    // Include vendor info in response if user is a vendor
    const responseData: any = {
      ...userWithoutPassword,
      isVerified: true,
      vendorId: user.vendorProfile?.id,
      vendorName: user.vendorProfile?.businessName
    };

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: responseData,
        token
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
});

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    }) as any;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: newOTP,
        emailVerificationCodeExpiry: expiryDate
      } as any
    });

    // Send OTP email
    try {
      await sendOTPEmail({
        email: user.email,
        firstName: user.firstName,
        otp: newOTP,
        expiryMinutes: 10
      });
    } catch (emailError: any) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code'
    });
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vendorProfile: {
          select: {
            id: true,
            businessName: true,
            verificationStatus: true
          }
        },
        adminProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For CUSTOMER role: Check if email is verified
    if (user.role === 'CUSTOMER' && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    // For VENDOR role: Check if email is verified
    // ALL vendors must verify email regardless of approval status (approved, pending, or rejected)
    if (user.role === 'VENDOR' && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in. All vendors must verify their email regardless of account status.',
        requiresVerification: true,
        email: user.email,
        role: 'vendor'
      });
    }

    // Check if user is pending approval (for VENDOR/ADMIN)
    const isPendingApproval = !user.isActive || (!user.isVerified && user.role !== 'CUSTOMER');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Include vendor info in response if user is a vendor
    const responseData: any = {
      ...userWithoutPassword,
      vendorId: user.vendorProfile?.id,
      vendorName: user.vendorProfile?.businessName
    };

    let message = 'Login successful';
    if (isPendingApproval) {
      message = `Login successful. Your ${user.role.toLowerCase()} account is pending approval.`;
    } else if (user.role === 'CUSTOMER' && !user.isVerified) {
      message = 'Please verify your email address before logging in';
    }

    res.json({
      success: true,
      message,
      data: {
        user: responseData,
        token,
        isPendingApproval
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        vendorProfile: true,
        adminProfile: true,
        addresses: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh
// @access  Public
router.post('/refresh', async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @desc    Change password
// @route   POST /api/v1/auth/change-password
// @access  Private
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

export default router;
