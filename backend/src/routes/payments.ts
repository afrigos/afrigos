import express from 'express';
import { PrismaClient, PaymentGateway } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// @desc    Stripe Webhook Handler (must be before auth middleware)
// @route   POST /api/v1/payments/webhook
// @access  Public (Stripe calls this directly)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(canceledPayment);
        break;

      // Stripe Connect events
      case 'transfer.created':
      case 'transfer.reversed':
      case 'transfer.updated':
        const transfer = event.data.object as Stripe.Transfer;
        await handleTransferUpdate(transfer, event.type);
        break;

      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdate(account);
        break;

      // Payout events from connected accounts (when vendor receives money in bank)
      // Note: These events are only received if webhooks are configured to forward events from connected accounts
      // This requires additional Stripe dashboard configuration
      case 'payout.paid':
      case 'payout.failed':
        const payout = event.data.object as Stripe.Payout;
        // The event.account property contains the connected account ID if this is from a connected account
        const connectedAccountId = (event as any).account;
        await handlePayoutUpdate(payout, event.type, connectedAccountId);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Apply authentication middleware to all routes except webhook
router.use(authenticate);

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

// @desc    Create Stripe Payment Intent
// @route   POST /api/v1/payments/create-intent
// @access  Private
router.post('/create-intent', [
  body('orderId').notEmpty().withMessage('Order ID is required'),
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

    const { orderId } = req.body;

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
            product: {
              select: {
                name: true
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

    // Check if order belongs to user
    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
        gateway: PaymentGateway.STRIPE,
        status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] }
      }
    });

    if (existingPayment) {
      // Return existing payment intent if available
      if (existingPayment.transactionId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(existingPayment.transactionId);
          return res.json({
            success: true,
            data: {
              clientSecret: paymentIntent.client_secret,
              paymentIntentId: paymentIntent.id
            }
          });
        } catch (error) {
          // Payment intent might not exist, create new one
        }
      }
    }

    // Check if mock payment mode is enabled
    const MOCK_PAYMENTS = process.env.MOCK_PAYMENTS === 'true' || process.env.MOCK_PAYMENTS === '1';
    
    if (MOCK_PAYMENTS) {
      // Mock payment mode: Automatically mark payment as successful
      console.log('🧪 MOCK PAYMENT MODE: Automatically processing payment for order', order.id);
      
      // Create mock payment record
      let payment;
      if (existingPayment) {
        payment = await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            transactionId: `mock_pi_${Date.now()}_${order.id}`,
            gatewayResponse: {
              id: `mock_pi_${Date.now()}_${order.id}`,
              status: 'succeeded',
              amount: Math.round(Number(order.totalAmount) * 100),
              currency: 'gbp',
              metadata: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                customerId: order.customerId
              }
            } as any,
            status: 'COMPLETED'
          }
        });
      } else {
        payment = await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: Number(order.totalAmount),
            paymentMethod: 'card',
            gateway: PaymentGateway.STRIPE,
            transactionId: `mock_pi_${Date.now()}_${order.id}`,
            gatewayResponse: {
              id: `mock_pi_${Date.now()}_${order.id}`,
              status: 'succeeded',
              amount: Math.round(Number(order.totalAmount) * 100),
              currency: 'gbp',
              metadata: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                customerId: order.customerId
              }
            } as any,
            status: 'COMPLETED'
          }
        });
      }

      // Update order status to COMPLETED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        }
      });

      // Create mock payment intent object for handlePaymentSuccess
      const mockPaymentIntent = {
        id: payment.transactionId,
        status: 'succeeded',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId: order.customerId
        }
      } as any;

      // Call handlePaymentSuccess to ensure all records are updated
      await handlePaymentSuccess(mockPaymentIntent);

      console.log('✅ MOCK PAYMENT: Payment automatically processed and marked as successful');

      // Return mock client secret (frontend will detect this and skip Stripe)
      res.json({
        success: true,
        data: {
          clientSecret: `mock_secret_${payment.transactionId}`,
          paymentIntentId: payment.transactionId,
          mockPayment: true // Flag for frontend
        }
      });
      return;
    }

    // Normal Stripe payment flow
    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'gbp', // Change to your currency
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId
      },
      description: `Order ${order.orderNumber}`,
      receipt_email: order.customer.email,
    });

    // Create or update payment record
    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          transactionId: paymentIntent.id,
          gatewayResponse: paymentIntent as any,
          status: 'PENDING'
        }
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: Number(order.totalAmount),
          paymentMethod: 'card',
          gateway: PaymentGateway.STRIPE,
          transactionId: paymentIntent.id,
          gatewayResponse: paymentIntent as any,
          status: 'PENDING'
        }
      });
    }

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
});

