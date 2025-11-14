import express from 'express';
import { PrismaClient, $Enums } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get admin dashboard data
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const paidStatuses = [$Enums.PaymentStatus.COMPLETED];

    const [
      totalUsers,
      totalVendors,
      activeVendors,
      productsListed,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      vendorStats,
      orderStatusCounts,
      paymentStatusCounts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendorProfile.count(),
      prisma.vendorProfile.count({
        where: {
          OR: [
            { isVerified: true },
            { verificationStatus: { equals: $Enums.VerificationStatus.VERIFIED } }
          ]
        }
      }),
      prisma.product.count({
        where: {
          AND: [
            { isActive: true },
            { status: { in: [$Enums.ProductStatus.APPROVED, $Enums.ProductStatus.ACTIVE] } }
          ]
        }
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: {
          paymentStatus: {
            in: paidStatuses
          }
        },
        _sum: { totalAmount: true }
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
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      prisma.order.groupBy({
        by: ['paymentStatus'],
        _count: { _all: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          activeVendors,
          productsListed,
          totalOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0
        },
        recentOrders,
        topProducts,
        vendorStats,
        orderStatusCounts,
        paymentStatusCounts
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

    // Build where clause
    const where: any = {
      role: 'VENDOR',
      vendorProfile: {
        isNot: null // Only include users with vendor profiles
      }
    };
    
    // Add status-specific filters
    if (status && status !== 'all') {
      if (status === 'approved') {
        // Approved: Active and verified
        where.isActive = true;
        where.vendorProfile = {
          is: {
            verificationStatus: 'VERIFIED'
          }
        };
      } else if (status === 'pending') {
        // Pending: Verification pending but not active (initial application)
        where.isActive = false;
        where.vendorProfile = {
          is: {
            verificationStatus: 'PENDING'
          }
        };
      } else if (status === 'review') {
        // Under review: Active but verification pending (actively being reviewed)
        where.isActive = true;
        where.vendorProfile = {
          is: {
            verificationStatus: 'PENDING'
          }
        };
      } else if (status === 'suspended') {
        // Suspended: Rejected OR (Inactive AND NOT PENDING)
        // This EXCLUDES pending vendors (PENDING + inactive) which should show in "pending" filter
        // According to status determination logic:
        // - REJECTED → always suspended
        // - VERIFIED + inactive → suspended (verificationStatus != 'PENDING')
        // - NULL + inactive → suspended (backwards compatibility, NULL != 'PENDING' in filter)
        // - PENDING + inactive → NOT suspended (excluded by NOT PENDING condition)
        where.AND = [
          {
            role: 'VENDOR'
          },
          {
            vendorProfile: {
              isNot: null
            }
          },
          {
            OR: [
              // 1. Rejected vendors are always suspended (regardless of isActive)
              {
                vendorProfile: {
                  is: {
                    verificationStatus: 'REJECTED'
                  }
                }
              },
              // 2. Inactive vendors that are NOT pending
              // This covers: VERIFIED + inactive, and NULL + inactive (backwards compatibility)
              // This EXCLUDES: PENDING + inactive (which should be in pending filter)
              {
                AND: [
                  { isActive: false },
                  {
                    vendorProfile: {
                      is: {
                        verificationStatus: {
                          not: 'PENDING'
                        }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ];
        // Clear top-level properties since they're in AND now
        delete where.role;
        delete where.vendorProfile;
      }
    }

    // Add search conditions
    if (search) {
      const searchTerm = search as string;
      const searchConditions: any[] = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        {
          vendorProfile: {
            is: {
              businessName: { contains: searchTerm, mode: 'insensitive' }
            }
          }
        }
      ];

      // If we already have AND conditions (like for suspended), add search to it
      if (where.AND) {
        where.AND.push({
          OR: searchConditions
        });
      } else {
        // Build base filters for AND condition
        const baseFilters: any[] = [
          {
            role: 'VENDOR'
          }
        ];
        
        // Add vendorProfile filter
        if (where.vendorProfile) {
          baseFilters.push({
            vendorProfile: where.vendorProfile
          });
        } else {
          baseFilters.push({
            vendorProfile: { isNot: null }
          });
        }
        
        // Add isActive filter if set
        if (where.isActive !== undefined) {
          baseFilters.push({
            isActive: where.isActive
          });
        }
        
        // Combine base filters with search using AND
        where.AND = [
          ...baseFilters,
          {
            OR: searchConditions
          }
        ];
        
        // Remove properties that are now in AND
        delete where.role;
        delete where.isActive;
        delete where.vendorProfile;
      }
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

      // Determine status based on isActive, isVerified, and verificationStatus
      // Priority: verificationStatus is the source of truth, but handle null/undefined for backwards compatibility
      let vendorStatus = 'pending';
      const verificationStatus = vendor.vendorProfile?.verificationStatus;
      
      // If verificationStatus is explicitly set, use it as the source of truth
      if (verificationStatus === 'REJECTED') {
        // Rejected vendors are always suspended
        vendorStatus = 'suspended';
      }
      else if (verificationStatus === 'VERIFIED') {
        // Verified: Check if active to determine if approved or suspended
        if (vendor.isActive) {
          vendorStatus = 'approved'; // Active and verified
        } else {
          vendorStatus = 'suspended'; // Verified but inactive (suspended)
        }
      }
      else if (verificationStatus === 'PENDING') {
        // Pending verification: Determine status based on isActive
        if (vendor.isActive) {
          vendorStatus = 'review'; // Active but verification pending (actively being reviewed)
        } else {
          vendorStatus = 'pending'; // Not active yet (initial application, pending approval)
        }
      }
      // Fallback: If verificationStatus is not set (null/undefined), use isVerified and isActive for backwards compatibility
      else {
        // This handles vendors created before verificationStatus was implemented
        if (!vendor.isActive) {
          vendorStatus = 'suspended';
        } else if (vendor.isVerified) {
          // If verified but verificationStatus not set, treat as approved (backwards compatibility)
          vendorStatus = 'approved';
        } else {
          // Not verified and not active - pending
          vendorStatus = 'pending';
        }
      }

      return {
        id: vendor.id,
        vendorProfileId: vendor.vendorProfile?.id || vendor.id, // Include vendor profile ID for navigation
        name: vendor.vendorProfile?.businessName || `${vendor.firstName} ${vendor.lastName}`,
        email: vendor.email,
        phone: vendor.phone || 'N/A',
        location: 'N/A', // Location would come from Address model
        category: categoryName,
        status: vendorStatus,
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
        isVerified: vendor.isVerified,
        verificationStatus: vendor.vendorProfile?.verificationStatus || 'PENDING'
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

    // Get the vendor profile first to update it
    const vendor = await prisma.user.findUnique({
      where: { id },
      include: {
        vendorProfile: true
      }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Determine verification status based on isActive and isVerified
    let verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' = 'PENDING';
    if (isActive && isVerified) {
      verificationStatus = 'VERIFIED';
    } else if (!isActive) {
      // Keep existing status when suspending, or set to PENDING if not set
      verificationStatus = (vendor.vendorProfile?.verificationStatus as any) || 'PENDING';
    } else {
      verificationStatus = 'PENDING';
    }

    // Update user status
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

    // Update vendor profile verification status if vendor profile exists
    if (vendor.vendorProfile) {
      await prisma.vendorProfile.update({
        where: { id: vendor.vendorProfile.id },
        data: {
          verificationStatus: verificationStatus
        }
      });
    }

    return res.json({
      success: true,
      message: `Vendor ${isActive && isVerified ? 'approved' : isActive ? 'activated' : 'suspended'} successfully`,
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update vendor status'
    });
  }
});

// @desc    Get all customers
// @route   GET /api/v1/admin/customers
// @access  Private (Admin)
router.get('/customers', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const where: any = {
      role: 'CUSTOMER'
    };
    
    if (status && status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
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

    const customers = await prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            status: true,
            paymentStatus: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        addresses: {
          select: {
            city: true,
            state: true,
            country: true
          },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.user.count({ where });

    // Calculate customer statistics
    const transformedCustomers = await Promise.all(customers.map(async (customer: any) => {
      // Calculate total orders
      const customerOrders = customer.orders || [];
      const totalOrders = customerOrders.length;

      // Calculate total spent (from completed orders)
      const totalSpent = customerOrders
        .filter((order: any) => order.paymentStatus === 'COMPLETED')
        .reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);

      // Get last order date
      const lastOrder = customerOrders.length > 0
        ? customerOrders[0].createdAt.toISOString().split('T')[0]
        : null;

      // Calculate average rating from reviews
      const ratingResult = await prisma.review.aggregate({
        where: {
          customerId: customer.id
        },
        _avg: {
          rating: true
        }
      }).catch(() => ({ _avg: { rating: null } }));

      // Get location from address or default
      const customerAddresses = customer.addresses || [];
      const location = customerAddresses.length > 0
        ? `${customerAddresses[0].city || ''}, ${customerAddresses[0].state || ''}, ${customerAddresses[0].country || ''}`.trim().replace(/^,|,$/g, '') || 'N/A'
        : 'N/A';

      // Count support tickets (using notifications as proxy, or 0 if not implemented)
      const supportTickets = 0; // This would need a separate SupportTicket model

      const rating = ratingResult._avg?.rating 
        ? Math.round(ratingResult._avg.rating * 10) / 10 
        : 0;

      return {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone || 'N/A',
        location: location,
        joinDate: customer.createdAt.toISOString().split('T')[0],
        totalOrders: totalOrders,
        totalSpent: `£${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        lastOrder: lastOrder || 'N/A',
        status: customer.isActive ? 'active' : 'inactive',
        rating: rating,
        supportTickets: supportTickets,
        isActive: customer.isActive,
        isVerified: customer.isVerified
      };
    }));

    res.json({
      success: true,
      data: transformedCustomers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
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
    let previousStartDate: Date;

    // Support both '7d' and '7days' formats
    const periodDays = period === '7d' || period === '7days' ? 7 :
                       period === '30d' || period === '30days' ? 30 :
                       period === '90d' || period === '3months' ? 90 :
                       period === '1y' || period === '1year' || period === '6months' ? (period === '6months' ? 180 : 365) :
                       30;

    startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    previousStartDate = new Date(Date.now() - periodDays * 2 * 24 * 60 * 60 * 1000);

    // Calculate previous period for comparison
    const previousEndDate = startDate;

    const [
      revenue,
      previousRevenue,
      orders,
      previousOrders,
      newUsers,
      previousUsers,
      newVendors,
      previousVendors,
      activeVendors,
      totalProducts,
      avgOrderValue,
      totalCustomers,
      topVendors,
      topCategories,
      topProducts,
      orderStatusStats,
      revenueByMonth,
      ordersByMonth,
      recentActivity
    ] = await Promise.all([
      // Current period revenue
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
      // Previous period revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate
          }
        },
        _sum: { amount: true }
      }),
      // Current period orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      // Previous period orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate
          }
        }
      }),
      // Current period new users
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      // Previous period new users
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate
          }
        }
      }),
      // Current period new vendors
      prisma.vendorProfile.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      // Previous period new vendors
      prisma.vendorProfile.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate
          }
        }
      }),
      // Active vendors
      prisma.vendorProfile.count({
        where: {
          user: {
            isActive: true
          }
        }
      }),
      // Total products
      prisma.product.count({
        where: {
          status: 'APPROVED',
          isActive: true
        }
      }),
      // Average order value
      prisma.order.aggregate({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _avg: { totalAmount: true }
      }),
      // Total customers
      prisma.user.count({
        where: {
          role: 'CUSTOMER'
        }
      }),
      // Top vendors by revenue
      prisma.vendorProfile.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          orders: {
            where: {
              paymentStatus: 'COMPLETED',
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            },
            select: {
              totalAmount: true
            }
          },
          _count: {
            select: {
              orders: {
                where: {
                  createdAt: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              }
            }
          }
        },
        take: 10
      }),
      // Top categories by revenue
      prisma.category.findMany({
        include: {
          products: {
            where: {
              status: 'APPROVED',
              isActive: true
            },
            include: {
              orderItems: {
                where: {
                  order: {
                    paymentStatus: 'COMPLETED',
                    createdAt: {
                      gte: startDate,
                      lte: endDate
                    }
                  }
                },
                select: {
                  total: true,
                  quantity: true
                }
              }
            }
          },
          _count: {
            select: {
              products: {
                where: {
                  status: 'APPROVED',
                  isActive: true
                }
              }
            }
          }
        }
      }),
      // Top products by sales
      prisma.product.findMany({
        where: {
          status: 'APPROVED',
          isActive: true
        },
        include: {
          vendor: {
            select: {
              businessName: true
            }
          },
          category: {
            select: {
              name: true
            }
          },
          orderItems: {
            where: {
              order: {
                paymentStatus: 'COMPLETED',
                createdAt: {
                  gte: startDate,
                  lte: endDate
                }
              }
            },
            select: {
              quantity: true,
              total: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              orderItems: {
                where: {
                  order: {
                    paymentStatus: 'COMPLETED',
                    createdAt: {
                      gte: startDate,
                      lte: endDate
                    }
                  }
                }
              }
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
      // Order status stats
      prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          status: true
        }
      }),
      // Revenue by month (for charts) - fetch all payments and group in JS
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          amount: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      }),
      // Orders by month - fetch all orders and group in JS
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      }),
      // Recent activity
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

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenueGrowth = calculateGrowth(
      Number(revenue._sum.amount || 0),
      Number(previousRevenue._sum.amount || 0)
    );
    const ordersGrowth = calculateGrowth(orders, previousOrders);
    const usersGrowth = calculateGrowth(newUsers, previousUsers);
    const vendorsGrowth = calculateGrowth(newVendors, previousVendors);

    // Process top vendors
    const processedTopVendors = topVendors
      .map(vendor => {
        const vendorRevenue = vendor.orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
        return {
          id: vendor.id,
          name: vendor.businessName,
          revenue: vendorRevenue,
          orders: vendor._count.orders,
          rating: 0, // Will be calculated if needed
          category: 'N/A' // Will be determined from products if needed
        };
      })
      .filter(vendor => vendor.revenue > 0 || vendor.orders > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Process top categories
    const processedTopCategories = topCategories
      .map(category => {
        const categoryRevenue = category.products.reduce((sum, product) => {
          return sum + product.orderItems.reduce((itemSum, item) => itemSum + Number(item.total || 0), 0);
        }, 0);
        const categoryOrders = category.products.reduce((sum, product) => {
          return sum + product.orderItems.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
        }, 0);
        const totalRevenue = Number(revenue._sum.amount || 0);
        const percentage = totalRevenue > 0 ? (categoryRevenue / totalRevenue) * 100 : 0;
        
        return {
          id: category.id,
          name: category.name,
          revenue: categoryRevenue,
          orders: categoryOrders,
          percentage: percentage,
          productsCount: category._count.products
        };
      })
      .filter(category => category.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Process top products
    const processedTopProducts = topProducts
      .map(product => {
        const sales = product.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const productRevenue = product.orderItems.reduce((sum, item) => sum + Number(item.total || 0), 0);
        const avgRating = product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0;
        
        return {
          id: product.id,
          name: product.name,
          category: product.category?.name || 'Uncategorized',
          sales: sales,
          revenue: productRevenue,
          rating: Math.round(avgRating * 10) / 10,
          vendor: product.vendor.businessName
        };
      })
      .filter(product => product.sales > 0)
      .sort((a, b) => b.revenue - a.revenue);

    // Process revenue by month for charts
    const monthlyRevenue = revenueByMonth.reduce((acc: any, item) => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { revenue: 0, orders: 0 };
      }
      acc[monthKey].revenue += Number(item.amount || 0);
      return acc;
    }, {});

    const monthlyOrders = ordersByMonth.reduce((acc: any, item) => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { orders: 0 };
      }
      acc[monthKey].orders += 1;
      return acc;
    }, {});

    // Combine monthly data
    const revenueTrend = Object.keys(monthlyRevenue).map(month => ({
      month,
      revenue: monthlyRevenue[month].revenue,
      orders: monthlyOrders[month]?.orders || 0
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Process recent activity
    const processedRecentActivity = recentActivity.map(order => ({
      id: order.id,
      action: 'Order placed',
      description: `Order #${order.orderNumber || order.id} by ${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
      vendor: order.vendor?.businessName || 'Unknown',
      time: order.createdAt,
      amount: Number(order.totalAmount || 0)
    }));

    // Calculate average rating from all products
    const allProductsWithReviews = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        isActive: true
      },
      include: {
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    const allRatings = allProductsWithReviews.flatMap(p => p.reviews.map(r => r.rating));
    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0;

    res.json({
      success: true,
      data: {
        period,
        overview: {
          totalRevenue: Number(revenue._sum.amount || 0),
          totalOrders: orders,
          activeVendors: activeVendors,
          totalProducts: totalProducts,
          avgOrderValue: Number(avgOrderValue._avg.totalAmount || 0),
          avgRating: Math.round(avgRating * 10) / 10,
          totalCustomers: totalCustomers,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          ordersGrowth: Math.round(ordersGrowth * 10) / 10,
          usersGrowth: Math.round(usersGrowth * 10) / 10,
          vendorsGrowth: Math.round(vendorsGrowth * 10) / 10
        },
        topVendors: processedTopVendors,
        topCategories: processedTopCategories,
        topProducts: processedTopProducts,
        orderStatusStats: orderStatusStats.map(stat => ({
          status: stat.status,
          count: stat._count.status
        })),
        revenueTrend,
        recentActivity: processedRecentActivity
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

// @desc    Get advanced analytics
// @route   GET /api/v1/admin/advanced-analytics
// @access  Private (Admin)
router.get('/advanced-analytics', requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate: Date;
    let previousStartDate: Date;
    const endDate = new Date();

    // Support both '7d' and '7days' formats
    const periodDays = period === '7d' || period === '7days' ? 7 :
                       period === '30d' || period === '30days' ? 30 :
                       period === '90d' || period === '3months' ? 90 :
                       period === '1y' || period === '1year' || period === '6months' ? (period === '6months' ? 180 : 365) :
                       30;

    startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    previousStartDate = new Date(Date.now() - periodDays * 2 * 24 * 60 * 60 * 1000);
    const previousEndDate = startDate;

    // Helper function to normalize numbers
    const normalizeNumber = (value: any): number => {
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

    // Helper function to calculate growth
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Real-time metrics
    const [
      activeUsers,
      currentOrders,
      pendingApprovals,
      systemAlerts,
      activeVendors,
      currentRevenue,
      currentOrdersCount,
      previousRevenue,
      previousOrdersCount,
      totalProducts,
      avgOrderValue,
      avgRating,
      totalCustomers,
      dailyRevenue,
      monthlyRevenue,
      topVendors,
      topCategories,
      ordersByLocation,
      pendingVendors,
      pendingProducts
    ] = await Promise.all([
      // Active users (last 24 hours)
      prisma.user.count({
        where: {
          isActive: true,
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      // Current orders (in progress)
      prisma.order.count({
        where: {
          status: {
            in: ['CONFIRMED', 'PROCESSING', 'SHIPPED']
          }
        }
      }),
      // Pending approvals (vendors + products)
      Promise.all([
        prisma.vendorProfile.count({
          where: {
            verificationStatus: 'PENDING'
          }
        }),
        prisma.product.count({
          where: {
            status: 'PENDING'
          }
        })
      ]).then(([vendors, products]) => vendors + products),
      // System alerts (unread notifications with SYSTEM_ALERT type)
      prisma.notification.count({
        where: {
          type: 'SYSTEM_ALERT',
          isRead: false
        }
      }),
      // Active vendors
      prisma.vendorProfile.count({
        where: {
          OR: [
            { isVerified: true },
            { verificationStatus: { equals: $Enums.VerificationStatus.VERIFIED } }
          ],
          products: {
            some: {
              isActive: true,
              status: { in: [$Enums.ProductStatus.APPROVED, $Enums.ProductStatus.ACTIVE] }
            }
          }
        }
      }),
      // Current period revenue
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
      // Current period orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      // Previous period revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate
          }
        },
        _sum: { amount: true }
      }),
      // Previous period orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate
          }
        }
      }),
      // Total products
      prisma.product.count({
        where: {
          status: 'APPROVED',
          isActive: true
        }
      }),
      // Average order value
      prisma.order.aggregate({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _avg: { totalAmount: true }
      }),
      // Average rating
      prisma.review.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _avg: { rating: true }
      }),
      // Total customers
      prisma.user.count({
        where: {
          role: 'CUSTOMER'
        }
      }),
      // Daily revenue (last 7 days)
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lte: endDate
          }
        },
        select: {
          amount: true,
          createdAt: true,
          order: {
            select: {
              id: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      // Monthly revenue (last 6 months)
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            lte: endDate
          }
        },
        select: {
          amount: true,
          createdAt: true,
          order: {
            select: {
              id: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      // Top vendors by revenue
      prisma.vendorProfile.findMany({
        include: {
          orders: {
            where: {
              paymentStatus: 'COMPLETED',
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            },
            select: {
              totalAmount: true,
              id: true
            }
          },
          _count: {
            select: {
              orders: {
                where: {
                  createdAt: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              }
            }
          }
        },
        take: 10
      }),
      // Top categories by revenue
      prisma.category.findMany({
        include: {
          products: {
            where: {
              status: 'APPROVED',
              isActive: true
            },
            include: {
              orderItems: {
                where: {
                  order: {
                    paymentStatus: 'COMPLETED',
                    createdAt: {
                      gte: startDate,
                      lte: endDate
                    }
                  }
                },
                select: {
                  total: true,
                  quantity: true
                }
              }
            }
          },
          _count: {
            select: {
              products: {
                where: {
                  status: 'APPROVED',
                  isActive: true
                }
              }
            }
          }
        }
      }),
      // Orders by location (from shipping addresses)
      prisma.order.findMany({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          totalAmount: true,
          shippingAddress: true,
          id: true
        }
      }),
      // Pending vendors
      prisma.vendorProfile.count({
        where: {
          verificationStatus: 'PENDING'
        }
      }),
      // Pending products
      prisma.product.count({
        where: {
          status: 'PENDING'
        }
      })
    ]);

    // Process daily revenue
    const dailyRevenueMap = new Map<string, { revenue: number; orders: Set<string> }>();
    dailyRevenue.forEach(payment => {
      const date = new Date(payment.createdAt).toISOString().split('T')[0];
      if (!dailyRevenueMap.has(date)) {
        dailyRevenueMap.set(date, { revenue: 0, orders: new Set() });
      }
      const dayData = dailyRevenueMap.get(date)!;
      dayData.revenue += normalizeNumber(payment.amount);
      if (payment.order?.id) {
        dayData.orders.add(payment.order.id);
      }
    });

    const dailyRevenueData = Array.from(dailyRevenueMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process monthly revenue
    const monthlyRevenueMap = new Map<string, { revenue: number; orders: Set<string> }>();
    monthlyRevenue.forEach(payment => {
      const date = new Date(payment.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyRevenueMap.has(monthKey)) {
        monthlyRevenueMap.set(monthKey, { revenue: 0, orders: new Set() });
      }
      const monthData = monthlyRevenueMap.get(monthKey)!;
      monthData.revenue += normalizeNumber(payment.amount);
      if (payment.order?.id) {
        monthData.orders.add(payment.order.id);
      }
    });

    const monthlyRevenueData = Array.from(monthlyRevenueMap.entries())
      .map(([monthKey, data]) => ({
        monthKey,
        month: new Date(monthKey + '-01').toLocaleDateString('en-GB', { month: 'short' }),
        revenue: data.revenue,
        orders: data.orders.size
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map(({ monthKey, ...rest }) => rest);

    // Get all vendor reviews at once for efficiency
    const vendorIds = topVendors.map(v => v.id);
    const allVendorReviews = await prisma.review.groupBy({
      by: ['vendorId'],
      where: {
        vendorId: {
          in: vendorIds
        }
      },
      _avg: {
        rating: true
      }
    });

    const reviewsMap = new Map<string, number>();
    allVendorReviews.forEach(review => {
      if (review.vendorId) {
        reviewsMap.set(review.vendorId, normalizeNumber(review._avg.rating));
      }
    });

    // Process top vendors with ratings
    const processedTopVendors = topVendors
      .map(vendor => {
        const vendorRevenue = vendor.orders.reduce((sum, order) => sum + normalizeNumber(order.totalAmount), 0);
        const rating = reviewsMap.get(vendor.id) || 0;
        
        return {
          id: vendor.id,
          name: vendor.businessName,
          revenue: vendorRevenue,
          orders: vendor._count.orders,
          rating: Math.round(rating * 10) / 10,
          growth: 0 // Would need previous period data
        };
      })
      .filter(vendor => vendor.revenue > 0 || vendor.orders > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Process top categories
    const processedTopCategories = topCategories
      .map(category => {
        const categoryRevenue = category.products.reduce((sum, product) => {
          return sum + product.orderItems.reduce((itemSum, item) => itemSum + normalizeNumber(item.total), 0);
        }, 0);
        const categoryOrders = category.products.reduce((sum, product) => {
          return sum + product.orderItems.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
        }, 0);
        const totalRevenue = normalizeNumber(currentRevenue._sum.amount);
        const percentage = totalRevenue > 0 ? (categoryRevenue / totalRevenue) * 100 : 0;
        
        return {
          id: category.id,
          name: category.name,
          revenue: categoryRevenue,
          percentage: percentage,
          growth: 0 // Would need previous period data
        };
      })
      .filter(category => category.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Process orders by location
    const locationMap = new Map<string, { revenue: number; orders: number }>();
    ordersByLocation.forEach(order => {
      try {
        const shippingAddress = order.shippingAddress as any;
        const city = shippingAddress?.city || shippingAddress?.City || 'Unknown';
        const location = city; // Use city as location
        
        if (!locationMap.has(location)) {
          locationMap.set(location, { revenue: 0, orders: 0 });
        }
        const locationData = locationMap.get(location)!;
        locationData.revenue += normalizeNumber(order.totalAmount);
        locationData.orders += 1;
      } catch (error) {
        // Skip invalid addresses
      }
    });

    const totalLocationRevenue = Array.from(locationMap.values()).reduce((sum, loc) => sum + loc.revenue, 0);
    const locationDemographics = Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        percentage: totalLocationRevenue > 0 ? (data.revenue / totalLocationRevenue) * 100 : 0,
        revenue: data.revenue,
        orders: data.orders
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate growth
    const revenueGrowth = calculateGrowth(
      normalizeNumber(currentRevenue._sum.amount),
      normalizeNumber(previousRevenue._sum.amount)
    );
    const ordersGrowth = calculateGrowth(currentOrdersCount, previousOrdersCount);

    // Calculate average rating
    const allProductsWithReviews = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        isActive: true
      },
      include: {
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    const allRatings = allProductsWithReviews.flatMap(p => p.reviews.map(r => r.rating));
    const calculatedAvgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : normalizeNumber(avgRating._avg.rating);

    res.json({
      success: true,
      data: {
        period,
        overview: {
          totalRevenue: normalizeNumber(currentRevenue._sum.amount),
          totalOrders: currentOrdersCount,
          activeVendors: activeVendors,
          totalProducts: totalProducts,
          avgOrderValue: normalizeNumber(avgOrderValue._avg.totalAmount),
          customerSatisfaction: Math.round(calculatedAvgRating * 10) / 10,
          growthRate: Math.round(revenueGrowth * 10) / 10
        },
        realTimeMetrics: {
          activeUsers: activeUsers,
          currentOrders: currentOrders,
          pendingApprovals: pendingApprovals,
          systemAlerts: systemAlerts
        },
        revenueData: {
          daily: dailyRevenueData,
          monthly: monthlyRevenueData
        },
        topCategories: processedTopCategories,
        topVendors: processedTopVendors,
        customerDemographics: {
          ageGroups: [
            // Age demographics not available in schema - placeholder data
            { age: "18-24", percentage: 0, revenue: 0 },
            { age: "25-34", percentage: 0, revenue: 0 },
            { age: "35-44", percentage: 0, revenue: 0 },
            { age: "45-54", percentage: 0, revenue: 0 },
            { age: "55+", percentage: 0, revenue: 0 }
          ],
          locations: locationDemographics
        }
      }
    });
  } catch (error) {
    console.error('Get advanced analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get advanced analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
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

// @desc    Get all orders (Admin)
// @route   GET /api/v1/admin/orders
// @access  Private (Admin)
router.get('/orders', requireAdmin, async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
                commissionRate: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    commissionRate: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get orders'
    });
  }
});

// @desc    Update order status (Admin)
// @route   PATCH /api/v1/admin/orders/:id/status
// @access  Private (Admin)
router.patch('/orders/:id/status', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const ALLOWED_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
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

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prepare update data
    const updateData: any = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Create vendor earnings when order is delivered and payment is completed
    if (status === 'DELIVERED' && order.paymentStatus === 'COMPLETED') {
      const existingEarning = await prisma.vendorEarning.findFirst({
        where: {
          orderId: order.id,
          vendorId: order.vendorId
        }
      });

      if (!existingEarning) {
        const orderSubtotal = order.orderItems.reduce((sum, item) => {
          return sum + Number(item.total);
        }, 0);

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

        const grossAmount = Number(order.totalAmount) - Number(order.shippingCost || 0);
        const commission = (grossAmount * averageCommissionRate) / 100;
        const netAmount = grossAmount - commission;

        await prisma.vendorEarning.create({
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

        await prisma.vendorProfile.update({
          where: { id: order.vendorId },
          data: {
            withdrawalBalance: {
              increment: netAmount
            }
          } as any
        });

        if (updatedOrder.vendor?.user) {
          await prisma.notification.create({
            data: {
              userId: updatedOrder.vendor.user.id,
              title: 'New Earnings',
              message: `You have earned £${netAmount.toFixed(2)} from order ${order.orderNumber}. Funds are available for withdrawal immediately.`,
              type: 'PAYMENT_RECEIVED'
            }
          });
        }
      }
    }

    // Create notifications for status changes
    if (updatedOrder.customer) {
      const statusMessages: Record<string, string> = {
        CONFIRMED: `Your order ${order.orderNumber} has been confirmed.`,
        PROCESSING: `Your order ${order.orderNumber} is now being processed.`,
        SHIPPED: trackingNumber 
          ? `Your order ${order.orderNumber} has been shipped. Tracking: ${trackingNumber}`
          : `Your order ${order.orderNumber} has been shipped.`,
        DELIVERED: `Your order ${order.orderNumber} has been delivered.`,
        CANCELLED: `Your order ${order.orderNumber} has been cancelled.`,
        REFUNDED: `Your order ${order.orderNumber} has been refunded.`
      };

      if (statusMessages[status]) {
        await prisma.notification.create({
          data: {
            userId: updatedOrder.customer.id,
            title: 'Order Update',
            message: statusMessages[status],
            type: 'ORDER_UPDATE'
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status'
    });
  }
});

// @desc    Process refund for order (Admin)
// @route   POST /api/v1/admin/orders/:id/refund
// @access  Private (Admin)
router.post('/orders/:id/refund', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { reason, amount } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        payments: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Order payment is not completed. Cannot refund.'
      });
    }

    if (order.status === 'REFUNDED') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been refunded'
      });
    }

    // Refund amount (full refund if amount not specified)
    const refundAmount = amount ? Number(amount) : Number(order.totalAmount);
    
    if (refundAmount > Number(order.totalAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed order total'
      });
    }

    // Process refund through Stripe if payment exists
    let refundProcessed = false;
    if (order.payments.length > 0 && order.payments[0].gateway === 'STRIPE' && order.payments[0].transactionId) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Create refund
        const refund = await stripe.refunds.create({
          payment_intent: order.payments[0].transactionId,
          amount: Math.round(refundAmount * 100), // Convert to cents
          reason: reason || 'requested_by_customer',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber || '',
            adminRefund: 'true'
          }
        });

        // Update payment status
        await prisma.payment.update({
          where: { id: order.payments[0].id },
          data: {
            status: 'REFUNDED',
            gatewayResponse: refund as any
          }
        });

        refundProcessed = true;
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        // Continue with refund even if Stripe fails (manual processing)
      }
    }

    // Update order status
    await prisma.order.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED'
      }
    });

    // Restore product stock
    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    // Reverse vendor earnings if they exist
    const vendorEarning = await prisma.vendorEarning.findFirst({
      where: {
        orderId: order.id,
        vendorId: order.vendorId
      }
    });

    if (vendorEarning && vendorEarning.movedToWithdrawal) {
      // Deduct from vendor withdrawal balance
      await prisma.vendorProfile.update({
        where: { id: order.vendorId },
        data: {
          withdrawalBalance: {
            decrement: vendorEarning.netAmount
          }
        } as any
      });

      // Update earning status
      await prisma.vendorEarning.update({
        where: { id: vendorEarning.id },
        data: {
          status: 'FAILED'
        }
      });

      // Notify vendor
      const vendorUser = await prisma.user.findFirst({
        where: {
          vendorProfile: {
            id: order.vendorId
          }
        },
        select: {
          id: true
        }
      });

      if (vendorUser) {
        await prisma.notification.create({
          data: {
            userId: vendorUser.id,
            title: 'Order Refunded',
            message: `Order ${order.orderNumber} has been refunded. Earnings have been reversed.`,
            type: 'SYSTEM_ALERT'
          }
        });
      }
    }

    // Notify customer
    if (order.customer) {
      await prisma.notification.create({
        data: {
          userId: order.customer.id,
          title: 'Refund Processed',
          message: `Your refund of £${refundAmount.toFixed(2)} for order ${order.orderNumber} has been processed.${refundProcessed ? '' : ' Please allow 5-10 business days for the refund to appear in your account.'}`,
          type: 'PAYMENT_RECEIVED'
        }
      });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        orderId: order.id,
        refundAmount,
        refundProcessed,
        orderStatus: 'REFUNDED'
      }
    });
  } catch (error: any) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
});

// @desc    Cancel order (Admin)
// @route   POST /api/v1/admin/orders/:id/cancel
// @access  Private (Admin)
router.post('/orders/:id/cancel', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    if (order.status === 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered order'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${order.notes || ''}\n\nCancelled: ${reason}`.trim() : order.notes
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Restore product stock
    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    // If payment was completed, process refund
    if (order.paymentStatus === 'COMPLETED') {
      // Auto-refund if payment was completed
      // This calls the refund endpoint logic
      const refundAmount = Number(order.totalAmount);
      
      // Update payment status
      const payments = await prisma.payment.findMany({
        where: {
          orderId: order.id,
          status: 'COMPLETED'
        }
      });

      for (const payment of payments) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'REFUNDED'
          }
        });
      }

      // Update order payment status
      await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: 'REFUNDED'
        }
      });
    }

    // Notify customer
    if (updatedOrder.customer) {
      await prisma.notification.create({
        data: {
          userId: updatedOrder.customer.id,
          title: 'Order Cancelled',
          message: `Your order ${order.orderNumber} has been cancelled.${order.paymentStatus === 'COMPLETED' ? ' A refund will be processed within 5-10 business days.' : ''}`,
          type: 'ORDER_UPDATE'
        }
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel order'
    });
  }
});

