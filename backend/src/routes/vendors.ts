import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { requireVendor, requireAdmin } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary';
import { 
  createOrGetStripeAccount, 
  updateStripeAccountDetails,
  createAccountLink,
  isAccountReadyForPayouts 
} from '../services/stripeConnect';
import Stripe from 'stripe';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for document uploads
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'));
    }
  }
});

const uploadDocumentToCloudinary = (buffer: Buffer, vendorId: string, type: string) => {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `afrigos/vendors/${vendorId}/documents`,
          resource_type: 'auto',
          public_id: `${type.toLowerCase()}-${Date.now()}`
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Failed to upload document'));
          } else {
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        }
      )
      .end(buffer);
  });
};

const deleteFromCloudinary = async (fileUrl: string) => {
  if (!fileUrl || (!fileUrl.includes('cloudinary.com') && !fileUrl.includes('res.cloudinary.com'))) {
    return;
  }

  try {
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    const publicIdWithExt = `${folder}/${fileName}`.split('.')[0];
    await cloudinary.uploader.destroy(publicIdWithExt);
  } catch (error) {
    console.warn('Failed to remove previous Cloudinary asset', error);
  }
};

// @desc    Get vendor profile
// @route   GET /api/v1/vendors/profile
// @access  Private (Vendor)
router.get('/profile', requireVendor, async (req: any, res: any) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            isVerified: true,
            addresses: {
              select: {
                id: true,
                street: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                type: true,
                isDefault: true
              }
            }
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            status: true,
            isActive: true,
            createdAt: true
          }
        },
        documents: true,
        _count: {
          select: {
            products: true,
            orders: true,
            reviews: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const [financialSummaryRaw, pendingOrders] = await Promise.all([
      prisma.vendorEarning.aggregate({
        where: { vendorId: vendor.id },
        _sum: {
          amount: true,
          commission: true,
          netAmount: true
        }
      }),
      prisma.order.aggregate({
        where: {
          vendorId: vendor.id,
          status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] }
        },
        _sum: { totalAmount: true }
      })
    ]);

    const financialSummary = {
      totalGross: Number(financialSummaryRaw._sum.amount ?? 0),
      totalCommission: Number(financialSummaryRaw._sum.commission ?? 0),
      totalNet: Number(financialSummaryRaw._sum.netAmount ?? 0),
      pendingOrderValue: Number(pendingOrders._sum?.totalAmount ?? 0)
    };

    res.json({
      success: true,
      data: {
        ...vendor,
        financialSummary
      }
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor profile'
    });
  }
});

