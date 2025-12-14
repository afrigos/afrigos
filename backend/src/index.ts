import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth';
import adminAuthRoutes from './routes/admin-auth';
import userRoutes from './routes/users';
import vendorRoutes from './routes/vendors';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';
import categoriesRoutes from './routes/categories';
import vendorDashboardRoutes from './routes/vendor-dashboard';
import adminProductsRoutes from './routes/admin-products';
import reviewsRoutes from './routes/reviews';
import bannerRoutes from './routes/banners';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { authenticate } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins
    methods: ["GET", "POST"]
  }
});

// Initialize Prisma
export const prisma = new PrismaClient();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3002", "*"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
// CORS configuration - Allow all origins for now
// Default origins kept for reference/documentation
const defaultOrigins = [
  "http://localhost:8081",
  "http://localhost:8083",
  "http://localhost:8084", 
  "http://localhost:3000",
  "https://afrigos-production.netlify.app",
  "https://afrigos.netlify.app",
  "https://www.afrigos.com",
  "https://afrigos.com"
];

// Allow all origins - no blocking
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Stripe webhook needs raw body, so we handle it at route level
// Apply JSON parsing to all routes except webhook
app.use((req, res, next) => {
  if (req.path === '/api/v1/payments/webhook') {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin-auth', adminAuthRoutes);

// Public user routes (no auth required) - must be before protected routes
import { sendAccountDeletionRequestEmail } from './services/emailService';
import { body, validationResult } from 'express-validator';

app.post('/api/v1/users/request-deletion-public', [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('reason').optional().trim()
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

    const { email, reason } = req.body;
    // Note: prisma is already defined globally above

    // Look up user by email to get their details
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    // Send email notification to admin
    try {
      await sendAccountDeletionRequestEmail({
        userEmail: email.toLowerCase().trim(),
        firstName: user?.firstName || 'Unknown',
        lastName: user?.lastName || '',
        role: user?.role || 'UNKNOWN',
        userId: user?.id || 'N/A',
        reason: reason || undefined
      });
    } catch (emailError) {
      console.error('Failed to send deletion request email:', emailError);
    }

    res.json({
      success: true,
      message: 'Account deletion request has been submitted. Our team will process your request shortly.'
    });
  } catch (error) {
    console.error('Request account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit account deletion request'
    });
  }
});

// Protected user routes
app.use('/api/v1/users', authenticate, userRoutes);
app.use('/api/v1/vendors', authenticate, vendorRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', authenticate, orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', authenticate, adminRoutes);
app.use('/api/v1/analytics', authenticate, analyticsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/vendor', vendorDashboardRoutes);
app.use('/api/v1/admin/products', adminProductsRoutes);
app.use('/api/v1/reviews', authenticate, reviewsRoutes);
app.use('/api/v1/banners', bannerRoutes);

// Serve static files (uploads) with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static('uploads'));

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-vendor-room', (vendorId) => {
    socket.join(`vendor-${vendorId}`);
    console.log(`User joined vendor room: ${vendorId}`);
  });

  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('User joined admin room');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`🚀 Afri GoS Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export { io };