// @desc    Resend order confirmation (Admin)
// @route   POST /api/v1/admin/orders/:id/resend-confirmation
// @access  Private (Admin)
router.post('/orders/:id/resend-confirmation', requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create notification for customer
    if (order.customer) {
      await prisma.notification.create({
        data: {
          userId: order.customer.id,
          title: 'Order Confirmation',
          message: `Order confirmation for order ${order.orderNumber}. Total: £${Number(order.totalAmount).toFixed(2)}`,
          type: 'ORDER_UPDATE'
        }
      });
    }

    res.json({
      success: true,
      message: 'Order confirmation sent successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customer?.email
      }
    });
  } catch (error: any) {
    console.error('Resend confirmation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend confirmation'
    });
  }
});

// @desc    Get financial overview and data
// @route   GET /api/v1/admin/financial
// @access  Private (Admin)
router.get('/financial', requireAdmin, async (req: any, res: any) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Calculate previous period for growth comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    const previousEndDate = new Date(startDate);

    // Get financial overview
    const [
      totalRevenueResult,
      previousRevenueResult,
      totalCommissionsResult,
      pendingPaymentsResult,
      refundsResult,
      avgOrderValueResult,
      totalOrdersResult
    ] = await Promise.all([
      // Current period revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      // Previous period revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: previousStartDate, lt: previousEndDate }
        },
        _sum: { amount: true }
      }),
      // Total commissions
      prisma.vendorEarning.aggregate({
        where: {
          createdAt: { gte: startDate }
        },
        _sum: { commission: true }
      }),
      // Pending payments (vendor earnings that haven't been paid out)
      prisma.vendorEarning.aggregate({
        where: {
          status: { in: ['PENDING', 'PROCESSING'] },
          movedToWithdrawal: true
        },
        _sum: { netAmount: true }
      }),
      // Refunds
      prisma.order.aggregate({
        where: {
          status: 'REFUNDED',
          updatedAt: { gte: startDate }
        },
        _sum: { totalAmount: true }
      }),
      // Average order value
      prisma.order.aggregate({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        _avg: { totalAmount: true },
        _count: { id: true }
      }),
      // Total orders
      prisma.order.count({
        where: {
          paymentStatus: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      })
    ]);

    const totalRevenue = Number(totalRevenueResult._sum.amount || 0);
    const previousRevenue = Number(previousRevenueResult._sum.amount || 0);
    const totalCommissions = Number(totalCommissionsResult._sum.commission || 0);
    const pendingPayments = Number(pendingPaymentsResult._sum.netAmount || 0);
    const refundsIssued = Number(refundsResult._sum.totalAmount || 0);
    const avgOrderValue = Number(avgOrderValueResult._avg.totalAmount || 0);
    const totalOrders = totalOrdersResult;

    // Calculate growth rate
    const growthRate = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Calculate commission rate (average)
    const commissionRate = totalRevenue > 0 
      ? (totalCommissions / totalRevenue) * 100 
      : 15; // Default 15%

    // Calculate profit margin (revenue - commissions - refunds) / revenue
    const profitMargin = totalRevenue > 0 
      ? ((totalRevenue - totalCommissions - refundsIssued) / totalRevenue) * 100 
      : 0;

    // Get vendor payments (earnings)
    const vendorPayments = await prisma.vendorEarning.findMany({
      where: {
        createdAt: { gte: startDate }
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Transform vendor payments
    const payments = vendorPayments.map((earning) => {
      const vendor = earning.vendor as any;
      return {
        id: earning.id,
        vendorId: earning.vendorId,
        vendorName: vendor.businessName || `${vendor.user.firstName} ${vendor.user.lastName}`,
        amount: Number(earning.netAmount),
        commission: Number(earning.commission),
        status: earning.status.toLowerCase(),
        dueDate: earning.createdAt.toISOString().split('T')[0],
        orders: 1, // Each earning is for one order
        period: new Date(earning.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        paymentMethod: 'bank_transfer' // Default
      };
    });

    // Group payments by vendor and period for better display
    const paymentsByVendor = payments.reduce((acc: any, payment) => {
      const key = `${payment.vendorId}-${payment.period}`;
      if (!acc[key]) {
        acc[key] = {
          ...payment,
          orders: 0
        };
      }
      acc[key].amount += payment.amount;
      acc[key].commission += payment.commission;
      acc[key].orders += payment.orders;
      return acc;
    }, {});

    const groupedPayments = Object.values(paymentsByVendor);

    // Get refunds (from orders with REFUNDED status)
    const refundedOrders = await prisma.order.findMany({
      where: {
        status: 'REFUNDED',
        updatedAt: { gte: startDate }
      },
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
            id: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 100
    });

    const refunds = refundedOrders.map((order) => ({
      id: order.id,
      orderId: order.orderNumber,
      customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Unknown',
      amount: Number(order.totalAmount),
      reason: 'Order refunded',
      status: 'approved',
      requestedDate: order.updatedAt.toISOString().split('T')[0],
      processedDate: order.updatedAt.toISOString().split('T')[0],
      vendorId: order.vendorId
    }));

    // Get transactions (from payments and vendor earnings)
    const [paymentTransactions, earningTransactions] = await Promise.all([
      prisma.payment.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          order: {
            include: {
              vendor: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.vendorEarning.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          order: {
            select: {
              orderNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    ]);

    const transactions = [
      ...paymentTransactions.map((payment) => ({
        id: `PAY-${payment.id}`,
        type: payment.status === 'REFUNDED' ? 'refund' : 'payment',
        amount: payment.status === 'REFUNDED' ? -Number(payment.amount) : Number(payment.amount),
        vendor: (payment.order?.vendor as any)?.businessName || 'System',
        date: payment.createdAt.toISOString().split('T')[0],
        status: payment.status.toLowerCase(),
        description: payment.status === 'REFUNDED' 
          ? `Refund for order ${payment.order?.orderNumber || 'N/A'}`
          : `Payment for order ${payment.order?.orderNumber || 'N/A'}`
      })),
      ...earningTransactions.map((earning) => ({
        id: `EARN-${earning.id}`,
        type: 'commission',
        amount: -Number(earning.commission), // Negative because it's a cost
        vendor: (earning.vendor as any)?.businessName || 'Unknown',
        date: earning.createdAt.toISOString().split('T')[0],
        status: earning.status.toLowerCase(),
        description: `Commission for order ${earning.order?.orderNumber || 'N/A'}`
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get commission rates by category
    const categories = await prisma.category.findMany({
      where: {
        commissionRate: { not: null }
      },
      select: {
        id: true,
        name: true,
        commissionRate: true
      },
      orderBy: { name: 'asc' }
    });

    const commissionRates = categories.map((category) => ({
      category: category.name,
      rate: Number(category.commissionRate || 15),
      minOrder: 0 // Not stored in category, using 0 as default
    }));

    // If no categories with commission rates, add default ones
    if (commissionRates.length === 0) {
      commissionRates.push(
        { category: 'Food & Beverages', rate: 12, minOrder: 10 },
        { category: 'Fashion & Clothing', rate: 15, minOrder: 25 },
        { category: 'Beauty & Personal Care', rate: 18, minOrder: 15 },
        { category: 'Health & Wellness', rate: 20, minOrder: 20 },
        { category: 'Home & Garden', rate: 14, minOrder: 30 }
      );
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalCommissions,
          pendingPayments,
          refundsIssued,
          avgOrderValue,
          commissionRate: Math.round(commissionRate * 10) / 10,
          growthRate: Math.round(growthRate * 10) / 10,
          profitMargin: Math.round(profitMargin * 10) / 10
        },
        payments: groupedPayments,
        refunds,
        transactions: transactions.slice(0, 50), // Limit to 50 most recent
        commissionRates
      }
    });
  } catch (error: any) {
    console.error('Get financial data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch financial data'
    });
  }
});

export default router;
