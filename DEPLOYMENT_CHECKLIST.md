# Deployment Checklist - AfriGos Platform

## ✅ Code Status
- [x] Code committed and pushed to GitHub
- [x] Migrations created and ready
- [x] Build configuration updated

## 📋 Next Steps

### Step 1: Sync Production Database (CRITICAL - Do This First!)

**Option A: Using Railway CLI (Recommended)**

1. Open your terminal and run:
   ```bash
   cd backend
   railway link
   ```
   Select your Railway project when prompted.

2. Run the sync script:
   ```bash
   ./sync-production-db.sh
   ```
   
   OR manually:
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma migrate status
   ```

**Option B: Using Railway Dashboard**

1. Go to Railway Dashboard → Your Project → Database Service
2. Click on "Query" tab
3. Or go to your Backend Service → "Deployments" → Latest deployment → "Shell"
4. Run: `npx prisma migrate deploy`

### Step 2: Verify Railway Deployment

1. Check Railway Dashboard:
   - Go to your backend service
   - Check "Deployments" tab - should show latest deployment
   - Check "Logs" tab - should show server starting
   - Check "Metrics" tab - should show service running

2. Test the backend:
   - Copy your Railway backend URL (e.g., `https://xxx.railway.app`)
   - Visit: `https://your-railway-url/api/v1/health`
   - Should return: `{"status":"OK",...}`

### Step 3: Verify Environment Variables in Railway

**Backend Service Variables (Railway Dashboard → Variables):**

Required:
- ✅ `DATABASE_URL` - Should be set automatically from PostgreSQL service
- ✅ `JWT_SECRET` - Must be set (generate a strong random string)
- ✅ `NODE_ENV=production`
- ✅ `PORT` - Auto-set by Railway
- ✅ `FRONTEND_URL` - Your Netlify URL (e.g., `https://afrigos.com`)
- ✅ `CORS_ORIGIN` - Your Netlify URL (e.g., `https://afrigos.com`)

Cloudinary (for image uploads):
- ✅ `CLOUDINARY_CLOUD_NAME`
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`

Optional:
- `REDIS_URL` (if using Redis)
- Email/SMS credentials (if using)

### Step 4: Deploy Frontend to Netlify

**Option A: If connected to GitHub (Auto-deploy)**

1. Netlify should auto-deploy when you push to main
2. Check Netlify Dashboard → Deploys

**Option B: Manual Deploy**

```bash
cd /Users/user/Herd/afrigos
npm run build
netlify deploy --prod
```

### Step 5: Update Frontend Environment Variables (Netlify)

**Netlify Dashboard → Site Settings → Environment Variables:**

Required:
- ✅ `VITE_API_URL` = `https://your-railway-backend-url/api/v1`

### Step 6: Verify Everything Works

1. **Backend Health Check:**
   - Visit: `https://your-railway-url/api/v1/health`
   - Should return OK

2. **Frontend:**
   - Visit: `https://afrigos.com` (or your Netlify URL)
   - Should load the marketplace homepage

3. **Test Login:**
   - Try admin login
   - Try vendor login
   - Try customer signup

4. **Test Product Approval:**
   - Login as admin
   - Go to Product Approval Queue
   - Verify pending products show

## 🔍 Troubleshooting

### Database Migration Issues:
```bash
cd backend
railway run npx prisma migrate status
railway run npx prisma migrate deploy
```

### Backend Not Starting:
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Check if DATABASE_URL is correct

### Frontend Can't Connect to Backend:
- Verify `VITE_API_URL` in Netlify matches your Railway URL
- Check CORS settings in backend
- Verify Railway service is running

### CORS Errors:
- Make sure `CORS_ORIGIN` in Railway includes your Netlify URL
- Check `FRONTEND_URL` is set correctly

## 📊 Current Migrations to Apply

These migrations need to be applied to production:

1. ✅ `20251105113020_init` - Initial schema
2. ✅ `20251106014259_add_banner_model` - Banner management
3. ✅ `20251106021841_add_rejection_reason` - Product rejection reason

