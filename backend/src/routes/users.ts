import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { sendAccountDeletionRequestEmail } from '../services/emailService';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
router.get('/profile', async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
router.put('/profile', [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('phone').optional().isMobilePhone('any')
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

    const { firstName, lastName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        avatar
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// @desc    Request account deletion
// @route   POST /api/v1/users/request-deletion
// @access  Private
router.post('/request-deletion', [
  body('reason').optional().trim()
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

    const { reason } = req.body;

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send email notification to admin
    try {
      await sendAccountDeletionRequestEmail({
        userEmail: user.email,
        firstName: user.firstName || 'Unknown',
        lastName: user.lastName || '',
        role: user.role,
        userId: user.id,
        reason: reason || undefined
      });
    } catch (emailError) {
      console.error('Failed to send deletion request email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.json({
      success: true,
      message: 'Account deletion request has been submitted. Our team will process your request shortly.'
    });
  } catch (error) {
    console.error('Request account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit account deletion request'
    });
  }
});

export default router;
