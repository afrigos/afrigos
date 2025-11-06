import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { requireVendor, requireAdmin } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const documentUpload = multer({ 
  storage: documentStorage,
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
            isVerified: true
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

    res.json({
      success: true,
      data: vendor
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
  body('description').trim().optional(),
  body('website').isURL().optional(),
  body('foundedYear').isNumeric().optional(),
  body('employees').trim().optional(),
  body('revenue').trim().optional()
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
      categoryId
    } = req.body;

    // Check if vendor profile already exists
    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });

    let vendor;
    if (existingProfile) {
      // Update existing profile
      const updateData: any = {
        businessName,
        businessType,
        businessNumber,
        taxId,
        description,
        website,
        foundedYear,
        employees,
        revenue,
        socialMedia: socialMedia ? JSON.parse(socialMedia) : null
      };
      
      // Note: categoryId is stored at the product level, not vendor profile level
      // We'll handle this when vendor creates products
      
      vendor = await prisma.vendorProfile.update({
        where: { userId: req.user.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true
            }
          }
        }
      });
    } else {
      // Create new profile
      vendor = await prisma.vendorProfile.create({
        data: {
          userId: req.user.id,
          businessName,
          businessType,
          businessNumber,
          taxId,
          description,
          website,
          foundedYear,
          employees,
          revenue,
          socialMedia: socialMedia ? JSON.parse(socialMedia) : null
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true
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
router.get('/earnings', requireVendor, async (req: any, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const where: any = {
      vendorId: req.user.vendorId
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
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.vendorEarning.count({ where });

    // Calculate summary
    const summary = await prisma.vendorEarning.aggregate({
      where: { vendorId: req.user.vendorId },
      _sum: {
        amount: true,
        commission: true,
        netAmount: true
      }
    });

    res.json({
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
          totalEarnings: summary._sum.amount || 0,
          totalCommission: summary._sum.commission || 0,
          totalNetAmount: summary._sum.netAmount || 0
        }
      }
    });
  } catch (error) {
    console.error('Get vendor earnings error:', error);
    res.status(500).json({
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

    let document;
    if (existingDoc) {
      // Update existing document
      document = await prisma.vendorDocument.update({
        where: { id: existingDoc.id },
        data: {
          url: `/uploads/documents/${req.file.filename}`,
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
          url: `/uploads/documents/${req.file.filename}`,
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

export default router;