// Helper function to handle successful payment
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    console.error('No orderId in payment intent metadata');
    return;
  }

  // Find payment record
  const payment = await prisma.payment.findFirst({
    where: {
      transactionId: paymentIntent.id
    },
    include: {
      order: true
    }
  });

  if (!payment) {
    console.error(`Payment not found for transaction ${paymentIntent.id}`);
    return;
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'COMPLETED',
      gatewayResponse: paymentIntent as any
    }
  });

  // Update order status
  await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      paymentStatus: 'COMPLETED',
      status: 'CONFIRMED'
    }
  });

  console.log(`Payment succeeded for order ${orderId}`);
}

// Helper function to handle failed payment
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  const payment = await prisma.payment.findFirst({
    where: {
      transactionId: paymentIntent.id
    }
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        gatewayResponse: paymentIntent as any
      }
    });

    // Keep order as PENDING so customer can retry
    console.log(`Payment failed for order ${orderId}`);
  }
}

// Helper function to handle canceled payment
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  const payment = await prisma.payment.findFirst({
    where: {
      transactionId: paymentIntent.id
    }
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        gatewayResponse: paymentIntent as any
      }
    });

    console.log(`Payment canceled for order ${orderId}`);
  }
}

// Helper function to handle Stripe transfer updates (vendor payouts)
async function handleTransferUpdate(transfer: Stripe.Transfer, eventType: string) {
  try {
    const vendorId = transfer.metadata?.vendorId;
    if (!vendorId) {
      console.log('Transfer update received but no vendorId in metadata');
      return;
    }

    // Find vendor profile by Stripe account ID
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: {
        stripeAccountId: transfer.destination as string
      },
      include: {
        user: {
          select: {
            id: true
          }
        }
      }
    });

    if (!vendorProfile) {
      console.log(`Vendor profile not found for Stripe account: ${transfer.destination}`);
      return;
    }

    // Update notification based on transfer status
    let title = 'Payout Update';
    let message = '';
    let notificationType = 'PAYMENT_RECEIVED';

    switch (eventType) {
      case 'transfer.created':
        message = `Your payout of £${(transfer.amount / 100).toFixed(2)} has been transferred to your Stripe account balance. Funds will be available in your bank account shortly.`;
        title = 'Transfer Created';
        break;
      case 'transfer.reversed':
        message = `Your payout of £${(transfer.amount / 100).toFixed(2)} has been reversed.`;
        title = 'Transfer Reversed';
        notificationType = 'SYSTEM_ALERT';
        // Refund the withdrawal balance if transfer was reversed
        await prisma.vendorProfile.update({
          where: { id: vendorProfile.id },
          data: {
            withdrawalBalance: {
              increment: transfer.amount / 100
            }
          } as any
        });
        break;
      case 'transfer.updated':
        message = `Your transfer of £${(transfer.amount / 100).toFixed(2)} has been updated.`;
        title = 'Transfer Updated';
        break;
      default:
        message = `Your transfer of £${(transfer.amount / 100).toFixed(2)} status has changed.`;
    }

    // Create notification for vendor
    if (vendorProfile.user) {
      await prisma.notification.create({
        data: {
          userId: vendorProfile.user.id,
          title,
          message,
          type: notificationType as any
        }
      });
    }

    console.log(`Transfer ${eventType} processed for vendor ${vendorId}, transfer ID: ${transfer.id}`);
  } catch (error: any) {
    console.error('Error handling transfer update:', error);
  }
}

