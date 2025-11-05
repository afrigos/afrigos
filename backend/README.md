# Afri GoS Backend API

A comprehensive backend API for the Afri GoS marketplace platform, built with Node.js, Express.js, TypeScript, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **User Management** - Admin, Vendor, and Customer user types
- **Product Management** - CRUD operations for products and categories
- **Order Management** - Complete order lifecycle management
- **Payment Processing** - Stripe and Flutterwave integration
- **Vendor Management** - Vendor profiles, earnings, and analytics
- **Admin Dashboard** - Platform management and analytics
- **Real-time Features** - Socket.io for live updates
- **File Upload** - AWS S3 integration for media storage
- **Email & SMS** - Notification services
- **Rate Limiting** - API protection and throttling

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Payments**: Stripe, Flutterwave
- **Real-time**: Socket.io
- **Email**: SendGrid/AWS SES
- **SMS**: Twilio

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Redis 6+
- AWS Account (for S3)
- Stripe Account
- Flutterwave Account (optional)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# (Optional) Open Prisma Studio
npm run studio
```

### 4. Start Development Server

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `PORT` | Server port (default: 3002) | ❌ |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | ✅ |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `SMTP_HOST` | Email SMTP host | ✅ |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | ❌ |

### Database Schema

The database schema is defined in `prisma/schema.prisma` and includes:

- **Users** - Admin, Vendor, Customer accounts
- **Products** - Product catalog with categories
- **Orders** - Order management and tracking
- **Payments** - Payment processing and records
- **Reviews** - Product and vendor reviews
- **Notifications** - User notifications
- **Analytics** - Platform analytics data

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/v1/auth/register     # Register new user
POST /api/v1/auth/login       # User login
GET  /api/v1/auth/me          # Get current user
POST /api/v1/auth/refresh     # Refresh token
```

### Vendor Endpoints

```
GET  /api/v1/vendors/profile      # Get vendor profile
POST /api/v1/vendors/profile      # Create/update vendor profile
GET  /api/v1/vendors/earnings     # Get vendor earnings
GET  /api/v1/vendors/analytics    # Get vendor analytics
```

### Product Endpoints

```
GET    /api/v1/products           # Get products
POST   /api/v1/products           # Create product
GET    /api/v1/products/:id       # Get product by ID
PUT    /api/v1/products/:id       # Update product
DELETE /api/v1/products/:id       # Delete product
```

### Order Endpoints

```
GET  /api/v1/orders           # Get orders
POST /api/v1/orders           # Create order
GET  /api/v1/orders/:id       # Get order by ID
PUT  /api/v1/orders/:id       # Update order status
```

### Admin Endpoints

```
GET  /api/v1/admin/dashboard      # Admin dashboard data
GET  /api/v1/admin/vendors        # Get all vendors
GET  /api/v1/admin/analytics      # Platform analytics
POST /api/v1/admin/vendors/:id/verify  # Verify vendor
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **ADMIN** - Full platform access
- **VENDOR** - Vendor-specific features
- **CUSTOMER** - Customer features

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📦 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

### Environment Variables for Production

Ensure all required environment variables are set in your production environment:

- Database connection strings
- JWT secrets
- AWS credentials
- Payment gateway keys
- Email/SMS service credentials

## 🔄 Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 📊 Monitoring & Logging

The API includes:

- Request logging with Morgan
- Error handling and logging
- Health check endpoint
- Rate limiting
- CORS protection
- Security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for Afri GoS marketplace.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔗 Related Projects

- [Afri GoS Frontend](../README.md) - React frontend application
- [Afri GoS Mobile](../mobile/README.md) - React Native mobile app



