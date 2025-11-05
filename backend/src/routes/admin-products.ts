import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// @desc    Get all products for admin approval
// @route   GET /api/v1/admin/products
// @access  Private (Admin)
router.get('/', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, status, search, vendorId } = req.query;

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

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
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
        category: {
          select: { name: true }
        },
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
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total count
    const total = await prisma.product.count({ where });

    // Calculate stats for each product
    const productsWithStats = products.map((product: any) => {
      const totalSales = product.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const totalRevenue = product.orderItems.reduce((sum: number, item: any) => sum + Number(item.total), 0);
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
        : 0;

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
        category: product.category,
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
          pages: Math.ceil(total / parseInt(limit as string))
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
        category: {
          select: { name: true }
        },
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
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate stats
    const totalSales = product.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const totalRevenue = product.orderItems.reduce((sum: number, item: any) => sum + Number(item.total), 0);
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
      : 0;

    res.json({
      success: true,
      data: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        category: product.category,
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

// @desc    Approve or reject product
// @route   PUT /api/v1/admin/products/:id/status
// @access  Private (Admin)
router.put('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
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
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        status,
        isActive: status === 'APPROVED'
      },
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
        category: {
          select: { name: true }
        }
      }
    });

    // Create notification for vendor
    const notificationType = status === 'APPROVED' ? 'PRODUCT_APPROVED' : 'PRODUCT_REJECTED';
    await prisma.notification.create({
      data: {
        userId: product.vendor.userId,
        title: `Product ${status.toLowerCase()}`,
        message: `Your product "${product.name}" has been ${status.toLowerCase()}.${reason ? ` Reason: ${reason}` : ''}`,
        type: notificationType,
        isRead: false
      }
    });

    res.json({
      success: true,
      message: `Product ${status.toLowerCase()} successfully`,
      data: {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        comparePrice: updatedProduct.comparePrice ? Number(updatedProduct.comparePrice) : null,
        category: updatedProduct.category?.name || 'Uncategorized',
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
