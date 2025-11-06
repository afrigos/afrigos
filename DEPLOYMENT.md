# Deployment Guide - AfriGos Platform

This guide ensures your production database is in sync with your local schema before deploying.

## Prerequisites

1. Railway CLI installed (✅ Already installed)
2. Railway account with project created
3. PostgreSQL database added to Railway project
4. Environment variables configured in Railway

## Step 1: Sync Production Database (CLI Method - Recommended)

### Option A: Using Railway CLI (Best for Manual Control)

1. **Link your project to Railway:**
   ```bash
   cd backend
   railway link
   ```
   Select your Railway project when prompted.

2. **Check current migration status:**
   ```bash
   railway run npx prisma migrate status
   ```
   This shows which migrations have been applied to production.

3. **Apply all pending migrations:**
   ```bash
   railway run npx prisma migrate deploy
   ```
   This will apply all migrations that haven't been run yet on production.

4. **Verify the sync:**
   ```bash
   railway run npx prisma migrate status
   ```
   Should show all migrations as applied.

### Option B: Automatic Migration (Already Configured)

The `nixpacks.toml` and `railway.json` are already configured to run migrations automatically during build. However, this can fail if:
- Database is down during build
- Migration conflicts occur
- You want more control

**Recommendation:** Use CLI method for initial sync and important migrations, keep automatic for routine deployments.

## Step 2: Deploy Backend to Railway

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Railway will automatically deploy** (if connected to GitHub)

   OR manually deploy:
   ```bash
   railway up
   ```

3. **Verify deployment:**
   - Check Railway dashboard for deployment status
   - Check logs: `railway logs`
   - Test health endpoint: `https://your-railway-url/api/v1/health`

## Step 3: Deploy Frontend to Netlify

1. **Build the frontend:**
   ```bash
   cd .. # Go to root
   npm run build
   ```

2. **Deploy to Netlify:**
   - Push to GitHub (if connected)
   - OR use Netlify CLI: `netlify deploy --prod`

3. **Update environment variables in Netlify:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add/Update: `VITE_API_URL=https://your-railway-backend-url/api/v1`

## Step 4: Verify Production Database

After deployment, verify everything is in sync:

```bash
cd backend
railway run npx prisma migrate status
```

All migrations should show as applied:
- ✅ `20251105113020_init`
- ✅ `20251106014259_add_banner_model`
- ✅ `20251106021841_add_rejection_reason`

## Current Migrations Status

Your local database has these migrations:
1. `20251105113020_init` - Initial schema
2. `20251106014259_add_banner_model` - Banner management
3. `20251106021841_add_rejection_reason` - Product rejection reason field

All of these need to be applied to production.

## Troubleshooting

### Migration fails:
```bash
# Check what migrations are pending
railway run npx prisma migrate status

# Try applying again
railway run npx prisma migrate deploy

# If still failing, check database connection
railway variables
# Verify DATABASE_URL is set correctly
```

### Database connection issues:
```bash
# Test connection
railway run npx prisma db pull
```

### View production database:
```bash
railway run npx prisma studio
# Opens Prisma Studio connected to production database
```

## Quick Deploy Commands

```bash
# 1. Sync database (run this first)
cd backend
railway link  # Only needed once
railway run npx prisma migrate deploy

# 2. Deploy backend
railway up

# 3. Verify
railway logs
railway run npx prisma migrate status
```

## Environment Variables Needed

### Railway (Backend):
- `DATABASE_URL` - From Railway PostgreSQL service
- `JWT_SECRET` - Strong random string
- `NODE_ENV=production`
- `PORT` - Auto-set by Railway
- `FRONTEND_URL` - Your Netlify URL
- `CORS_ORIGIN` - Your Netlify URL
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Netlify (Frontend):
- `VITE_API_URL` - Your Railway backend URL + `/api/v1`

