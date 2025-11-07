#!/bin/bash

# Script to sync production database with migrations
# Usage: ./sync-production-db.sh

echo "🔍 Checking Railway connection..."
railway status || {
    echo "❌ Not connected to Railway. Please run: railway link"
    exit 1
}

echo "📊 Checking migration status..."
railway run npx prisma migrate status

echo ""
echo "🚀 Applying migrations to production..."
railway run npx prisma migrate deploy

echo ""
echo "✅ Verifying migrations..."
railway run npx prisma migrate status

echo ""
echo "✨ Database sync complete!"