// @desc    Create or update vendor profile
// @route   POST /api/v1/vendors/profile
// @access  Private (Vendor)
router.post('/profile', requireVendor, [
  body('businessName').trim().notEmpty(),
  body('businessType').trim().notEmpty(),
  body('businessNumber').optional({ nullable: true, checkFalsy: true }),
  body('taxId').optional({ nullable: true, checkFalsy: true }),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('website').optional({ nullable: true, checkFalsy: true }),
  body('foundedYear').optional({ nullable: true, checkFalsy: true }),
  body('employees').optional({ nullable: true, checkFalsy: true }),
  body('revenue').optional({ nullable: true, checkFalsy: true }),
  body('socialMedia').optional({ nullable: true, checkFalsy: true }),
  body('stripeAccountId').optional({ nullable: true, checkFalsy: true }),
  body('bankAccountNumber').optional({ nullable: true, checkFalsy: true }),
  body('bankRoutingNumber').optional({ nullable: true, checkFalsy: true }),
  body('bankAccountHolderName').optional({ nullable: true, checkFalsy: true }),
  body('bankName').optional({ nullable: true, checkFalsy: true }),
  body('stripeAccountStatus').optional({ nullable: true, checkFalsy: true })
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

    const {
      businessName,
      businessType,
      businessNumber,
      taxId,
      description,
      website,
      foundedYear,
      employees,
      revenue,
      socialMedia,
      categoryId,
      phone,
      stripeAccountId,
      bankAccountNumber,
      bankRoutingNumber,
      bankAccountHolderName,
      bankName,
      stripeAccountStatus
    } = req.body;

    // Helper function to normalize empty strings to null
    const normalizeValue = (value: any) => {
      if (value === '' || value === undefined) return null;
      return value;
    };

    // Check if vendor profile already exists
    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    }) as any;

    let vendor;
    let newStripeAccountId: string | null = null;
    let stripeAccountStatusValue: string | null = null;

    // Check if Stripe payment details are being updated
    // Only consider it an update if all payment fields are provided (complete update)
    const hasAllPaymentFields = bankAccountNumber !== undefined && 
                                bankRoutingNumber !== undefined && 
                                bankAccountHolderName !== undefined && 
                                bankName !== undefined;
    
    // Normalize payment fields for comparison
    const normalizedBankAccountNumber = hasAllPaymentFields ? normalizeValue(bankAccountNumber) : null;
    const normalizedBankRoutingNumber = hasAllPaymentFields ? normalizeValue(bankRoutingNumber) : null;
    const normalizedBankAccountHolderName = hasAllPaymentFields ? normalizeValue(bankAccountHolderName) : null;
    const normalizedBankName = hasAllPaymentFields ? normalizeValue(bankName) : null;

    // Check if payment details are actually changing (only if all fields are provided)
    let paymentDetailsChanged = false;
    if (hasAllPaymentFields && existingProfile) {
      paymentDetailsChanged = 
        (normalizedBankAccountNumber !== (existingProfile.bankAccountNumber || null)) ||
        (normalizedBankRoutingNumber !== (existingProfile.bankRoutingNumber || null)) ||
        (normalizedBankAccountHolderName !== (existingProfile.bankAccountHolderName || null)) ||
        (normalizedBankName !== (existingProfile.bankName || null));

      // If payment details are changing, check edit count limit
      if (paymentDetailsChanged) {
        const currentEditCount = (existingProfile as any).stripePaymentDetailsEditCount || 0;
        const MAX_EDITS = 5;

        if (currentEditCount >= MAX_EDITS) {
          return res.status(400).json({
            success: false,
            message: `You have reached the maximum limit of ${MAX_EDITS} edits for Stripe payment details. Please contact support if you need to update your payment information.`,
            editCount: currentEditCount,
            maxEdits: MAX_EDITS
          });
        }
      }
    }

    // If bank details are provided, create or update Stripe Connect account
    if (hasAllPaymentFields && normalizedBankAccountNumber && normalizedBankRoutingNumber && normalizedBankAccountHolderName && normalizedBankName) {
      try {
        // Get user email for Stripe account
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { email: true }
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
          console.error('STRIPE_SECRET_KEY is not set in environment variables');
          return res.status(500).json({
            success: false,
            message: 'Stripe is not configured. Please contact support.',
            error: 'STRIPE_SECRET_KEY missing'
          });
        }

        // Create or get Stripe Connect account
        const existingStripeAccountId = existingProfile?.stripeAccountId || stripeAccountId;
        
        // Validate Stripe account ID format if it exists
        // Stripe account IDs start with 'acct_' and are typically 18-24 characters long
        const isValidStripeAccountId = existingStripeAccountId && 
          existingStripeAccountId.startsWith('acct_') && 
          existingStripeAccountId.length >= 18;
        
        const isPlaceholderAccount = existingStripeAccountId && !isValidStripeAccountId;

        if (existingStripeAccountId && !isPlaceholderAccount) {
          // Account exists and is valid, update business details
          try {
            await updateStripeAccountDetails(existingStripeAccountId, businessName, 'company');
            
            // Check if account is ready for payouts
            const isReady = await isAccountReadyForPayouts(existingStripeAccountId);
            stripeAccountStatusValue = isReady ? 'verified' : 'pending';
            newStripeAccountId = existingStripeAccountId;
          } catch (stripeError: any) {
            console.error('Error updating Stripe account:', stripeError);
            // If updating fails, account might need re-onboarding
            stripeAccountStatusValue = 'pending';
            newStripeAccountId = existingStripeAccountId;
          }
        } else {
          // Create new Stripe Connect account (or recreate if placeholder)
          console.log(`Creating new Stripe Connect account for vendor: ${existingProfile?.id || req.user.vendorId}`);
          try {
            newStripeAccountId = await createOrGetStripeAccount(
              existingProfile?.id || req.user.vendorId || 'new',
              user.email,
              businessName,
              'GB'
            );
            console.log(`✅ Stripe Account created: ${newStripeAccountId}`);
            
            // Update account with business details
            try {
              await updateStripeAccountDetails(newStripeAccountId, businessName, 'company');
              stripeAccountStatusValue = 'pending';
            } catch (stripeError: any) {
              console.error('Error updating Stripe account details:', stripeError);
              stripeAccountStatusValue = 'pending';
              // Don't fail the entire request if this update fails
            }
          } catch (stripeError: any) {
            console.error('❌ Stripe Connect account creation failed:', stripeError);
            console.error('Error details:', {
              message: stripeError.message,
              type: stripeError.type,
              code: stripeError.code,
              statusCode: stripeError.statusCode
            });
            
            // Return error to frontend so user knows what happened
            return res.status(500).json({
              success: false,
              message: `Failed to create Stripe account: ${stripeError.message || 'Unknown error'}. Please check your Stripe configuration or contact support.`,
              error: stripeError.message,
              stripeErrorCode: stripeError.code || stripeError.type
            });
          }
        }
      } catch (stripeError: any) {
        console.error('❌ Unexpected Stripe Connect error:', stripeError);
        console.error('Error stack:', stripeError.stack);
        
        // Return error to frontend
        return res.status(500).json({
          success: false,
          message: `Failed to set up Stripe account: ${stripeError.message || 'Unknown error'}. Please try again or contact support.`,
          error: stripeError.message
        });
      }
    }

    if (existingProfile) {
      // Update existing profile
      const updateData: any = {
        businessName,
        businessType,
        businessNumber: normalizeValue(businessNumber),
        taxId: normalizeValue(taxId),
        description: normalizeValue(description),
        website: normalizeValue(website),
        foundedYear: normalizeValue(foundedYear),
        employees: normalizeValue(employees),
        revenue: normalizeValue(revenue),
        socialMedia: socialMedia ? (typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia) : null,
        stripeAccountId: newStripeAccountId || normalizeValue(stripeAccountId) || existingProfile.stripeAccountId,
        stripeAccountStatus: stripeAccountStatusValue || normalizeValue(stripeAccountStatus) || existingProfile.stripeAccountStatus
      };

      // Only update payment details if all payment fields are provided
      // This allows vendors to edit other profile fields without affecting payment details or edit count
      if (hasAllPaymentFields) {
        updateData.bankAccountNumber = normalizedBankAccountNumber;
        updateData.bankRoutingNumber = normalizedBankRoutingNumber;
        updateData.bankAccountHolderName = normalizedBankAccountHolderName;
        updateData.bankName = normalizedBankName;

        // Increment edit count only if payment details are actually changing
        if (paymentDetailsChanged) {
          const currentEditCount = (existingProfile as any).stripePaymentDetailsEditCount || 0;
          updateData.stripePaymentDetailsEditCount = currentEditCount + 1;
        } else {
          // Keep the existing edit count if details haven't changed
          updateData.stripePaymentDetailsEditCount = (existingProfile as any).stripePaymentDetailsEditCount || 0;
        }
      } else {
        // If not updating payment details, keep existing values
        updateData.bankAccountNumber = existingProfile.bankAccountNumber;
        updateData.bankRoutingNumber = existingProfile.bankRoutingNumber;
        updateData.bankAccountHolderName = existingProfile.bankAccountHolderName;
        updateData.bankName = existingProfile.bankName;
        // Keep existing edit count
        updateData.stripePaymentDetailsEditCount = (existingProfile as any).stripePaymentDetailsEditCount || 0;
      }
      
      // Note: categoryId is stored at the product level, not vendor profile level
      // We'll handle this when vendor creates products
      
      await prisma.vendorProfile.update({
        where: { userId: req.user.id },
        data: updateData
      });

      // Update user phone if provided
      if (phone !== undefined) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: {
            phone: phone || null
          }
        });
      }

      // Refetch vendor with all includes
      vendor = await prisma.vendorProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
              isVerified: true,
              addresses: {
                select: {
                  id: true,
                  street: true,
                  city: true,
                  state: true,
                  postalCode: true,
                  country: true,
                  type: true,
                  isDefault: true
                }
              }
            }
          },
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              status: true,
              isActive: true,
              createdAt: true
            }
          },
          documents: true,
          _count: {
            select: {
              products: true,
              orders: true,
              reviews: true
            }
          }
        }
      });
    } else {
      // Create new profile
      const newProfile = await prisma.vendorProfile.create({
        data: {
          userId: req.user.id,
          businessName,
          businessType,
          businessNumber: normalizeValue(businessNumber),
          taxId: normalizeValue(taxId),
          description: normalizeValue(description),
          website: normalizeValue(website),
          foundedYear: normalizeValue(foundedYear),
          employees: normalizeValue(employees),
          revenue: normalizeValue(revenue),
          socialMedia: socialMedia ? (typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia) : null,
          stripeAccountId: newStripeAccountId || normalizeValue(stripeAccountId),
          bankAccountNumber: normalizeValue(bankAccountNumber),
          bankRoutingNumber: normalizeValue(bankRoutingNumber),
          bankAccountHolderName: normalizeValue(bankAccountHolderName),
          bankName: normalizeValue(bankName),
          stripeAccountStatus: stripeAccountStatusValue || normalizeValue(stripeAccountStatus) || 'pending'
        } as any
      });
      
      // Update Stripe account ID if it was created
      if (newStripeAccountId && !normalizeValue(stripeAccountId)) {
        await prisma.vendorProfile.update({
          where: { id: newProfile.id },
          data: {
            stripeAccountId: newStripeAccountId,
            stripeAccountStatus: stripeAccountStatusValue || 'pending'
          } as any
        });
      }

      // Update user phone if provided
      if (phone !== undefined) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: {
            phone: phone || null
          }
        });
      }

      // Refetch vendor with all includes
      vendor = await prisma.vendorProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
              isVerified: true,
              addresses: {
                select: {
                  id: true,
                  street: true,
                  city: true,
                  state: true,
                  postalCode: true,
                  country: true,
                  type: true,
                  isDefault: true
                }
              }
            }
          },
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              status: true,
              isActive: true,
              createdAt: true
            }
          },
          documents: true,
          _count: {
            select: {
              products: true,
              orders: true,
              reviews: true
            }
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor profile'
    });
  }
});

