import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for memory storage (we'll upload to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string = 'banners'): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 400, crop: 'fill', quality: 'auto' }
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

// @desc    Get all banners
// @route   GET /api/v1/banners
// @access  Public
router.get('/', async (req: any, res: any) => {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners'
    });
  }
});

// @desc    Get all banners (admin)
// @route   GET /api/v1/banners/admin
// @access  Private (Admin)
router.get('/admin', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners'
    });
  }
});

// @desc    Create banner
// @route   POST /api/v1/banners
// @access  Private (Admin)
router.post('/', authenticate, requireAdmin, upload.single('image'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('subtitle').optional(),
  body('description').optional(),
  body('link').optional(),
  body('buttonText').optional(),
  body('order').optional().isInt().withMessage('Order must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const { title, subtitle, description, link, buttonText, order, isActive } = req.body;

    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'banners');

    // Get max order if not provided
    let bannerOrder = order;
    if (!bannerOrder) {
      const maxOrderBanner = await prisma.banner.findFirst({
        orderBy: { order: 'desc' }
      });
      bannerOrder = maxOrderBanner ? maxOrderBanner.order + 1 : 0;
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        link: link || null,
        buttonText: buttonText || 'Shop Now',
        order: bannerOrder,
        isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner'
    });
  }
});

// @desc    Update banner
// @route   PUT /api/v1/banners/:id
// @access  Private (Admin)
router.put('/:id', authenticate, requireAdmin, upload.single('image'), [
  body('title').optional(),
  body('subtitle').optional(),
  body('description').optional(),
  body('link').optional(),
  body('buttonText').optional(),
  body('order').optional().isInt().withMessage('Order must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
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
    const { title, subtitle, description, link, buttonText, order, isActive } = req.body;

    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!existingBanner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    let imageUrl = existingBanner.imageUrl;
    
    // Upload new image if provided
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'banners');
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (description !== undefined) updateData.description = description;
    if (link !== undefined) updateData.link = link;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (order !== undefined) updateData.order = parseInt(order);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    updateData.imageUrl = imageUrl;

    const banner = await prisma.banner.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner'
    });
  }
});

// @desc    Delete banner
// @route   DELETE /api/v1/banners/:id
// @access  Private (Admin)
router.delete('/:id', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Extract public_id from Cloudinary URL to delete the image
    try {
      const urlParts = banner.imageUrl.split('/');
      const publicIdWithExt = urlParts.slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicIdWithExt);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Continue with banner deletion even if Cloudinary deletion fails
    }

    await prisma.banner.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner'
    });
  }
});

export default router;

