import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all categories with pagination and filtering
router.get('/', async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    if (type && type !== 'all') {
      where.type = type as any; // Cast to the enum type
    }

    // Get categories with product counts
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get total count
    const total = categories.length;

    // Apply pagination to the results
    const paginatedCategories = categories.slice(skip, skip + limitNum);

    // Transform data to include real vendor counts and revenue
    const transformedCategories = await Promise.all(paginatedCategories.map(async (category) => {
      // Get unique vendors for this category
      const vendorCount = await prisma.vendorProfile.count({
        where: {
          products: {
            some: {
              categoryId: category.id
            }
          }
        }
      });

      // Calculate total revenue from completed orders for products in this category
      const revenueResult = await prisma.orderItem.aggregate({
        where: {
          product: {
            categoryId: category.id
          },
          order: {
            paymentStatus: 'COMPLETED'
          }
        },
        _sum: {
          total: true
        }
      });

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        type: category.type,
        status: category.isActive ? 'active' : 'inactive',
        vendorCount,
        productCount: category._count.products,
        revenue: `£${(revenueResult._sum.total || 0).toLocaleString()}`,
        createdAt: category.createdAt.toISOString().split('T')[0],
        updatedAt: category.updatedAt.toISOString().split('T')[0]
      };
    }));

    res.json({
      success: true,
      data: transformedCategories,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Get single category
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get real vendor count for this category
    const vendorCount = await prisma.vendorProfile.count({
      where: {
        products: {
          some: {
            categoryId: category.id
          }
        }
      }
    });

    // Calculate total revenue from completed orders for products in this category
    const revenueResult = await prisma.orderItem.aggregate({
      where: {
        product: {
          categoryId: category.id
        },
        order: {
          paymentStatus: 'COMPLETED'
        }
      },
      _sum: {
        total: true
      }
    });

    const transformedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      type: category.type,
      status: category.isActive ? 'active' : 'inactive',
      vendorCount,
      productCount: category._count.products,
      revenue: `£${(revenueResult._sum.total || 0).toLocaleString()}`,
      createdAt: category.createdAt.toISOString().split('T')[0],
      updatedAt: category.updatedAt.toISOString().split('T')[0]
    };

    res.json({
      success: true,
      data: transformedCategory
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
});

// Create new category
router.post('/', authenticate, requireAdmin, [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional().isString(),
  body('type').optional().isString(),
  body('status').optional().isIn(['active', 'inactive'])
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

    const { name, description, type, status } = req.body;

    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || '',
        type: (type as any) || 'AugmentableProduct',
        isActive: status === 'active' || status === undefined
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

// Update category
router.put('/:id', authenticate, requireAdmin, [
  body('name').optional().notEmpty().withMessage('Category name cannot be empty'),
  body('description').optional().isString(),
  body('type').optional().isString(),
  body('status').optional().isIn(['active', 'inactive'])
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
    const { name, description, type, status } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name }
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type as any;
    if (status !== undefined) updateData.isActive = status === 'active';

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

// Delete category
router.delete('/:id', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    if (category._count.products > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
});

export default router;
