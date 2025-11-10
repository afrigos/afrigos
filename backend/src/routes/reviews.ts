import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult, query } from 'express-validator';
import type { Response } from 'express';

const router = express.Router();
const prisma = new PrismaClient();
//push
const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

const buildValidationErrorResponse = (errors: any[]) => ({
  success: false,
  message: 'Validation failed',
  errors,
});

const formatCustomerName = (customer: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}) => {
  const parts = [customer.firstName, customer.lastName].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ');
  }
  return customer.email ?? 'Customer';
};

const attachOrderMetadata = (
  reviews: Array<{ productId: string; customerId: string }>,
  orderItems: Array<{
    productId: string;
    order: { id: string; orderNumber: string | null; createdAt: Date; customerId: string };
  }>
) => {
  const orderMap = new Map<string, { id: string; orderNumber: string | null; createdAt: Date }>();

  for (const item of orderItems) {
    const key = `${item.order.customerId}:${item.productId}`;
    const existing = orderMap.get(key);
    if (!existing || existing.createdAt < item.order.createdAt) {
      orderMap.set(key, {
        id: item.order.id,
        orderNumber: item.order.orderNumber,
        createdAt: item.order.createdAt,
      });
    }
  }

  return reviews.map((review) => {
    const metadata = orderMap.get(`${review.customerId}:${review.productId}`);
    return metadata
      ? {
          orderId: metadata.id,
          orderNumber: metadata.orderNumber,
          orderDate: metadata.createdAt,
        }
      : null;
  });
};

const getOrderDetails = async (orderId: string) => {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};

router.post(
  '/',
  [
    body('orderId').isString().notEmpty(),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isString().notEmpty(),
    body('items.*.rating').isInt({ min: 1, max: 5 }),
    body('items.*.comment').optional().isString().isLength({ max: 1000 }),
  ],
  async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'CUSTOMER') {
        return res.status(403).json({
          success: false,
          message: 'Only customers can submit reviews',
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(buildValidationErrorResponse(errors.array()));
      }

      const { orderId, items } = req.body as {
        orderId: string;
        items: Array<{ productId: string; rating: number; comment?: string | null }>;
      };

      const order = await getOrderDetails(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (order.customerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to review this order',
        });
      }

      const allowedStatuses = ['DELIVERED', 'COMPLETED'];
      if (order.status && !allowedStatuses.includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: 'You can only review orders that have been delivered',
        });
      }

      const orderProductIds = new Set(order.orderItems.map((item) => item.productId));
      const validItems = items.filter((item) => orderProductIds.has(item.productId));

      if (validItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid products found to review for this order',
        });
      }

      const vendorId = order.vendorId;
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Unable to determine vendor for this order',
        });
      }

      const reviewPromises = validItems.map((item) =>
        prisma.review.upsert({
          where: {
            customerId_productId: {
              customerId: req.user.id,
              productId: item.productId,
            },
          },
          update: {
            rating: item.rating,
            comment: item.comment ?? null,
            isVerified: true,
          },
          create: {
            rating: item.rating,
            comment: item.comment ?? null,
            customerId: req.user.id,
            vendorId,
            productId: item.productId,
            isVerified: true,
          },
        })
      );

      await Promise.all(reviewPromises);

      const reviewData = await prisma.review.findMany({
        where: {
          customerId: req.user.id,
          productId: { in: Array.from(orderProductIds) },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        message: 'Reviews submitted successfully',
        data: {
          orderId,
          reviews: reviewData.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            product: review.product,
          })),
        },
      });
    } catch (error) {
      console.error('Create review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit reviews',
      });
    }
  }
);

