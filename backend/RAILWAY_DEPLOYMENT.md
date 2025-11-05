# Railway Deployment Guide

## Prerequisites
1. GitHub account with your code pushed
2. Railway account (sign up at https://railway.app)

## Step 1: Create Railway Project

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `afrigos` repository
5. Select the `backend` folder as the root directory

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service variables

## Step 3: Configure Environment Variables

In your Railway service, go to "Variables" tab and add:

### Required Variables:
```
DATABASE_URL=<from Railway PostgreSQL service>
JWT_SECRET=<generate a strong random string>
PORT=3002 (or let Railway auto-assign)
NODE_ENV=production
FRONTEND_URL=<your-netlify-frontend-url>
CORS_ORIGIN=<your-netlify-frontend-url>
```

### Optional Variables (add as needed):
```
REDIS_URL=<if using Redis>
AWS_ACCESS_KEY_ID=<for file uploads>
AWS_SECRET_ACCESS_KEY=<for file uploads>
AWS_REGION=us-east-1
AWS_S3_BUCKET=afrigos-uploads
STRIPE_SECRET_KEY=<if using Stripe>
SMTP_HOST=<for emails>
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<password>
```

## Step 4: Run Database Migrations

1. In Railway, go to your service
2. Click on the "Deployments" tab
3. Click on the latest deployment
4. Open the "Shell" tab
5. Run: `npx prisma migrate deploy`

## Step 5: Get Your Backend URL

1. Railway will automatically assign a public URL
2. Go to your service → "Settings" → "Networking"
3. Generate a public domain (or use the default)
4. Copy the URL (e.g., `https://afrigos-backend-production.up.railway.app`)

## Step 6: Update Frontend Environment

In your Netlify frontend:
1. Go to Site settings → Environment variables
2. Add: `VITE_API_URL=https://your-railway-backend-url/api/v1`

## Step 7: Deploy

Railway will automatically deploy when you push to your main branch!

## Troubleshooting

### Database connection issues:
- Make sure `DATABASE_URL` is set correctly
- Run migrations: `npx prisma migrate deploy`
- Check if database is running in Railway

### Build fails:
- Check Railway logs for errors
- Ensure all dependencies are in package.json
- Verify TypeScript compilation works locally

### Port issues:
- Railway automatically sets `PORT` environment variable
- Your code already uses `process.env.PORT || 3002` ✅

## File Uploads

For file uploads, you have two options:
1. Use AWS S3 (recommended for production)
2. Use Railway's file system (temporary, files reset on deploy)

For S3, configure AWS credentials in Railway environment variables.
