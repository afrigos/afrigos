import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

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
                images: true
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

    const { items, shippingAddress, billingAddress, notes, paymentMethod } = req.body;

    // Generate order number
    const orderNumber = `AFG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found or inactive`
        });
      }

      const itemTotal = Number(product.price) * Number(item.quantity);
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: req.user.id,
        vendorId: items[0].vendorId, // Assuming all items are from same vendor
        totalAmount,
        shippingAddress,
        billingAddress,
        notes,
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
        ...item,
        orderId: order.id
      }))
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

export default router;
