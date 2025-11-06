import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireVendor, requireAdmin } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for memory storage (we'll upload to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to upload image buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string = 'products'): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    ).end(buffer);
  });
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = (imageUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Extract public_id from Cloudinary URL
    try {
      const urlParts = imageUrl.split('/');
      const publicIdWithExt = urlParts.slice(-2).join('/').split('.')[0];
      cloudinary.uploader.destroy(publicIdWithExt, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to check if URL is from Cloudinary
const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

// Product sourcing types
enum ProductSourcing {
  IN_HOUSE = 'IN_HOUSE',
  OUTSOURCED = 'OUTSOURCED'
}

// Product status
enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE'
}

// ========== PUBLIC PRODUCT ENDPOINTS (No Authentication Required) ==========

// @desc    Get all public products (for customers)
// @route   GET /api/v1/products/public
// @access  Public
router.get('/public', async (req: any, res: any) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      sort = 'newest',
      minPrice,
      maxPrice,
      vendorId
    } = req.query;

    // Build where clause
    const where: any = {
      status: 'APPROVED',
      isActive: true
    };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice as string);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice as string);
      }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        // Order by number of order items
        orderBy = { createdAt: 'desc' }; // Will be enhanced later with actual sales data
        break;
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.product.count({ where })
    ]);

    // Transform products
    const transformedProducts = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        sku: product.sku,
        stock: product.stock,
        images: product.images,
        tags: product.tags,
        vendor: {
          id: product.vendor.id,
          businessName: product.vendor.businessName,
          email: product.vendor.user.email
        },
        category: product.category,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        salesCount: product._count.orderItems,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    res.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get public products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// @desc    Get featured products
// @route   GET /api/v1/products/public/featured
// @access  Public
router.get('/public/featured', async (req: any, res: any) => {
  try {
    const { limit = 12 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
        isFeatured: true
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: Number(limit)
    });

    const transformedProducts = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        sku: product.sku,
        stock: product.stock,
        images: product.images,
        tags: product.tags,
        vendor: {
          id: product.vendor.id,
          businessName: product.vendor.businessName,
          email: product.vendor.user.email
        },
        category: product.category,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        salesCount: product._count.orderItems,
        createdAt: product.createdAt
      };
    });

    res.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// @desc    Get single public product by ID
// @route   GET /api/v1/products/public/:id
// @access  Public
router.get('/public/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        status: 'APPROVED',
        isActive: true
      },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        reviews: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            orderItems: true,
            reviews: true
          }
        }
      }
    }) as any;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate average rating
    const avgRating = product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
      : 0;

    // Get related products (same category, different product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'APPROVED',
        isActive: true
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: 8
    });

    const transformedRelatedProducts = relatedProducts.map((p: any) => {
      const rating = p.reviews && p.reviews.length > 0
        ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length
        : 0;
      return {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        images: p.images,
        vendor: p.vendor,
        category: p.category,
        rating: Math.round(rating * 10) / 10,
        reviewCount: p.reviews?.length || 0
      };
    });

    // Transform reviews
    const transformedReviews = (product.reviews || []).map((review: any) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      user: review.customer,
      createdAt: review.createdAt
    }));

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        sku: product.sku,
        stock: product.stock,
        images: product.images,
        tags: product.tags,
        vendor: {
          id: product.vendor?.id || '',
          businessName: product.vendor?.businessName || '',
          email: product.vendor?.user?.email || '',
          contactName: product.vendor?.user ? `${product.vendor.user.firstName} ${product.vendor.user.lastName}` : ''
        },
        category: product.category || null,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count?.reviews || 0,
        salesCount: product._count?.orderItems || 0,
        reviews: transformedReviews,
        relatedProducts: transformedRelatedProducts,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Get public product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// ========== VENDOR PRODUCT ENDPOINTS (Authentication Required) ==========

