import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get order by order number (public, for tracking)
// @route   GET /api/v1/orders/track/:orderNumber
// @access  Public
router.get('/track/:orderNumber', async (req: any, res: any) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true
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

    // For public tracking, only return order status and shipping info
    // No sensitive customer/vendor details
    const shippingAddress = typeof order.shippingAddress === 'string' 
      ? JSON.parse(order.shippingAddress) 
      : order.shippingAddress;

    res.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: shippingAddress,
        totalAmount: order.totalAmount,
        shippingCost: order.shippingCost,
        orderItems: order.orderItems.map(item => ({
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: {
            name: item.product.name,
            images: item.product.images
          }
        })),
        vendor: {
          businessName: order.vendor.businessName
        }
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track order'
    });
  }
});

// Apply authentication to all routes below
router.use(authenticate);

// @desc    Get orders
// @route   GET /api/v1/orders
// @access  Private
router.get('/', async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const where: any = {};
    
    if (req.user.role === 'VENDOR') {
      where.vendorId = req.user.vendorId;
    } else if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    }

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
            businessName: true
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
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders'
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
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
                sku: true
              }
            }
          }
        },
        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    if (req.user.role === 'VENDOR' && order.vendorId !== req.user.vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'CUSTOMER' && order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order'
    });
  }
});

// @desc    Create order
// @route   POST /api/v1/orders
// @access  Private (Customer)
const ALLOWED_ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

router.post('/', [
  body('items').isArray({ min: 1 }),
  body('shippingAddress').isObject(),
  body('paymentMethod').notEmpty()
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

    const { items, shippingAddress, billingAddress, notes, paymentMethod, totalAmount, shippingCost, shippingMethod } = req.body;

    // Generate order number
    const orderNumber = `AFG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Validate items and get vendor/product info
    const orderItems = [];
    const vendorIds = new Set<string>();

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          vendor: {
            select: { id: true }
          }
        }
      });

      if (!product || !product.isActive || product.status !== 'APPROVED') {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found or unavailable`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      vendorIds.add(product.vendor.id);

      const itemTotal = Number(product.price) * Number(item.quantity);
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // For now, create one order per vendor (or use first vendor if multiple)
    // In future, we can create separate orders per vendor
    const vendorId = Array.from(vendorIds)[0];
    
    const itemsSubtotal = orderItems.reduce((sum, item) => sum + Number(item.total), 0);
    const providedTotal = typeof totalAmount === 'number' ? Number(totalAmount) : null;
    const providedShipping = typeof shippingCost === 'number' ? Number(shippingCost) : null;
    const finalShippingCost = providedShipping && providedShipping > 0 ? providedShipping : 0;
    let calculatedSubtotal = providedTotal !== null ? providedTotal - finalShippingCost : itemsSubtotal;

    if (calculatedSubtotal < 0) {
      calculatedSubtotal = itemsSubtotal;
    }

    const finalOrderTotal = calculatedSubtotal + finalShippingCost;

    const vendorShippingNote = shippingMethod === 'vendor_handled'
      ? 'Shipping handled directly by vendor.'
      : null;

    const combinedNotes = [notes, vendorShippingNote].filter(Boolean).join('\n') || undefined;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: req.user.id,
        vendorId,
        totalAmount: finalOrderTotal,
        shippingCost: finalShippingCost,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        notes: combinedNotes,
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create order items
    await prisma.orderItem.createMany({
      data: orderItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }))
    });

    // Update product stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Fetch complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true
              }
            }
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        vendor: {
          select: {
            id: true,
            businessName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: completeOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});
 

router.patch('/:id/status', [
  body('status')
    .isString()
    .custom((value) => ALLOWED_ORDER_STATUSES.includes(value))
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
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        vendorId: true,
        customerId: true,
        status: true,
        paymentStatus: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (req.user.role === 'VENDOR' && order.vendorId !== req.user.vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'CUSTOMER' && order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

export default router;
