#!/bin/bash

# Afri GoS Backend Setup Script
echo "🚀 Setting up Afri GoS Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 13+ first."
    echo "   Visit: https://www.postgresql.org/download/"
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis is not installed. Please install Redis 6+ first."
    echo "   Visit: https://redis.io/download"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "✅ Environment file created. Please edit .env with your configuration."
else
    echo "✅ Environment file already exists."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run generate

# Check if database is accessible
echo "🔍 Checking database connection..."
if npm run migrate &> /dev/null; then
    echo "✅ Database connection successful."
else
    echo "⚠️  Database migration failed. Please check your DATABASE_URL in .env"
    echo "   Make sure PostgreSQL is running and the database exists."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Make sure PostgreSQL and Redis are running"
echo "3. Run 'npm run migrate' to set up the database"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📚 For more information, see README.md"



