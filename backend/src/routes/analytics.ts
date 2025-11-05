import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get platform analytics
// @route   GET /api/v1/analytics
// @access  Private
router.get('/', async (req: any, res) => {
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

    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      revenueByMonth,
      ordersByStatus,
      topProducts,
      recentActivity
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { amount: true }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.product.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.payment.groupBy({
        by: ['createdAt'],
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { amount: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      prisma.product.findMany({
        include: {
          vendor: {
            select: {
              businessName: true
            }
          },
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy: {
          orderItems: {
            _count: 'desc'
          }
        },
        take: 10
      }),
      prisma.order.findMany({
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          vendor: {
            select: {
              businessName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        period,
        overview: {
          totalRevenue: totalRevenue._sum.amount || 0,
          totalOrders,
          totalUsers,
          totalProducts
        },
        revenueByMonth,
        ordersByStatus,
        topProducts,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
});

// @desc    Get vendor analytics
// @route   GET /api/v1/analytics/vendor
// @access  Private (Vendor)
router.get('/vendor', async (req: any, res: any) => {
  try {
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        success: false,
        message: 'Vendor access required'
      });
    }

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

    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      averageRating,
      recentOrders,
      topProducts
    ] = await Promise.all([
      prisma.vendorEarning.aggregate({
        where: {
          vendorId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { netAmount: true }
      }),
      prisma.order.count({
        where: {
          vendorId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.product.count({
        where: {
          vendorId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.review.aggregate({
        where: { vendorId },
        _avg: { rating: true }
      }),
      prisma.order.findMany({
        where: { vendorId },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.product.findMany({
        where: { vendorId },
        include: {
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy: {
          orderItems: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        period,
        overview: {
          totalRevenue: totalRevenue._sum.netAmount || 0,
          totalOrders,
          totalProducts,
          averageRating: averageRating._avg.rating || 0
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

export default router;
