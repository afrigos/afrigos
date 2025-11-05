import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get admin dashboard data
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      vendorStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendorProfile.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.order.findMany({
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          vendor: {
            select: {
              businessName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
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
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.vendorProfile.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
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
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.amount || 0
        },
        recentOrders,
        topProducts,
        vendorStats
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const where: any = {};
    
    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        vendorProfile: {
          select: {
            businessName: true,
            verificationStatus: true
          }
        },
        adminProfile: {
          select: {
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// @desc    Update user status
// @route   PATCH /api/v1/admin/users/:id/status
// @access  Private (Admin)
router.patch('/users/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: 'User status updated',
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// @desc    Get all vendors
// @route   GET /api/v1/admin/vendors
// @access  Private (Admin)
router.get('/vendors', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const where: any = {
      role: 'VENDOR'
    };
    
    if (status && status !== 'all') {
      if (status === 'approved') {
        where.isActive = true;
      } else if (status === 'pending') {
        where.isActive = false;
      }
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const vendors = await prisma.user.findMany({
      where,
      include: {
        vendorProfile: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.user.count({ where });

    // Calculate real vendor statistics
    const transformedVendors = await Promise.all(vendors.map(async (vendor) => {
      // Get vendor's product count
      const productCount = await prisma.product.count({
        where: { vendorId: vendor.vendorProfile?.id }
      });

      // Calculate vendor's total revenue from completed orders
      const revenueResult = await prisma.orderItem.aggregate({
        where: {
          order: {
            vendorId: vendor.vendorProfile?.id,
            paymentStatus: 'COMPLETED'
          }
        },
        _sum: {
          total: true
        }
      });

      // Calculate average rating from reviews
      const ratingResult = await prisma.review.aggregate({
        where: {
          vendorId: vendor.vendorProfile?.id
        },
        _avg: {
          rating: true
        }
      });

      // Get vendor's most common product category
      const topCategory = await prisma.product.groupBy({
        by: ['categoryId'],
        where: {
          vendorId: vendor.vendorProfile?.id
        },
        _count: {
          categoryId: true
        },
        orderBy: {
          _count: {
            categoryId: 'desc'
          }
        },
        take: 1
      });

      let categoryName = 'Uncategorized';
      if (topCategory.length > 0) {
        const category = await prisma.category.findUnique({
          where: { id: topCategory[0].categoryId }
        });
        categoryName = category?.name || 'Uncategorized';
      }

      return {
        id: vendor.id,
        name: vendor.vendorProfile?.businessName || `${vendor.firstName} ${vendor.lastName}`,
        email: vendor.email,
        phone: vendor.phone || 'N/A',
        location: 'N/A', // Location would come from Address model
        category: categoryName,
        status: vendor.isActive ? 'approved' : 'pending',
        joinDate: vendor.createdAt.toISOString().split('T')[0],
        revenue: `£${(revenueResult._sum.total || 0).toLocaleString()}`,
        products: productCount,
        rating: Math.round((ratingResult._avg.rating || 0) * 10) / 10, // Round to 1 decimal place
        documents: vendor.vendorProfile?.verificationStatus === 'VERIFIED' ? 'Complete' : 'Incomplete',
        businessType: vendor.vendorProfile?.businessType || 'N/A',
        description: vendor.vendorProfile?.description || 'N/A',
        website: vendor.vendorProfile?.website || 'N/A',
        taxId: vendor.vendorProfile?.taxId || 'N/A',
        bankAccount: 'N/A', // This field doesn't exist in VendorProfile
        contactPerson: 'N/A', // This field doesn't exist in VendorProfile
        emergencyContact: 'N/A', // This field doesn't exist in VendorProfile
        isActive: vendor.isActive,
        isVerified: vendor.isVerified
      };
    }));

    res.json({
      success: true,
      data: transformedVendors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors'
    });
  }
});

// @desc    Update vendor status
// @route   PUT /api/v1/admin/vendors/:id/status
// @access  Private (Admin)
router.put('/vendors/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isVerified } = req.body;

    const updatedVendor = await prisma.user.update({
      where: { id },
      data: {
        isActive,
        isVerified
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isVerified: true
      }
    });

    res.json({
      success: true,
      message: `Vendor ${isActive ? 'approved' : 'suspended'} successfully`,
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor status'
    });
  }
});

// @desc    Get platform analytics
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin)
router.get('/analytics', requireAdmin, async (req, res) => {
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
      revenue,
      orders,
      newUsers,
      newVendors,
      topCategories,
      orderStatusStats
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
      prisma.vendorProfile.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.category.findMany({
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: {
          products: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        period,
        revenue: revenue._sum.amount || 0,
        orders,
        newUsers,
        newVendors,
        topCategories,
        orderStatusStats
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

// @desc    Get vendor details by ID
// @route   GET /api/v1/admin/vendors/:id
// @access  Private (Admin)
router.get('/vendors/:id', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
            isVerified: true,
            createdAt: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Transform the data to match the frontend interface
    const transformedVendor = {
      id: vendor.id,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      description: vendor.description,
      website: vendor.website,
      taxId: vendor.taxId,
      revenue: Number(vendor.revenue || 0),
      verificationStatus: vendor.verificationStatus,
      location: 'N/A', // This would need to be added to the schema
      category: 'Uncategorized', // This would need to be calculated from products
      bankAccount: 'N/A',
      contactPerson: `${vendor.user.firstName} ${vendor.user.lastName}`,
      emergencyContact: 'N/A',
      createdAt: vendor.createdAt.toISOString(),
      user: vendor.user
    };

    res.json({
      success: true,
      data: transformedVendor
    });
  } catch (error) {
    console.error('Get vendor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor details'
    });
  }
});

// @desc    Get vendor statistics
// @route   GET /api/v1/admin/vendor-stats/:id
// @access  Private (Admin)
router.get('/vendor-stats/:id', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Get vendor profile
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Calculate statistics
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      avgRating
    ] = await Promise.all([
      prisma.product.count({
        where: { vendorId: id }
      }),
      prisma.order.count({
        where: {
          orderItems: {
            some: {
              product: {
                vendorId: id
              }
            }
          }
        }
      }),
      prisma.orderItem.aggregate({
        where: {
          product: {
            vendorId: id
          }
        },
        _sum: {
          total: true
        }
      }).catch(() => ({ _sum: { total: 0 } })),
      prisma.review.aggregate({
        where: {
          product: {
            vendorId: id
          }
        },
        _avg: {
          rating: true
        }
      }).catch(() => ({ _avg: { rating: 0 } }))
    ]);

    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      avgRating: Number(avgRating._avg.rating || 0),
      totalCustomers: 0, // This would need to be calculated
      monthlyGrowth: 0 // This would need to be calculated
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor statistics'
    });
  }
});

export default router;