All three should be applied with `npx prisma migrate deploy`





## ✅ Code Status
- [x] Code committed and pushed to GitHub
- [x] Migrations created and ready
- [x] Build configuration updated

## 📋 Next Steps

### Step 1: Sync Production Database (CRITICAL - Do This First!)

**Option A: Using Railway CLI (Recommended)**

1. Open your terminal and run:
   ```bash
   cd backend
   railway link
   ```
   Select your Railway project when prompted.

2. Run the sync script:
   ```bash
   ./sync-production-db.sh
   ```
   
   OR manually:
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma migrate status
   ```

**Option B: Using Railway Dashboard**

1. Go to Railway Dashboard → Your Project → Database Service
2. Click on "Query" tab
3. Or go to your Backend Service → "Deployments" → Latest deployment → "Shell"
4. Run: `npx prisma migrate deploy`

### Step 2: Verify Railway Deployment

1. Check Railway Dashboard:
   - Go to your backend service
   - Check "Deployments" tab - should show latest deployment
   - Check "Logs" tab - should show server starting
   - Check "Metrics" tab - should show service running

2. Test the backend:
   - Copy your Railway backend URL (e.g., `https://xxx.railway.app`)
   - Visit: `https://your-railway-url/api/v1/health`
   - Should return: `{"status":"OK",...}`

### Step 3: Verify Environment Variables in Railway

**Backend Service Variables (Railway Dashboard → Variables):**

Required:
- ✅ `DATABASE_URL` - Should be set automatically from PostgreSQL service
- ✅ `JWT_SECRET` - Must be set (generate a strong random string)
- ✅ `NODE_ENV=production`
- ✅ `PORT` - Auto-set by Railway
- ✅ `FRONTEND_URL` - Your Netlify URL (e.g., `https://afrigos.com`)
- ✅ `CORS_ORIGIN` - Your Netlify URL (e.g., `https://afrigos.com`)

Cloudinary (for image uploads):
- ✅ `CLOUDINARY_CLOUD_NAME`
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`

Optional:
- `REDIS_URL` (if using Redis)
- Email/SMS credentials (if using)

### Step 4: Deploy Frontend to Netlify

**Option A: If connected to GitHub (Auto-deploy)**

1. Netlify should auto-deploy when you push to main
2. Check Netlify Dashboard → Deploys

**Option B: Manual Deploy**

```bash
cd /Users/user/Herd/afrigos
npm run build
netlify deploy --prod
```

### Step 5: Update Frontend Environment Variables (Netlify)

**Netlify Dashboard → Site Settings → Environment Variables:**

Required:
- ✅ `VITE_API_URL` = `https://your-railway-backend-url/api/v1`

### Step 6: Verify Everything Works

1. **Backend Health Check:**
   - Visit: `https://your-railway-url/api/v1/health`
   - Should return OK

2. **Frontend:**
   - Visit: `https://afrigos.com` (or your Netlify URL)
   - Should load the marketplace homepage

3. **Test Login:**
   - Try admin login
   - Try vendor login
   - Try customer signup

4. **Test Product Approval:**
   - Login as admin
   - Go to Product Approval Queue
   - Verify pending products show

## 🔍 Troubleshooting

### Database Migration Issues:
```bash
cd backend
railway run npx prisma migrate status
railway run npx prisma migrate deploy
```

### Backend Not Starting:
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Check if DATABASE_URL is correct

### Frontend Can't Connect to Backend:
- Verify `VITE_API_URL` in Netlify matches your Railway URL
- Check CORS settings in backend
- Verify Railway service is running

### CORS Errors:
- Make sure `CORS_ORIGIN` in Railway includes your Netlify URL
- Check `FRONTEND_URL` is set correctly

## 📊 Current Migrations to Apply

These migrations need to be applied to production:

1. ✅ `20251105113020_init` - Initial schema
2. ✅ `20251106014259_add_banner_model` - Banner management
3. ✅ `20251106021841_add_rejection_reason` - Product rejection reason

All three should be applied with `npx prisma migrate deploy`








