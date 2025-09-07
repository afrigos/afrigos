# AfriGos Admin Dashboard

A comprehensive admin dashboard for the AfriGos marketplace platform, built with React, TypeScript, and shadcn/ui.

## Features

- **Dashboard Overview** - Monitor marketplace metrics and performance
- **Vendor Management** - Review and approve vendor applications
- **Product Oversight** - Manage product listings and approvals
- **Order Management** - Track and manage customer orders
- **Customer Support** - Handle support tickets and inquiries
- **Analytics & Reporting** - View detailed analytics and generate reports
- **Security Monitoring** - Monitor platform security and compliance
- **Settings Management** - Configure platform settings

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query, Context API
- **Backend**: Express.js (API server)
- **Authentication**: JWT-based auth system

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd afrigos

# Install dependencies
npm install

# Start development server (frontend only)
npm run dev

# Start API server only
npm run server

# Start both frontend and API server
npm run dev:full
```

### Development

- **Frontend**: http://localhost:8083
- **API Server**: http://localhost:3002
- **API Health Check**: http://localhost:3002/api/v1/health

## API Endpoints

### Version 1 (`/api/v1`)

- `GET /health` - Health check
- `GET /dashboard/stats` - Dashboard statistics
- `GET /vendors/pending` - Pending vendor applications
- `GET /products/pending` - Pending product approvals

## Project Structure

```
afrigos/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard components
│   │   └── ui/             # Reusable UI components
│   ├── pages/
│   │   ├── admin/          # Admin page components
│   │   └── auth/           # Authentication pages
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utility functions
├── server/                 # Express.js API server
└── public/                 # Static assets
```

## Authentication

The dashboard uses a mock authentication system for development:

- **Email**: admin@afrigos.com
- **Password**: admin123

## Deployment

### Production Build

```bash
npm run build
```

### API Server

The Express.js server can be deployed separately or alongside the frontend.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software for AfriGos marketplace.