// Helper function to handle Stripe account updates (vendor onboarding status)
async function handleAccountUpdate(account: Stripe.Account) {
  try {
    const vendorId = account.metadata?.vendorId;
    if (!vendorId && !account.id) {
      console.log('Account update received but no vendorId or account ID');
      return;
    }

    // Find vendor profile by Stripe account ID
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: {
        stripeAccountId: account.id
      },
      include: {
        user: {
          select: {
            id: true
          }
        }
      }
    });

    if (!vendorProfile) {
      console.log(`Vendor profile not found for Stripe account: ${account.id}`);
      return;
    }

    // Update Stripe account status
    let stripeAccountStatus = 'pending';
    if (account.charges_enabled && account.payouts_enabled && account.details_submitted) {
      stripeAccountStatus = 'verified';
    } else if (account.charges_enabled || account.payouts_enabled) {
      stripeAccountStatus = 'processing';
    }

    await prisma.vendorProfile.update({
      where: { id: vendorProfile.id },
      data: {
        stripeAccountStatus
      } as any
    });

    // Notify vendor if account is now verified
    if (stripeAccountStatus === 'verified' && vendorProfile.user) {
      await prisma.notification.create({
        data: {
          userId: vendorProfile.user.id,
          title: 'Stripe Account Verified',
          message: 'Your Stripe account has been verified and is ready for payouts.',
          type: 'SYSTEM_ALERT'
        }
      });
    }

    console.log(`Account update processed for vendor ${vendorProfile.id}, status: ${stripeAccountStatus}`);
  } catch (error: any) {
    console.error('Error handling account update:', error);
  }
}

// Helper function to handle Stripe payout updates (when vendor receives money in bank)
// Note: This requires webhooks to be configured to receive events from connected accounts
// In Stripe Dashboard: Settings > Connect > Settings > Forward events from connected accounts
async function handlePayoutUpdate(payout: Stripe.Payout, eventType: string, connectedAccountId?: string) {
  try {
    let vendorProfile = null;
    
    // First, try to find vendor by connected account ID (most reliable)
    if (connectedAccountId) {
      vendorProfile = await prisma.vendorProfile.findFirst({
        where: {
          stripeAccountId: connectedAccountId
        },
        include: {
          user: {
            select: {
              id: true
            }
          }
        }
      });
    }
    
    // Fallback: try to find by payout metadata
    if (!vendorProfile && payout.metadata?.vendorId) {
      vendorProfile = await prisma.vendorProfile.findUnique({
        where: { id: payout.metadata.vendorId },
        include: {
          user: {
            select: {
              id: true
            }
          }
        }
      });
    }
    
    if (!vendorProfile) {
      console.log(`Vendor profile not found for payout: ${payout.id}, connected account: ${connectedAccountId || 'unknown'}`);
      return;
    }

    // Update notification based on payout status
    let title = 'Payout Update';
    let message = '';
    let notificationType = 'PAYMENT_RECEIVED';

    switch (eventType) {
      case 'payout.paid':
        message = `Your payout of £${(payout.amount / 100).toFixed(2)} has been successfully transferred to your bank account.`;
        title = 'Payout Successful';
        break;
      case 'payout.failed':
        message = `Your payout of £${(payout.amount / 100).toFixed(2)} failed. Please check your bank account details in your Stripe account.`;
        title = 'Payout Failed';
        notificationType = 'SYSTEM_ALERT';
        break;
      default:
        message = `Your payout of £${(payout.amount / 100).toFixed(2)} status has changed.`;
    }

    // Create notification for vendor
    if (vendorProfile.user) {
      await prisma.notification.create({
        data: {
          userId: vendorProfile.user.id,
          title,
          message,
          type: notificationType as any
        }
      });
    }

    console.log(`Payout ${eventType} processed for vendor ${vendorProfile.id}, payout ID: ${payout.id}`);
  } catch (error: any) {
    console.error('Error handling payout update:', error);
  }
}

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