router.get(
  '/vendor',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('rating').optional().isInt({ min: 1, max: 5 }),
    query('search').optional().isString().isLength({ max: 120 }),
  ],
  async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'VENDOR') {
        return res.status(403).json({
          success: false,
          message: 'Vendor access required',
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(buildValidationErrorResponse(errors.array()));
      }

      const vendorId = req.user.vendorId;
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const ratingFilter = req.query.rating ? Number(req.query.rating) : undefined;
      const searchTerm = (req.query.search as string | undefined)?.trim();

      const where: any = {
        vendorId,
      };

      if (ratingFilter) {
        where.rating = ratingFilter;
      }

      if (searchTerm && searchTerm.length > 0) {
        where.OR = [
          { comment: { contains: searchTerm, mode: 'insensitive' } },
          { product: { name: { contains: searchTerm, mode: 'insensitive' } } },
          {
            customer: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }

      const [reviews, total, averageResult, recentCount, distribution, productGroups] =
        await Promise.all([
          prisma.review.findMany({
            where,
            include: {
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.review.count({ where }),
          prisma.review.aggregate({
            where: { vendorId },
            _avg: { rating: true },
          }),
          prisma.review.count({
            where: {
              vendorId,
              createdAt: {
                gte: new Date(Date.now() - DAYS_30_MS),
              },
            },
          }),
          prisma.review.groupBy({
            where: { vendorId },
            by: ['rating'],
            _count: {
              _all: true,
            },
          }),
          prisma.review.groupBy({
            where: { vendorId },
            by: ['productId'],
            _avg: {
              rating: true,
            },
            _count: {
              _all: true,
            },
          }),
        ]);

      const reviewKeys = reviews.map((review) => ({
        productId: review.productId,
        customerId: review.customerId,
      }));

      let orderAssignments: Array<{ orderId: string; orderNumber: string | null; orderDate: Date } | null> = [];

      if (reviewKeys.length > 0) {
        const orderItems = await prisma.orderItem.findMany({
          where: {
            productId: {
              in: Array.from(new Set(reviewKeys.map((key) => key.productId))),
            },
            order: {
              vendorId,
              customerId: {
                in: Array.from(new Set(reviewKeys.map((key) => key.customerId))),
              },
            },
          },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                createdAt: true,
                customerId: true,
              },
            },
          },
        });

        orderAssignments = attachOrderMetadata(reviewKeys, orderItems);
      }

      const productMap = new Map<string, { averageRating: number; reviewCount: number }>();
      for (const group of productGroups) {
        productMap.set(group.productId, {
          averageRating: Number(group._avg.rating ?? 0),
          reviewCount: group._count._all,
        });
      }

      return res.json({
        success: true,
        data: {
          overview: {
            totalReviews: total,
            averageRating: Number(averageResult._avg.rating ?? 0),
            recentReviews: recentCount,
            distribution: {
              5: distribution.find((d) => d.rating === 5)?._count._all ?? 0,
              4: distribution.find((d) => d.rating === 4)?._count._all ?? 0,
              3: distribution.find((d) => d.rating === 3)?._count._all ?? 0,
              2: distribution.find((d) => d.rating === 2)?._count._all ?? 0,
              1: distribution.find((d) => d.rating === 1)?._count._all ?? 0,
            },
          },
          reviews: reviews.map((review, index) => {
            const orderMeta = orderAssignments[index];
            return {
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt,
              customer: {
                id: review.customer.id,
                name: formatCustomerName(review.customer),
                email: review.customer.email,
              },
              product: {
                id: review.product.id,
                name: review.product.name,
                image: review.product.images?.[0] ?? null,
                price: review.product.price ? Number(review.product.price) : null,
                stats: productMap.get(review.product.id) ?? { averageRating: 0, reviewCount: 0 },
              },
              order: orderMeta
                ? {
                    id: orderMeta.orderId,
                    orderNumber: orderMeta.orderNumber,
                    createdAt: orderMeta.orderDate,
                  }
                : null,
            };
          }),
          pagination: {
            page,
            limit,
            total,
            pages: Math.max(1, Math.ceil(total / limit)),
          },
        },
      });
    } catch (error) {
      console.error('Get vendor reviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor reviews',
      });
    }
  }
);

router.get('/order/:orderId', async (req: any, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderDetails(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (req.user.role === 'CUSTOMER' && order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order',
      });
    }

    if (req.user.role === 'VENDOR' && order.vendorId !== req.user.vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Vendor access required for this order',
      });
    }

    const productIds = order.orderItems.map((item) => item.productId);

    if (productIds.length === 0) {
      return res.json({
        success: true,
        data: {
          orderId,
          orderNumber: order.orderNumber,
          reviews: [],
          pendingProducts: [],
        },
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        customerId: order.customerId,
        productId: {
          in: productIds,
        },
        vendorId: order.vendorId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reviewedProductIds = new Set(reviews.map((review) => review.productId));
    const pendingProducts = order.orderItems
      .filter((item) => !reviewedProductIds.has(item.productId))
      .map((item) => ({
        productId: item.productId,
        name: item.product?.name ?? 'Product',
        image: item.product?.images?.[0] ?? null,
      }));

    return res.json({
      success: true,
      data: {
        orderId,
        orderNumber: order.orderNumber,
        reviews: reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          product: {
            id: review.product.id,
            name: review.product.name,
            image: review.product.images?.[0] ?? null,
          },
          customer: {
            id: review.customer.id,
            name: formatCustomerName(review.customer),
            email: review.customer.email,
          },
        })),
        pendingProducts,
      },
    });
  } catch (error) {
    console.error('Get order reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order reviews',
    });
  }
});

export default router;

