import { Router } from 'express';
import { PrismaClient, NotificationType, Prisma } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { sendProductApprovalEmail } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();

const productSummaryInclude = {
  vendor: {
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  },
  category: true,
  reviews: {
    select: {
      rating: true
    }
  },
  orderItems: {
    select: {
      quantity: true,
      total: true
    }
  }
} satisfies Prisma.ProductInclude;

type ProductSummary = Prisma.ProductGetPayload<{ include: typeof productSummaryInclude }>;

const productDetailInclude = {
  vendor: {
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  },
  category: true,
  reviews: {
    select: {
      rating: true,
      comment: true,
      createdAt: true
    }
  },
  orderItems: {
    select: {
      quantity: true,
      total: true,
      order: {
        select: { createdAt: true }
      }
    }
  }
} satisfies Prisma.ProductInclude;

type ProductDetail = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

const productStatusInclude = {
  vendor: {
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  },
  category: true
} satisfies Prisma.ProductInclude;

type ProductStatusPayload = Prisma.ProductGetPayload<{ include: typeof productStatusInclude }>;

// @desc    Get all products for admin approval
// @route   GET /api/v1/admin/products
// @access  Private (Admin)
router.get('/', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, status, search, vendorId, categoryId } = req.query;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      include: productSummaryInclude,
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total count
    const total = await prisma.product.count({ where });

    // Calculate stats for each product
    const productsWithStats = products.map((product: ProductSummary) => {
      const totalSales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = product.orderItems.reduce((sum, item) => sum + Number(item.total), 0);
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
        : 0;
      const category = (product.category as any) || null;
      const commissionRateValue = (product as any).commissionRate ?? null;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        sku: product.sku,
        stock: product.stock,
        status: product.status,
        sourcing: product.sourcing,
        images: product.images,
        category: category
          ? {
              id: category.id,
              name: category.name,
              commissionRate: category.commissionRate ? Number(category.commissionRate) : null
            }
          : null,
        commissionRate: commissionRateValue ? Number(commissionRateValue) : null,
        vendor: {
          id: product.vendor.id,
          businessName: product.vendor.businessName,
          user: product.vendor.user
        },
        totalSales,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        products: productsWithStats,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// @desc    Get single product for admin review
// @route   GET /api/v1/admin/products/:id
// @access  Private (Admin)
router.get('/:id', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: productDetailInclude
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate stats
    const totalSales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = product.orderItems.reduce((sum, item) => sum + Number(item.total), 0);
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
      : 0;

    res.json({
      success: true,
      data: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        commissionRate: (product as any)?.commissionRate
          ? Number((product as any).commissionRate)
          : null,
        category: (product.category as any)
          ? {
              id: (product.category as any).id,
              name: (product.category as any).name,
              commissionRate: (product.category as any).commissionRate
                ? Number((product.category as any).commissionRate)
                : null
            }
          : null,
        vendor: {
          id: product.vendor.id,
          businessName: product.vendor.businessName,
          user: product.vendor.user
        },
        totalSales,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length
      }
    });
  } catch (error) {
    console.error('Get admin product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// @desc    Approve, reject, or request changes for product
// @route   PUT /api/v1/admin/products/:id/status
// @access  Private (Admin)
router.put('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['APPROVED', 'REJECTED', 'DRAFT']).withMessage('Status must be APPROVED, REJECTED, or DRAFT'),
  body('reason').optional().isString().withMessage('Reason must be a string')
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: productStatusInclude
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product status
    const updateData: any = {
      status,
      isActive: status === 'APPROVED'
    };
    
    // Store rejection reason if product is rejected
    if (status === 'REJECTED' && reason) {
      updateData.rejectionReason = reason;
    } else if (status === 'APPROVED') {
      // Clear rejection reason when approved
      updateData.rejectionReason = null;
    } else if (status === 'DRAFT' && reason) {
      // Store review note for draft (request changes)
      // Note: We can store this in rejectionReason or a separate field
      // For now, storing in rejectionReason so vendors can see what needs to be changed
      updateData.rejectionReason = reason;
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: productStatusInclude
    });

    // Create notification for vendor
    let notificationType: NotificationType;
    let notificationTitle: string;
    let notificationMessage: string;
    
    if (status === 'APPROVED') {
      notificationType = NotificationType.PRODUCT_APPROVED;
      notificationTitle = 'Product approved';
      notificationMessage = `Your product "${product.name}" has been approved.${reason ? ` Note: ${reason}` : ''}`;
    } else if (status === 'REJECTED') {
      notificationType = NotificationType.PRODUCT_REJECTED;
      notificationTitle = 'Product rejected';
      notificationMessage = `Your product "${product.name}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`;
    } else {
      // DRAFT - Request changes
      notificationType = NotificationType.PRODUCT_REJECTED; // Using same type for now, or create a new one
      notificationTitle = 'Changes requested';
      notificationMessage = `Changes have been requested for your product "${product.name}".${reason ? ` Please review: ${reason}` : ''}`;
    }
    
    await prisma.notification.create({
      data: {
        userId: product.vendor.userId,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        isRead: false
      }
    });

    // Send email notification to vendor
    if (product.vendor.user) {
      try {
        await sendProductApprovalEmail({
          email: product.vendor.user.email,
          firstName: product.vendor.user.firstName,
          productName: product.name,
          status: status as 'APPROVED' | 'REJECTED' | 'DRAFT',
          reason: reason || undefined,
          productId: product.id
        });
      } catch (emailError: any) {
        console.error('Failed to send product approval email:', emailError);
        // Don't fail status update if email fails, but log it
      }
    }

    res.json({
      success: true,
      message: `Product ${status.toLowerCase()} successfully`,
      data: {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        comparePrice: updatedProduct.comparePrice ? Number(updatedProduct.comparePrice) : null,
        category: (updatedProduct.category as any)
          ? {
              id: (updatedProduct.category as any).id,
              name: (updatedProduct.category as any).name,
              commissionRate: (updatedProduct.category as any).commissionRate
                ? Number((updatedProduct.category as any).commissionRate)
                : null
            }
          : null,
        vendor: {
          id: updatedProduct.vendor.id,
          businessName: updatedProduct.vendor.businessName,
          user: updatedProduct.vendor.user
        }
      }
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status'
    });
  }
});