// @desc    Get vendor earnings
// @route   GET /api/v1/vendors/earnings
// @access  Private (Vendor)
// Helper function to create vendor earnings for an order
async function createVendorEarningForOrder(orderId: string) {
  try {
    // Check if earning already exists
    const existingEarning = await prisma.vendorEarning.findFirst({
      where: { orderId }
    });

    if (existingEarning) {
      return existingEarning;
    }

    // Get order with all necessary data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    commissionRate: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order || order.status !== 'DELIVERED' || order.paymentStatus !== 'COMPLETED') {
      return null;
    }

    // Calculate commission
    const DEFAULT_COMMISSION_RATE = 15;
    let totalCommissionRate = 0;
    let itemsWithCommission = 0;

    order.orderItems.forEach((item) => {
      const commissionRate = item.product.category?.commissionRate 
        ? Number(item.product.category.commissionRate) 
        : DEFAULT_COMMISSION_RATE;
      totalCommissionRate += commissionRate;
      itemsWithCommission++;
    });

    const averageCommissionRate = itemsWithCommission > 0 
      ? totalCommissionRate / itemsWithCommission 
      : DEFAULT_COMMISSION_RATE;

    // Calculate amounts
    const grossAmount = Number(order.totalAmount) - Number(order.shippingCost || 0);
    const commission = (grossAmount * averageCommissionRate) / 100;
    const netAmount = grossAmount - commission;

    // Create earning and immediately move to withdrawal balance
    const earning = await prisma.vendorEarning.create({
      data: {
        vendorId: order.vendorId,
        orderId: order.id,
        amount: grossAmount,
        commission: commission,
        netAmount: netAmount,
        status: 'PROCESSING',
        movedToWithdrawal: true,
        movedToWithdrawalAt: new Date()
      } as any
    });

    // Immediately update vendor withdrawal balance
    await prisma.vendorProfile.update({
      where: { id: order.vendorId },
      data: {
        withdrawalBalance: {
          increment: netAmount
        }
      } as any
    });

    return earning;
  } catch (error) {
    console.error('Error creating vendor earning for order:', orderId, error);
    return null;
  }
}

