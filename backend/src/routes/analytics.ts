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
      productPerformance
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          vendorId,
          paymentStatus: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: { totalAmount: true }
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
        where: {
          vendorId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
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
        take: 10
      }),
      prisma.orderItem.findMany({
        where: {
          product: {
            vendorId
          },
          order: {
            createdAt: {
              gte: startDate,
              lte: endDate
            },
            paymentStatus: 'COMPLETED'
          }
        },
        select: {
          productId: true,
          total: true,
          product: {
            select: {
              name: true,
              price: true,
              status: true
            }
          }
        }
      })
    ]);

    const topProductsMap = new Map<string, { name: string; price: number; status: string | null; orders: number; revenue: number }>();

    for (const item of productPerformance) {
      if (!item.productId) continue;
      const existing = topProductsMap.get(item.productId) ?? {
        name: item.product?.name ?? "Unknown product",
        price: Number(item.product?.price ?? 0),
        status: item.product?.status ?? null,
        orders: 0,
        revenue: 0
      };
      existing.orders += 1;
      existing.revenue += Number(item.total ?? 0);
      topProductsMap.set(item.productId, existing);
    }

    const topProducts = Array.from(topProductsMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .filter((product) => product.orders > 0)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        period,
        overview: {
          totalRevenue: totalRevenue._sum.totalAmount || 0,
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

const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return 0;
};

// @desc    Get vendor detailed reports
// @route   GET /api/v1/analytics/vendor/reports
// @access  Private (Vendor)
router.get('/vendor/reports', async (req: any, res: any) => {
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

    const [orders, earnings, statusCounts] = await Promise.all([
      prisma.order.findMany({
        where: {
          vendorId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  category: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vendorEarning.aggregate({
        where: {
          vendorId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true,
          commission: true,
          netAmount: true
        }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: {
          vendorId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          _all: true
        }
      })
    ]);

    const completedOrders = orders.filter((order) => order.paymentStatus === 'COMPLETED');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + toNumber(order.totalAmount), 0);
    const shippingCostTotal = orders.reduce((sum, order) => sum + toNumber(order.shippingCost), 0);
    const pendingOrdersValue = orders
      .filter((order) => order.status !== 'DELIVERED')
      .reduce((sum, order) => sum + toNumber(order.totalAmount), 0);

    const revenueTrendMap = new Map<string, { revenue: number; orders: number }>();
    const statusRevenueMap = new Map<string, { count: number; revenue: number }>();
    const productMap = new Map<string, { id: string; name: string; revenue: number; orders: number; price: number; category: string | null }>();
    const categoryMap = new Map<string, { category: string; revenue: number; orders: number; products: Set<string> }>();
    const customerMap = new Map<string, { id: string; name: string; email: string; orders: number; totalSpent: number }>();

    for (const order of orders) {
      const orderTotal = toNumber(order.totalAmount);
      const shippingCost = toNumber(order.shippingCost);
      const createdAt = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
      const dateKey = createdAt.toISOString().split('T')[0];
      const statusKey = order.status || 'PENDING';
      const customerId = order.customerId || `guest-${order.id}`;
      const customerName = [order.customer?.firstName, order.customer?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || order.customer?.email || 'Customer';
      const customerEmail = order.customer?.email ?? 'Not provided';

      if (!revenueTrendMap.has(dateKey)) {
        revenueTrendMap.set(dateKey, { revenue: 0, orders: 0 });
      }

      if (!statusRevenueMap.has(statusKey)) {
        statusRevenueMap.set(statusKey, { count: 0, revenue: 0 });
      }

      const statusEntry = statusRevenueMap.get(statusKey)!;
      statusEntry.count += 1;
      if (order.paymentStatus === 'COMPLETED') {
        statusEntry.revenue += orderTotal;
        const trendEntry = revenueTrendMap.get(dateKey)!;
        trendEntry.revenue += orderTotal;
        trendEntry.orders += 1;
      }

      const existingCustomer = customerMap.get(customerId) ?? {
        id: customerId,
        name: customerName,
        email: customerEmail,
        orders: 0,
        totalSpent: 0
      };
      existingCustomer.orders += 1;
      if (order.paymentStatus === 'COMPLETED') {
        existingCustomer.totalSpent += orderTotal;
      }
      customerMap.set(customerId, existingCustomer);

      for (const item of order.orderItems) {
        const productId = item.productId || `unknown-${order.id}-${Math.random()}`;
        const itemRevenue = toNumber(item.total);
        const quantity = item.quantity ?? 0;
        const productName = item.product?.name ?? 'Product';
        const productPrice = toNumber(item.product?.price);
        const categoryName = item.product?.category?.name ?? 'Uncategorised';

        const productEntry = productMap.get(productId) ?? {
          id: productId,
          name: productName,
          revenue: 0,
          orders: 0,
          price: productPrice,
          category: categoryName
        };
        productEntry.revenue += itemRevenue;
        productEntry.orders += quantity;
        productEntry.price = productPrice;
        productEntry.category = categoryName;
        productMap.set(productId, productEntry);

        const categoryEntry = categoryMap.get(categoryName) ?? {
          category: categoryName,
          revenue: 0,
          orders: 0,
          products: new Set<string>()
        };
        categoryEntry.revenue += itemRevenue;
        categoryEntry.orders += quantity;
        categoryEntry.products.add(productId);
        categoryMap.set(categoryName, categoryEntry);
      }
    }

    const uniqueCustomers = Array.from(customerMap.values());
    const repeatCustomers = uniqueCustomers.filter((customer) => customer.orders > 1).length;
    const repeatCustomerRate = uniqueCustomers.length > 0 ? (repeatCustomers / uniqueCustomers.length) * 100 : 0;
    const completedOrdersCount = completedOrders.length;
    const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

    const statusBreakdown = Array.from(statusRevenueMap.entries()).map(([status, entry]) => ({
      status,
      count: entry.count,
      revenue: entry.revenue
    }));

    const revenueTrend = Array.from(revenueTrendMap.entries())
      .map(([date, entry]) => ({
        date,
        revenue: entry.revenue,
        orders: entry.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const categoryPerformance = Array.from(categoryMap.values()).map((entry) => ({
      category: entry.category,
      revenue: entry.revenue,
      orders: entry.orders,
      products: entry.products.size
    }));

    const topCustomers = uniqueCustomers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const recentOrders = orders.slice(0, 10).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber ?? order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      totalAmount: toNumber(order.totalAmount),
      customerName:
        [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ').trim() ||
        order.customer?.email ||
        'Customer'
    }));

    const overview = {
      totalRevenue,
      totalOrders: orders.length,
      completedOrders: completedOrdersCount,
      totalCustomers: uniqueCustomers.length,
      repeatCustomerRate,
      averageOrderValue,
      shippingCostTotal,
      pendingOrdersValue,
      commissionTotal: toNumber(earnings._sum.commission),
      netRevenue: toNumber(earnings._sum.netAmount),
      grossEarnings: toNumber(earnings._sum.amount)
    };

    res.json({
      success: true,
      data: {
        period,
        generatedAt: new Date().toISOString(),
        overview,
        revenueTrend,
        statusBreakdown,
        topProducts,
        categoryPerformance,
        topCustomers,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get vendor reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor reports'
    });
  }
});

export default router;