// @desc    Update product commission rate
// @route   PUT /api/v1/admin/products/:id/commission
// @access  Private (Admin)
router.put('/:id/commission', authenticate, requireAdmin, [
  body('commissionRate')
    .optional({ values: 'null' })
    .custom((value) => value === null || (typeof value === 'number' && value >= 0 && value <= 100))
    .withMessage('Commission rate must be between 0 and 100')
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
    const { commissionRate } = req.body;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        commissionRate: commissionRate === null || commissionRate === undefined
          ? null
          : new Prisma.Decimal(commissionRate)
      } as any,
      include: {
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        category: true
      }
    });

    res.json({
      success: true,
      message: 'Commission rate updated successfully',
      data: {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        comparePrice: updatedProduct.comparePrice ? Number(updatedProduct.comparePrice) : null,
        commissionRate: (updatedProduct as any)?.commissionRate
          ? Number((updatedProduct as any).commissionRate)
          : null
      }
    });
  } catch (error) {
    console.error('Update product commission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product commission rate'
    });
  }
});

// @desc    Get product approval statistics
// @route   GET /api/v1/admin/products/stats
// @access  Private (Admin)
router.get('/stats', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const totalProducts = await prisma.product.count();
    const pendingProducts = await prisma.product.count({ where: { status: 'PENDING' } });
    const approvedProducts = await prisma.product.count({ where: { status: 'APPROVED' } });
    const rejectedProducts = await prisma.product.count({ where: { status: 'REJECTED' } });

    // Get products by sourcing type
    const inHouseProducts = await prisma.product.count({ where: { sourcing: 'IN_HOUSE' } });
    const outsourcedProducts = await prisma.product.count({ where: { sourcing: 'OUTSOURCED' } });

    // Get recent products (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProducts = await prisma.product.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        pendingProducts,
        approvedProducts,
        rejectedProducts,
        inHouseProducts,
        outsourcedProducts,
        recentProducts
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics'
    });
  }
});

export default router;