router.get('/earnings', requireVendor, async (req: any, res: express.Response) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const vendorId = req.user.vendorId;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    // Get vendor profile to access withdrawal balance
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, withdrawalBalance: true } as any
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Backfill earnings for delivered orders that don't have earnings yet
    // This handles existing orders that were delivered before earnings creation was implemented
    const deliveredOrdersWithoutEarnings = await prisma.order.findMany({
      where: {
        vendorId,
        status: 'DELIVERED',
        paymentStatus: 'COMPLETED',
        vendorEarnings: {
          none: {}
        }
      },
      select: {
        id: true
      },
      take: 50 // Limit to avoid performance issues
    });

    // Create earnings for orders that are missing them
    for (const order of deliveredOrdersWithoutEarnings) {
      await createVendorEarningForOrder(order.id);
    }

    // Check for earnings that are immediately eligible for withdrawal (no waiting period)
    // Earnings are immediately available for withdrawal when created
    const eligibleEarnings = await prisma.vendorEarning.findMany({
      where: {
        vendorId,
        movedToWithdrawal: false,
        status: { in: ['PENDING', 'PROCESSING'] },
        order: {
          status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] }
        }
      } as any,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            status: true
          }
        }
      }
    });

    // Move eligible earnings to withdrawal balance
    if (eligibleEarnings.length > 0) {
      const totalToMove = eligibleEarnings.reduce((sum, earning) => {
        return sum + Number(earning.netAmount);
      }, 0);

      // Update vendor withdrawal balance
      await prisma.vendorProfile.update({
        where: { id: vendorId },
        data: {
          withdrawalBalance: {
            increment: totalToMove
          }
        } as any
      });

      // Mark earnings as moved to withdrawal
      await prisma.vendorEarning.updateMany({
        where: {
          id: {
            in: eligibleEarnings.map(e => e.id)
          }
        },
        data: {
          movedToWithdrawal: true,
          movedToWithdrawalAt: new Date(),
          status: 'PROCESSING'
        } as any
      });
    }

    // Refetch vendor profile to get updated withdrawal balance
    const updatedVendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { withdrawalBalance: true } as any
    });

    const where: any = {
      vendorId
    };

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const earnings = await prisma.vendorEarning.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            createdAt: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.vendorEarning.count({ where });

    // Calculate summary
    const [summary, pendingEarnings, availableForWithdrawal] = await Promise.all([
      prisma.vendorEarning.aggregate({
        where: { vendorId },
        _sum: {
          amount: true,
          commission: true,
          netAmount: true
        }
      }),
      // Pending earnings (all earnings that haven't been moved to withdrawal yet)
      // Since earnings are immediately available, this will be 0 if all are processed
      prisma.vendorEarning.aggregate({
        where: {
          vendorId,
          movedToWithdrawal: false,
          status: { in: ['PENDING', 'PROCESSING'] }
        } as any,
        _sum: {
          netAmount: true
        }
      }),
      prisma.vendorEarning.aggregate({
        where: {
          vendorId,
          movedToWithdrawal: true,
          status: { in: ['PROCESSING', 'PAID'] }
        } as any,
        _sum: {
          netAmount: true
        }
      })
    ]);

    return res.json({
      success: true,
      data: {
        earnings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        summary: {
          totalEarnings: Number(summary._sum.amount || 0),
          totalCommission: Number(summary._sum.commission || 0),
          totalNetAmount: Number(summary._sum.netAmount || 0),
          pendingEarnings: Number(pendingEarnings._sum?.netAmount || 0), // Earnings pending processing (should be 0 if immediately processed)
          withdrawalBalance: Number((updatedVendorProfile as any)?.withdrawalBalance || 0), // Available for withdrawal
          availableForWithdrawal: Number(availableForWithdrawal._sum?.netAmount || 0) // Historical total moved to withdrawal
        }
      }
    });
  } catch (error) {
    console.error('Get vendor earnings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor earnings'
    });
  }
});

