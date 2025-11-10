import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireVendor } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const DEFAULT_COMMISSION_PERCENT = 10;
const DEFAULT_COMMISSION_RATE = DEFAULT_COMMISSION_PERCENT / 100;

const createEmptyDashboardData = () => ({
  overview: {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    avgRating: 0,
    growthRate: 0,
    orderGrowth: 0,
    productGrowth: 0,
    ratingGrowth: 0
  },
  recentOrders: [],
  topProducts: [],
  orderStatuses: {}
});

const createEmptyAnalyticsData = () => ({
  overview: {
    totalRevenue: 0,
    netRevenue: 0,
    totalOrders: 0,
    avgRating: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    repeatCustomers: 0,
    newCustomers: 0
  },
  sales: {
    daily: [],
    monthly: []
  },
  topProducts: [],
  categoryPerformance: [],
  customerInsights: {
    repeatCustomers: 0,
    newCustomers: 0,
    avgOrderValue: 0,
    customerSatisfaction: 0,
    topCustomerSegments: []
  },
  commission: {
    totalCommission: 0,
    effectiveRate: DEFAULT_COMMISSION_PERCENT,
    breakdown: []
  }
});

async function getOrCreateVendorProfile(user: any) {
  const existingProfile = await prisma.vendorProfile.findUnique({
    where: { userId: user.id }
  });

  if (existingProfile) {
    return { profile: existingProfile, newlyCreated: false };
  }

  const safeFirstName = user.firstName?.trim() || 'Vendor';
  const safeLastName = user.lastName?.trim() || 'User';

  const newProfile = await prisma.vendorProfile.create({
    data: {
      userId: user.id,
      businessName: `${safeFirstName} ${safeLastName}'s Store`,
      businessType: 'Individual',
      description: 'New vendor on AfriGos platform'
    }
  });

  return { profile: newProfile, newlyCreated: true };
}

// Get vendor dashboard data
router.get('/dashboard', authenticate, requireVendor, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    // First check if user has a vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!vendorProfile) {
      // If no vendor profile exists, create a basic one
      try {
        // Ensure we have valid names before creating business name
        const safeFirstName = req.user.firstName?.trim() || 'Vendor';
        const safeLastName = req.user.lastName?.trim() || 'User';
        
        const newVendorProfile = await prisma.vendorProfile.create({
          data: {
            userId: userId,
            businessName: `${safeFirstName} ${safeLastName}'s Store`,
            businessType: 'Individual',
            description: 'New vendor on AfriGos platform'
          }
        });

        // Return empty dashboard for new vendor
        return res.json({
          success: true,
          data: {
            overview: {
              totalRevenue: 0,
              totalOrders: 0,
              totalProducts: 0,
              avgRating: 0,
              growthRate: 0,
              orderGrowth: 0,
              productGrowth: 0,
              ratingGrowth: 0
            },
            recentOrders: [],
            topProducts: [],
            orderStatuses: {}
          }
        });
      } catch (createError) {
        console.error('Error creating vendor profile:', createError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create vendor profile'
        });
      }
    }

    // Calculate date ranges for comparison
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get vendor's products
    const products = await prisma.product.findMany({
      where: { vendorId: vendorProfile.id },
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    });

    // Get vendor's orders
    const orders = await prisma.order.findMany({
      where: { vendorId: vendorProfile.id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total revenue from completed orders
    const totalRevenueResult = await prisma.orderItem.aggregate({
      where: {
        order: {
          vendorId: vendorProfile.id,
          paymentStatus: 'COMPLETED'
        }
      },
      _sum: {
        total: true
      }
    });

    // Calculate current month revenue
    const currentMonthRevenueResult = await prisma.orderItem.aggregate({
      where: {
        order: {
          vendorId: vendorProfile.id,
          paymentStatus: 'COMPLETED',
          createdAt: {
            gte: currentMonthStart
          }
        }
      },
      _sum: {
        total: true
      }
    });

    // Calculate last month revenue
    const lastMonthRevenueResult = await prisma.orderItem.aggregate({
      where: {
        order: {
          vendorId: vendorProfile.id,
          paymentStatus: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        }
      },
      _sum: {
        total: true
      }
    });

    // Calculate average rating
    const ratingResult = await prisma.review.aggregate({
      where: {
        vendorId: vendorProfile.id
      },
      _avg: {
        rating: true
      }
    });

    // Get order status counts
    const orderStatusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: { vendorId: vendorProfile.id },
      _count: {
        status: true
      }
    });

    // Get top products by revenue
    const topProducts = await prisma.product.findMany({
      where: { vendorId: vendorProfile.id },
      include: {
        _count: {
          select: { orderItems: true }
        }
      },
      take: 5
    });

    // Calculate revenue and ratings for each product separately
    const topProductsWithStats = await Promise.all(topProducts.map(async (product) => {
      const revenueResult = await prisma.orderItem.aggregate({
        where: {
          productId: product.id,
          order: {
            paymentStatus: 'COMPLETED'
          }
        },
        _sum: {
          total: true
        }
      });

      const ratingResult = await prisma.review.aggregate({
        where: {
          productId: product.id
        },
        _avg: {
          rating: true
        }
      });

      return {
        ...product,
        revenue: revenueResult._sum.total || 0,
        rating: ratingResult._avg.rating || 0
      };
    }));

    // Sort by revenue
    topProductsWithStats.sort((a: any, b: any) => Number(b.revenue) - Number(a.revenue));

    // Calculate growth rates
    const currentRevenue = Number(currentMonthRevenueResult._sum.total || 0);
    const lastRevenue = Number(lastMonthRevenueResult._sum.total || 0);
    const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    // Get current month orders count
    const currentMonthOrders = await prisma.order.count({
      where: {
        vendorId: vendorProfile.id,
        createdAt: {
          gte: currentMonthStart
        }
      }
    });

    // Get last month orders count
    const lastMonthOrders = await prisma.order.count({
      where: {
        vendorId: vendorProfile.id,
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      }
    });

    const orderGrowth = lastMonthOrders > 0 ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;

    // Transform data for frontend
    const dashboardData = {
      overview: {
        totalRevenue: Number(totalRevenueResult._sum.total || 0),
        totalOrders: orders.length,
        totalProducts: products.length,
        avgRating: Math.round((ratingResult._avg.rating || 0) * 10) / 10,
        growthRate: Math.round(revenueGrowth * 10) / 10,
        orderGrowth: Math.round(orderGrowth * 10) / 10,
        productGrowth: 0, // Could be calculated based on product creation dates
        ratingGrowth: 0 // Could be calculated based on review trends
      },
      recentOrders: orders.slice(0, 5).map((order: any) => ({
        id: order.id,
        customer: `${order.customer.firstName} ${order.customer.lastName}`,
        products: order.orderItems.map((item: any) => item.product.name),
        total: `£${(order.totalAmount).toFixed(2)}`,
        status: order.status.toLowerCase(),
        date: order.createdAt.toISOString().split('T')[0],
        time: order.createdAt.toTimeString().split(' ')[0].substring(0, 5)
      })),
      topProducts: topProductsWithStats.map(product => ({
        name: product.name,
        sales: product._count.orderItems,
        revenue: Number(product.revenue),
        rating: Math.round((product.rating || 0) * 10) / 10,
        growth: 0 // Could be calculated based on historical data
      })),
      orderStatuses: orderStatusCounts.reduce((acc, status) => {
        acc[status.status.toLowerCase()] = status._count.status;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching vendor dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

export default router;