// @desc    Get all products for a vendor
// @route   GET /api/v1/products
// @access  Private (Vendor)
router.get('/', authenticate, requireVendor, async (req: any, res: any) => {
  try {
    console.log('=== BACKEND: FETCHING PRODUCTS ===');
    const { page = 1, limit = 10, search, category, sourcing, status } = req.query;
    const vendorId = req.user.id;
    console.log('Request query params:', req.query);
    console.log('Vendor ID:', vendorId);

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: vendorId }
    });

    console.log('Vendor profile:', vendorProfile);

    if (!vendorProfile) {
      console.log('No vendor profile found for user:', vendorId);
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Build where clause
    const where: any = {
      vendorId: vendorProfile.id
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (sourcing) {
      where.sourcing = sourcing;
    }

    if (status) {
      where.status = status;
    }

    // Get products with pagination
    console.log('Where clause:', where);
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        orderItems: {
          select: {
            quantity: true,
            total: true
          }
        }
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    });

    console.log('Found products:', products.length);
    console.log('Products:', products.map(p => ({ id: p.id, name: p.name, vendorId: p.vendorId })));

    // Calculate total count
    const total = await prisma.product.count({ where });
    console.log('Total products count:', total);

    // Calculate stats for each product
    const productsWithStats = products.map((product: any) => {
      const totalSales = product.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const totalRevenue = product.orderItems.reduce((sum: number, item: any) => sum + Number(item.total), 0);
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
        : 0;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        sku: product.sku,
        stock: product.stock,
        status: product.status,
        sourcing: product.sourcing,
        images: product.images,
        category: product.category,
        totalSales,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        rejectionReason: product.rejectionReason || null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        products: productsWithStats,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// @desc    Get product categories
// @route   GET /api/v1/products/categories
// @access  Private (Vendor)
router.get('/categories', authenticate, requireVendor, async (req: any, res: any) => {
  try {
    console.log('Categories endpoint called by user:', req.user?.id);
    
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        type: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('Found categories:', categories);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Private (Vendor)
router.get('/:id', authenticate, requireVendor, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: vendorId }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorId: vendorProfile.id
      },
      include: {
        category: {
          select: { id: true, name: true }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true
          }
        },
        orderItems: {
          select: {
            quantity: true,
            total: true,
            order: {
              select: { createdAt: true }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate stats
    const totalSales = product.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const totalRevenue = product.orderItems.reduce((sum: number, item: any) => sum + Number(item.total), 0);
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
      : 0;

    res.json({
      success: true,
      data: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        category: product.category,
        totalSales,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private (Vendor)
router.post('/', authenticate, requireVendor, upload.array('images', 5), [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sourcing').isIn(['IN_HOUSE', 'OUTSOURCED']).withMessage('Invalid sourcing type'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('sku').optional().isString()
], async (req: any, res: any) => {
  try {
    console.log('=== PRODUCT CREATION REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vendorId = req.user.id;
    const {
      name,
      description,
      price,
      comparePrice,
      stock,
      sourcing,
      categoryId,
      sku,
      tags
    } = req.body;

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: vendorId }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    // Handle uploaded images - upload to Cloudinary
    let images: string[] = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file: any) => 
          uploadToCloudinary(file.buffer, 'products')
        );
        images = await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images'
        });
      }
    }

    // Generate unique SKU if not provided or if it already exists
    let finalSku = sku || `PROD-${Date.now()}`;
    
    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: finalSku }
    });
    
    if (existingProduct) {
      // Generate a unique SKU with timestamp and random number
      finalSku = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock),
        sourcing: sourcing as ProductSourcing,
        status: ProductStatus.PENDING, // All products require admin approval
        vendorId: vendorProfile.id,
        categoryId,
        sku: finalSku,
        images,
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map((tag: string) => tag.trim()) : tags) : []
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully. Awaiting admin approval.',
      data: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        category: product.category?.name || 'Uncategorized'
      }
    });
  } catch (error: any) {
    console.error('=== PRODUCT CREATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Vendor)
router.put('/:id', authenticate, requireVendor, upload.array('images', 5), [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Product description cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sourcing').optional().isIn(['IN_HOUSE', 'OUTSOURCED']).withMessage('Invalid sourcing type')
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
    const vendorId = req.user.id;

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: vendorId }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Check if product exists and belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        vendorId: vendorProfile.id
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.comparePrice) updateData.comparePrice = parseFloat(req.body.comparePrice);
    if (req.body.stock !== undefined) updateData.stock = parseInt(req.body.stock);
    if (req.body.sourcing) updateData.sourcing = req.body.sourcing;
    if (req.body.categoryId) updateData.categoryId = req.body.categoryId;
    if (req.body.sku) updateData.sku = req.body.sku;
    if (req.body.tags) updateData.tags = typeof req.body.tags === 'string' ? req.body.tags.split(',').map((tag: string) => tag.trim()) : req.body.tags;

    // Handle images - can be existing URLs or new uploads
    if (req.body.existingImages) {
      // If existingImages is provided, use those (might be a mix of Cloudinary URLs and new uploads)
      const existingImages = typeof req.body.existingImages === 'string' 
        ? JSON.parse(req.body.existingImages) 
        : req.body.existingImages;
      
      let finalImages: string[] = Array.isArray(existingImages) ? existingImages : [];
      
      // Upload any new images to Cloudinary
      if (req.files && req.files.length > 0) {
        try {
          const uploadPromises = req.files.map((file: any) => 
            uploadToCloudinary(file.buffer, 'products')
          );
          const newImages = await Promise.all(uploadPromises);
          finalImages = [...finalImages, ...newImages];
        } catch (error) {
          console.error('Error uploading images to Cloudinary:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload images'
          });
        }
      }
      
      updateData.images = finalImages;
    } else if (req.files && req.files.length > 0) {
      // If no existingImages provided, upload new images and append to existing
      try {
        const uploadPromises = req.files.map((file: any) => 
          uploadToCloudinary(file.buffer, 'products')
        );
        const newImages = await Promise.all(uploadPromises);
        updateData.images = [...existingProduct.images, ...newImages];
      } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images'
        });
      }
    }

    // If product was approved or has been sent back for changes (DRAFT with rejectionReason),
    // and vendor is updating it, set status back to pending for re-review
    const productWithReason = existingProduct as any;
    if (existingProduct.status === ProductStatus.APPROVED || 
        (existingProduct.status === ProductStatus.DRAFT && productWithReason.rejectionReason)) {
      updateData.status = ProductStatus.PENDING;
      // Clear rejection reason when vendor resubmits after making corrections
      // This allows for a fresh review cycle
      updateData.rejectionReason = null;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully. Awaiting admin approval.',
      data: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        category: product.category?.name || 'Uncategorized'
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private (Vendor)
router.delete('/:id', authenticate, requireVendor, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: vendorId }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Check if product exists and belongs to vendor
    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorId: vendorProfile.id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary if they're Cloudinary URLs
    if (product.images && product.images.length > 0) {
      try {
        const deletePromises = product.images
          .filter((url: string) => isCloudinaryUrl(url))
          .map((url: string) => deleteFromCloudinary(url).catch(err => {
            console.error(`Error deleting image ${url}:`, err);
            // Continue even if deletion fails
          }));
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete product
    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

export default router;