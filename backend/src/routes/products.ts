import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireVendor, requireAdmin } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
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

    // Handle uploaded images
    const images = req.files ? req.files.map((file: any) => file.path) : [];

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

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file: any) => file.path);
      updateData.images = [...existingProduct.images, ...newImages];
    }

    // If product was approved and is being updated, set status back to pending
    if (existingProduct.status === ProductStatus.APPROVED) {
      updateData.status = ProductStatus.PENDING;
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