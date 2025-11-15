import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendNewOrderEmailToVendor } from '../services/emailService';

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
    const { page = 1, limit = 10, status, type } = req.query;

    const where: any = {};
    
    // If type is 'customer', show orders where user is the customer (orders they placed)
    // If type is 'vendor', show orders where user is the vendor (orders they received)
    // If type is not specified:
    //   - For vendors: default to vendor orders (orders they received)
    //   - For customers: default to customer orders (orders they placed)
    //   - For vendors accessing customer routes: use type='customer' to see orders they placed
    
    if (type === 'customer' || (req.user.role === 'CUSTOMER' && type !== 'vendor')) {
      // Get orders where user is the customer (orders they placed)
      where.customerId = req.user.id;
    } else if (type === 'vendor' || (req.user.role === 'VENDOR' && type !== 'customer')) {
      // Get orders where user is the vendor (orders they received)
      // Need to get vendorId from vendorProfile if not directly available
      if (req.user.vendorId) {
        where.vendorId = req.user.vendorId;
      } else {
        // Fallback: get vendor profile from user
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true }
        });
        if (vendorProfile) {
          where.vendorId = vendorProfile.id;
        } else {
          // No vendor profile, return empty
          return res.json({
            success: true,
            data: {
              orders: [],
              pagination: {
                page: Number(page),
                limit: Number(limit),
                total: 0,
                pages: 0
              }
            }
          });
        }
      }
    } else {
      // Default: filter by customerId for all users when accessing customer routes
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
    // Users can access orders where they are the customer (orders they placed) OR the vendor (orders they received)
    const isCustomer = order.customerId === req.user.id;
    
    // Check if user is the vendor for this order
    let isVendor = false;
    if (req.user.vendorId) {
      isVendor = order.vendorId === req.user.vendorId;
    } else if (req.user.role === 'VENDOR') {
      // Fallback: get vendor profile to check vendorId
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: req.user.id },
        select: { id: true }
      });
      if (vendorProfile) {
        isVendor = order.vendorId === vendorProfile.id;
      }
    }

    // Allow access if user is customer, vendor, or admin
    if (!isCustomer && !isVendor && req.user.role !== 'ADMIN') {
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
        }
      }
    });

    // Send new order notification email to vendor
    // Note: This is sent immediately when order is created (before payment)
    // Customer confirmation email is sent when payment is completed
    if (completeOrder && completeOrder.vendor && completeOrder.vendor.user) {
      try {
        const shippingAddress = typeof completeOrder.shippingAddress === 'string'
          ? JSON.parse(completeOrder.shippingAddress)
          : completeOrder.shippingAddress;

        const orderDate = new Date(completeOrder.createdAt).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const customerName = `${completeOrder.customer.firstName} ${completeOrder.customer.lastName}`;

        await sendNewOrderEmailToVendor({
          email: completeOrder.vendor.user.email,
          firstName: completeOrder.vendor.user.firstName,
          orderNumber: completeOrder.orderNumber,
          orderDate,
          customerName,
          orderItems: completeOrder.orderItems.map(item => ({
            product: {
              name: item.product.name,
              images: Array.isArray(item.product.images) ? item.product.images : []
            },
            quantity: item.quantity,
            price: item.price,
            total: item.total
          })),
          totalAmount: Number(completeOrder.totalAmount),
          shippingCost: Number(completeOrder.shippingCost || 0),
          shippingAddress
        });

        // Also create in-app notification for vendor
        await prisma.notification.create({
          data: {
            userId: completeOrder.vendor.user.id,
            title: 'New Order Received',
            message: `You have received a new order ${completeOrder.orderNumber} from ${customerName}. Total: £${Number(completeOrder.totalAmount).toFixed(2)}`,
            type: 'ORDER_UPDATE' // New order notification for vendor
          }
        });
      } catch (emailError: any) {
        console.error('Failed to send new order email to vendor:', emailError);
        // Don't fail order creation if email fails, but log it
      }
    }

    // Note: Order confirmation email is sent when payment is completed
    // This prevents duplicate emails and ensures customer only receives confirmation after successful payment

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
        },
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

    // Store previous status for email
    const previousStatus = order.status;

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

    // Send email notification to customer when order status is updated
    // Only send if status actually changed and customer exists
    if (status !== previousStatus && order.customer) {
      try {
        await sendOrderStatusUpdateEmail({
          email: order.customer.email,
          firstName: order.customer.firstName,
          orderNumber: order.orderNumber,
          orderId: order.id,
          status: status,
          previousStatus: previousStatus,
          trackingNumber: req.body.trackingNumber, // Optional tracking number
          estimatedDeliveryDate: req.body.estimatedDeliveryDate // Optional delivery date
        });
      } catch (emailError: any) {
        console.error('Failed to send order status update email:', emailError);
        // Don't fail status update if email fails, but log it
      }
    }

    // Create vendor earnings when order is delivered and payment is completed
    if (status === 'DELIVERED' && order.paymentStatus === 'COMPLETED') {
      // Check if earning already exists for this order
      const existingEarning = await prisma.vendorEarning.findFirst({
        where: {
          orderId: order.id,
          vendorId: order.vendorId
        }
      });

      if (!existingEarning) {
        // Calculate total order amount (excluding shipping for commission calculation)
        const orderSubtotal = order.orderItems.reduce((sum, item) => {
          return sum + Number(item.total);
        }, 0);

        // Calculate average commission rate from order items
        // Use category commissionRate if available, otherwise default to 15%
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

        // Calculate commission and net amount
        const grossAmount = Number(order.totalAmount) - Number(order.shippingCost || 0);
        const commission = (grossAmount * averageCommissionRate) / 100;
        const netAmount = grossAmount - commission;

        // Create vendor earning and immediately move to withdrawal balance
        const earning = await prisma.vendorEarning.create({
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

        // Immediately update vendor withdrawal balance
        await prisma.vendorProfile.update({
          where: { id: order.vendorId },
          data: {
            withdrawalBalance: {
              increment: netAmount
            }
          } as any
        });

        // Create notification for vendor
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
              title: 'New Earnings',
              message: `You have earned £${netAmount.toFixed(2)} from order ${order.orderNumber}. Funds are available for withdrawal immediately.`,
              type: 'PAYMENT_RECEIVED'
            }
          });
        }
      }
    }

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
