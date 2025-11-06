# Cloudinary Setup Guide

## Overview
This project uses Cloudinary for image storage and management. All banner images are stored in Cloudinary and served via CDN.

## Setup Steps

### 1. Create a Cloudinary Account
1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account (includes 25GB storage and 25GB bandwidth)

### 2. Get Your Cloudinary Credentials
1. Log in to your Cloudinary dashboard
2. Go to Dashboard → Settings
3. Copy the following values:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Add Environment Variables

#### Backend (.env file)
Add these variables to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Production (Railway)
Add the same environment variables in your Railway project settings:
- Go to your Railway project → Variables
- Add `CLOUDINARY_CLOUD_NAME`
- Add `CLOUDINARY_API_KEY`
- Add `CLOUDINARY_API_SECRET`

### 4. Run Database Migration
```bash
cd backend
npx prisma migrate dev
```

This will create the `banners` table in your database.

### 5. Test the Setup
Once set up, you can:
- **View banners**: `GET /api/v1/banners` (public endpoint)
- **Create banners**: `POST /api/v1/banners` (admin only, requires authentication)
- **Update banners**: `PUT /api/v1/banners/:id` (admin only)
- **Delete banners**: `DELETE /api/v1/banners/:id` (admin only)

## Banner Management

### Creating a Banner via API
```bash
curl -X POST http://localhost:3002/api/v1/banners \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Mega Sale" \
  -F "subtitle=Up to 70% OFF" \
  -F "description=Shop the biggest deals" \
  -F "link=/products?sort=popular" \
  -F "buttonText=Shop Now" \
  -F "image=@/path/to/image.jpg"
```

### Banner Fields
- `title` (required): Main title of the banner
- `subtitle` (optional): Subtitle text
- `description` (optional): Description text
- `image` (required): Image file (JPEG, PNG, GIF, WebP)
- `link` (optional): Where the banner links to (e.g., `/products?sort=popular`)
- `buttonText` (optional): Button text (defaults to "Shop Now")
- `order` (optional): Display order (lower numbers appear first)
- `isActive` (optional): Whether the banner is active (defaults to true)

## Image Optimization
Cloudinary automatically:
- Optimizes images for web delivery
- Resizes to 1200x400px (banner format)
- Serves images via CDN for fast loading
- Provides responsive image URLs

## Notes
- Images are stored in the `banners` folder in your Cloudinary account
- The free tier includes 25GB storage and 25GB bandwidth per month
- For production, consider upgrading to a paid plan for more resources