// @desc    Get vendor analytics
// @route   GET /api/v1/vendors/analytics
// @access  Private (Vendor)
router.get('/analytics', requireVendor, async (req: any, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const vendorId = req.user.vendorId;

    // Get basic stats
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenue,
      averageRating,
      totalReviews
    ] = await Promise.all([
      prisma.product.count({ where: { vendorId } }),
      prisma.product.count({ where: { vendorId, isActive: true } }),
      prisma.order.count({ where: { vendorId } }),
      prisma.vendorEarning.aggregate({
        where: { vendorId },
        _sum: { netAmount: true }
      }),
      prisma.review.aggregate({
        where: { vendorId },
        _avg: { rating: true }
      }),
      prisma.review.count({ where: { vendorId } })
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { vendorId },
      include: {
        customer: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get top products
    const topProducts = await prisma.product.findMany({
      where: { vendorId },
      include: {
        _count: {
          select: { orderItems: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          activeProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.netAmount || 0,
          averageRating: averageRating._avg.rating || 0,
          totalReviews
        },
        recentOrders,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get vendor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor analytics'
    });
  }
});

// @desc    Get public vendor information (for store page)
// @route   GET /api/v1/vendors/:id/public
// @access  Public
// NOTE: This route must come before the admin routes to avoid conflicts
router.get('/:id/public', async (req: any, res: any) => {
  try {
    const vendorId = req.params.id;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            isVerified: true
          }
        },
        products: {
          where: {
            status: 'APPROVED',
            isActive: true
          },
          select: {
            id: true
          }
        },
        orders: {
          select: {
            id: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            products: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            },
            orders: true,
            reviews: true
          }
        }
      }
    });

    if (!vendor || !(vendor.user as any).isActive) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Calculate average rating
    const avgRating = vendor.reviews.length > 0
      ? vendor.reviews.reduce((sum, r) => sum + r.rating, 0) / vendor.reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        id: vendor.id,
        businessName: vendor.businessName,
        businessType: vendor.businessType,
        description: vendor.description,
        website: vendor.website,
        avgRating: Math.round(avgRating * 10) / 10,
        totalProducts: vendor._count.products,
        totalOrders: vendor._count.orders,
        user: {
          firstName: (vendor.user as any).firstName,
          lastName: (vendor.user as any).lastName,
          email: (vendor.user as any).email
        }
      }
    });
  } catch (error) {
    console.error('Get public vendor info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor information'
    });
  }
});

// @desc    Get all vendors (Admin only)
// @route   GET /api/v1/vendors
// @access  Private (Admin)
router.get('/', requireAdmin, async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const where: any = {};
    
    if (status) {
      where.verificationStatus = status;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search as string, mode: 'insensitive' } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    const vendors = await prisma.vendorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            isVerified: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.vendorProfile.count({ where });

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendors'
    });
  }
});

// @desc    Update vendor verification status
// @route   PATCH /api/v1/vendors/:id/verify
// @access  Private (Admin)
router.patch('/:id/verify', requireAdmin, [
  body('status').isIn(['PENDING', 'VERIFIED', 'REJECTED']),
  body('reason').optional()
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

    const { id } = req.params;
    const { status, reason } = req.body;

    const vendor = await prisma.vendorProfile.update({
      where: { id },
      data: {
        verificationStatus: status
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Create notification for vendor
    await prisma.notification.create({
      data: {
        userId: vendor.userId,
        title: 'Verification Status Updated',
        message: `Your vendor account has been ${status.toLowerCase()}. ${reason || ''}`,
        type: 'SYSTEM_ALERT'
      }
    });

    res.json({
      success: true,
      message: 'Vendor verification status updated',
      data: vendor
    });
  } catch (error) {
    console.error('Update vendor verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor verification'
    });
  }
});

// @desc    Upload vendor document
// @route   POST /api/v1/vendors/documents
// @access  Private (Vendor)
router.post('/documents', requireVendor, documentUpload.single('file'), async (req: any, res: any) => {
  try {
    const { type } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Check if document already exists
    const existingDoc = await prisma.vendorDocument.findFirst({
      where: {
        vendorId: vendorProfile.id,
        type: type as any
      }
    });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file upload'
      });
    }

    const uploadResult = await uploadDocumentToCloudinary(
      req.file.buffer,
      vendorProfile.id,
      type
    );

    let document;
    if (existingDoc) {
      // Update existing document
      if (existingDoc.url) {
        await deleteFromCloudinary(existingDoc.url).catch(() => undefined);
      }

      document = await prisma.vendorDocument.update({
        where: { id: existingDoc.id },
        data: {
          name: req.file.originalname || existingDoc.name,
          url: uploadResult.secure_url,
          status: 'PENDING',
          uploadedAt: new Date()
        }
      });
    } else {
      // Create new document
      document = await prisma.vendorDocument.create({
        data: {
          vendorId: vendorProfile.id,
          name: req.file.originalname,
          type: type as any,
          url: uploadResult.secure_url,
          status: 'PENDING'
        }
      });
    }

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error: any) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document'
    });
  }
});

