import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get payments
// @route   GET /api/v1/payments
// @access  Private
router.get('/', async (req: any, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.payment.count({ where });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments'
    });
  }
});

// @desc    Create payment
// @route   POST /api/v1/payments
// @access  Private
router.post('/', [
  body('orderId').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('paymentMethod').notEmpty(),
  body('gateway').isIn(['STRIPE', 'FLUTTERWAVE', 'PAYPAL', 'BANK_TRANSFER'])
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

    const { orderId, amount, paymentMethod, gateway, transactionId } = req.body;

    // Check if order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: parseFloat(amount),
        paymentMethod,
        gateway,
        transactionId,
        status: 'PENDING'
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            totalAmount: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment'
    });
  }
});

// @desc    Update payment status
// @route   PATCH /api/v1/payments/:id/status
// @access  Private
router.patch('/:id/status', [
  body('status').isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  body('gatewayResponse').optional()
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
    const { status, gatewayResponse } = req.body;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        gatewayResponse: gatewayResponse ? JSON.parse(gatewayResponse) : null
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        }
      }
    });

    // Update order status if payment is completed
    if (status === 'COMPLETED') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        }
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated',
      data: payment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status'
    });
  }
});

export default router;