// @desc    Request withdrawal
// @route   POST /api/v1/vendors/withdraw
// @access  Private (Vendor)
router.post('/withdraw', requireVendor, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
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

    const { amount } = req.body;
    const vendorId = req.user.vendorId;

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        withdrawalBalance: true,
        bankAccountNumber: true,
        bankRoutingNumber: true,
        bankAccountHolderName: true,
        bankName: true,
        stripeAccountId: true
      } as any
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const withdrawalAmount = Number(amount);
    const availableBalance = Number((vendorProfile as any).withdrawalBalance || 0);

    // Check if vendor has sufficient balance
    if (withdrawalAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: £${availableBalance.toFixed(2)}, Requested: £${withdrawalAmount.toFixed(2)}`
      });
    }

    // ========================================
    // MOCK WITHDRAWAL MODE - STRIPE DISABLED
    // ========================================
    // TODO: Uncomment Stripe code below when ready to use real Stripe payouts
    console.log('🧪 MOCK WITHDRAWAL MODE: Processing withdrawal without Stripe');
    
    // Mock transfer ID for testing
    const transferId = `mock_tr_${Date.now()}_${vendorId}`;
    const payoutStatus = 'PROCESSING';
    
    // Decrement withdrawal balance (mock mode - always successful)
    await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: {
        withdrawalBalance: {
          decrement: withdrawalAmount
        }
      } as any
    });

    // ========================================
    // STRIPE CODE (COMMENTED OUT FOR TESTING)
    // ========================================
    /*
    // Check if vendor has Stripe Connect account
    let vendorStripeAccountId = (vendorProfile as any).stripeAccountId;
    
    // Validate Stripe account ID format
    // Stripe account IDs start with 'acct_' and are typically 18-24 characters long
    const isValidStripeAccountId = vendorStripeAccountId && 
      vendorStripeAccountId.startsWith('acct_') && 
      vendorStripeAccountId.length >= 18;
    
    const isPlaceholderAccount = vendorStripeAccountId && !isValidStripeAccountId;

    if (!vendorStripeAccountId || isPlaceholderAccount) {
      // Check if vendor has bank details to create a real Stripe account
      if (!(vendorProfile as any).bankAccountNumber || !(vendorProfile as any).bankRoutingNumber) {
        return res.status(400).json({
          success: false,
          message: 'Stripe account not set up. Please add your banking details in your profile and complete Stripe onboarding to enable payouts.',
          requiresOnboarding: true
        });
      }

      // Try to create a new Stripe Connect account
      try {
        const { createOrGetStripeAccount } = await import('../services/stripeConnect');
        vendorStripeAccountId = await createOrGetStripeAccount(
          vendorId,
          (vendorProfile as any).user?.email || req.user.email,
          (vendorProfile as any).businessName || 'Vendor',
          'GB'
        );

        // Update vendor profile with the new Stripe account ID
        await prisma.vendorProfile.update({
          where: { id: vendorId },
          data: {
            stripeAccountId: vendorStripeAccountId,
            stripeAccountStatus: 'pending'
          } as any
        });

        // Return error asking user to complete onboarding
        return res.status(400).json({
          success: false,
          message: 'A new Stripe Connect account has been created. Please go to your profile page and click "Complete Onboarding" to finish setting up your account before withdrawing funds.',
          requiresOnboarding: true,
          stripeAccountId: vendorStripeAccountId
        });
      } catch (stripeError: any) {
        console.error('Error creating Stripe account:', stripeError);
        return res.status(500).json({
          success: false,
          message: `Failed to create Stripe account: ${stripeError.message}. Please try again or contact support.`,
          requiresOnboarding: true
        });
      }
    }

    // Check if vendor has bank details configured (fallback check)
    if (!(vendorProfile as any).bankAccountNumber || !(vendorProfile as any).bankRoutingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Bank account details are required. Please update your payment credentials in your profile.',
        requiresOnboarding: true
      });
    }

    // Verify Stripe account exists
    // Note: For Stripe Connect Express accounts, transfers to connected accounts require the account to have completed onboarding
    // However, we'll attempt the transfer and let Stripe's API return the specific error if the account isn't ready
    // This provides better error messages to the user
    try {
      // Verify account exists (don't block if not fully verified - let Stripe handle that)
      const { getStripeAccount } = await import('../services/stripeConnect');
      const account = await getStripeAccount(vendorStripeAccountId);
      
      // Log account status for debugging
      const isReadyForPayouts = account.charges_enabled && account.payouts_enabled && account.details_submitted;
      if (!isReadyForPayouts) {
        console.warn(`[WARN] Stripe account ${vendorStripeAccountId} is not fully verified:`, {
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
        });
        console.warn(`[INFO] Proceeding with transfer attempt. Stripe will validate and return specific error if account not ready.`);
      }
    } catch (stripeError: any) {
      console.error('Error checking Stripe account status:', stripeError);
      
      // If account doesn't exist at all, we can't proceed
      if (stripeError.message?.includes('No such account') || stripeError.code === 'resource_missing') {
        return res.status(400).json({
          success: false,
          message: 'Stripe account not found. Please save your bank details in your profile to create a Stripe Connect account, then complete the onboarding process.',
          requiresOnboarding: true
        });
      }
      
      // If we can't verify the account but the account ID exists in our database,
      // proceed with transfer attempt - Stripe API will validate and return appropriate error
      console.warn(`[WARN] Could not verify Stripe account status: ${stripeError.message}`);
      console.warn(`[INFO] Account ID exists in database (${vendorStripeAccountId}), proceeding with transfer attempt.`);
    }

    // Import Stripe payout function
    const { createVendorPayout } = await import('../services/stripeConnect');

    // Create Stripe transfer (payout)
    let transferId: string | null = null;
    let payoutStatus = 'PROCESSING';
    
    try {
      const transfer = await createVendorPayout(
        vendorStripeAccountId,
        withdrawalAmount,
        'gbp',
        {
          vendorId: vendorId,
          vendorName: (vendorProfile as any).bankAccountHolderName || 'Vendor',
          withdrawalAmount: withdrawalAmount.toString()
        }
      );
      
      transferId = transfer.id;
      payoutStatus = transfer.reversed ? 'FAILED' : 'PROCESSING';
      
    } catch (stripeError: any) {
      console.error('Stripe payout error:', stripeError);
      
      // Check if error is due to account not being ready for payouts
      const isAccountNotReady = stripeError.code === 'account_invalid' || 
                                stripeError.message?.includes('account') ||
                                stripeError.message?.includes('onboarding') ||
                                stripeError.message?.includes('not enabled');
      
      // Create notification about the failure
      const errorMessage = isAccountNotReady
        ? `Your Stripe account is not yet ready for payouts. Please complete the onboarding process in your profile to enable withdrawals.`
        : `Your withdrawal request failed. Error: ${stripeError.message}`;
      
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Withdrawal Failed',
          message: errorMessage,
          type: 'SYSTEM_ALERT'
        }
      });

      return res.status(500).json({
        success: false,
        message: isAccountNotReady
          ? `Your Stripe account is not yet ready for payouts. Please go to your profile page and click "Complete Onboarding" to finish setting up your Stripe Connect account.`
          : `Payout failed: ${stripeError.message}. Your balance has not been deducted.`,
        requiresOnboarding: isAccountNotReady,
        stripeError: stripeError.message
      });
    }

    // Only decrement balance if Stripe transfer was successful
    if (payoutStatus !== 'FAILED') {
      // Update withdrawal balance
      await prisma.vendorProfile.update({
        where: { id: vendorId },
        data: {
          withdrawalBalance: {
            decrement: withdrawalAmount
          }
        } as any
      });
    }
    */

    // Create withdrawal record in notification (we'll parse this for the transactions page)
    const isMockMode = transferId && transferId.startsWith('mock_');
    const mockPrefix = isMockMode ? '[MOCK MODE] ' : '';
    const withdrawalData = {
      amount: withdrawalAmount,
      transferId: transferId,
      status: payoutStatus,
      estimatedArrival: '1-2 business days',
      processedAt: new Date().toISOString(),
      mockMode: isMockMode
    };
    
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Withdrawal Request',
        message: JSON.stringify({
          type: 'withdrawal',
          ...withdrawalData,
          displayMessage: `${mockPrefix}Your withdrawal request of £${withdrawalAmount.toFixed(2)} has been processed${transferId ? ` (Transfer ID: ${transferId})` : ''}. Funds should arrive in your bank account within 1-2 business days.`
        }),
        type: 'PAYMENT_RECEIVED'
      }
    });

    console.log(`✅ MOCK WITHDRAWAL: Successfully processed withdrawal of £${withdrawalAmount.toFixed(2)} for vendor ${vendorId}`);

    res.json({
      success: true,
      message: 'Withdrawal processed successfully',
      data: {
        amount: withdrawalAmount,
        remainingBalance: availableBalance - withdrawalAmount,
        status: payoutStatus,
        transferId: transferId,
        estimatedArrival: '1-2 business days',
        mockMode: transferId?.startsWith('mock_') ? true : undefined // Flag to indicate mock mode
      }
    });
  } catch (error: any) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process withdrawal request'
    });
  }
});

// @desc    Create Stripe Connect account link for onboarding
// @route   POST /api/v1/vendors/stripe-onboarding
// @access  Private (Vendor)
router.post('/stripe-onboarding', requireVendor, async (req: any, res: any) => {
  try {
    const vendorId = req.user.vendorId;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    }) as any;

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    let stripeAccountId = vendorProfile.stripeAccountId;

    // Validate Stripe account ID format
    // Stripe account IDs start with 'acct_' and are typically 18-24 characters long
    const isValidStripeAccountId = stripeAccountId && 
      stripeAccountId.startsWith('acct_') && 
      stripeAccountId.length >= 18;
    
    const isPlaceholderAccount = stripeAccountId && !isValidStripeAccountId;

    // Create Stripe account if it doesn't exist or is a placeholder
    if (!stripeAccountId || isPlaceholderAccount) {
      try {
        stripeAccountId = await createOrGetStripeAccount(
          vendorId,
          vendorProfile.user.email,
          vendorProfile.businessName || 'Vendor',
          'GB'
        );

        // Update vendor profile with the new Stripe account ID
        await prisma.vendorProfile.update({
          where: { id: vendorId },
          data: {
            stripeAccountId,
            stripeAccountStatus: 'pending'
          } as any
        });
      } catch (stripeError: any) {
        console.error('Error creating Stripe account during onboarding:', stripeError);
        return res.status(500).json({
          success: false,
          message: `Failed to create Stripe account: ${stripeError.message}. Please ensure your Stripe API keys are correctly configured.`
        });
      }
    }

    // Create account link for onboarding
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:8083';
    const onboardingUrl = await createAccountLink(
      stripeAccountId,
      `${baseUrl}/vendor/profile?refresh=true`,
      `${baseUrl}/vendor/profile?success=true`
    );

    res.json({
      success: true,
      message: 'Stripe onboarding URL created',
      data: {
        onboardingUrl,
        stripeAccountId
      }
    });
  } catch (error: any) {
    console.error('Stripe onboarding error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create Stripe onboarding URL'
    });
  }
});

// @desc    Get withdrawal transactions
// @route   GET /api/v1/vendors/withdrawals
// @access  Private (Vendor)
router.get('/withdrawals', requireVendor, async (req: any, res: any) => {
  try {
    const vendorId = req.user.vendorId;
    const { page = 1, limit = 20, status } = req.query;
    const pageNumber = parseInt(page as string);
    const pageLimit = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageLimit;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    // Query notifications for withdrawal requests
    const where: any = {
      userId: req.user.id,
      title: 'Withdrawal Request',
      type: 'PAYMENT_RECEIVED'
    };

    // Get all withdrawal notifications (for summary calculation)
    const allNotifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse withdrawal data from all notifications
    const allWithdrawals = allNotifications
      .map(notification => {
        try {
          const data = JSON.parse(notification.message);
          if (data.type === 'withdrawal') {
            return {
              id: notification.id,
              amount: data.amount,
              status: data.status || 'PROCESSING',
              transferId: data.transferId,
              estimatedArrival: data.estimatedArrival,
              processedAt: data.processedAt || notification.createdAt,
              createdAt: notification.createdAt,
              mockMode: data.mockMode || false
            };
          }
          return null;
        } catch (error) {
          // Fallback: try to parse from old format
          const message = notification.message;
          const amountMatch = message.match(/£([\d,]+\.?\d*)/);
          const transferIdMatch = message.match(/Transfer ID: ([^\s\)]+)/);
          
          if (amountMatch) {
            return {
              id: notification.id,
              amount: parseFloat(amountMatch[1].replace(/,/g, '')),
              status: 'PROCESSING',
              transferId: transferIdMatch ? transferIdMatch[1] : null,
              estimatedArrival: '1-2 business days',
              processedAt: notification.createdAt,
              createdAt: notification.createdAt,
              mockMode: message.includes('MOCK MODE')
            };
          }
          return null;
        }
      })
      .filter(w => w !== null) as Array<{
        id: string;
        amount: number;
        status: string;
        transferId: string | null;
        estimatedArrival: string;
        processedAt: string | Date;
        createdAt: Date;
        mockMode: boolean;
      }>;

    // Filter by status if provided
    const filteredWithdrawals = status 
      ? allWithdrawals.filter(w => w.status.toLowerCase() === status.toLowerCase())
      : allWithdrawals;

    // Sort filtered withdrawals by date (newest first)
    filteredWithdrawals.sort((a, b) => {
      const dateA = new Date(a.processedAt).getTime();
      const dateB = new Date(b.processedAt).getTime();
      return dateB - dateA;
    });

    // Paginate filtered withdrawals
    const paginatedWithdrawals = filteredWithdrawals.slice(skip, skip + pageLimit);

    // Get total count of filtered withdrawals
    const totalCount = filteredWithdrawals.length;

    // Calculate totals from all withdrawals (not just filtered)
    const totalWithdrawn = allWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    const pendingWithdrawals = allWithdrawals.filter(w => w.status === 'PROCESSING').length;
    const completedWithdrawals = allWithdrawals.filter(w => w.status === 'COMPLETED').length;

    res.json({
      success: true,
      data: {
        withdrawals: paginatedWithdrawals.map(w => ({
          id: w.id,
          amount: w.amount,
          status: w.status,
          transferId: w.transferId,
          estimatedArrival: w.estimatedArrival,
          processedAt: w.processedAt instanceof Date ? w.processedAt.toISOString() : (typeof w.processedAt === 'string' ? w.processedAt : new Date(w.processedAt).toISOString()),
          createdAt: w.createdAt instanceof Date ? w.createdAt.toISOString() : new Date(w.createdAt).toISOString(),
          mockMode: w.mockMode
        })),
        pagination: {
          page: pageNumber,
          limit: pageLimit,
          total: totalCount,
          pages: Math.ceil(totalCount / pageLimit)
        },
        summary: {
          totalWithdrawn,
          pendingWithdrawals,
          completedWithdrawals,
          totalTransactions: allWithdrawals.length
        }
      }
    });
  } catch (error: any) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get withdrawal transactions'
    });
  }
});

export default router;
