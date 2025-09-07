const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// API Versioning
const v1Router = express.Router();

// Health check endpoint
v1Router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AfriGos Admin API v1 is running',
    timestamp: new Date().toISOString()
  });
});

// Admin Dashboard endpoints
v1Router.get('/dashboard/stats', (req, res) => {
  res.json({
    totalRevenue: 284590,
    activeVendors: 1247,
    productsListed: 12847,
    customerOrders: 8942
  });
});

v1Router.get('/vendors/pending', (req, res) => {
  res.json({
    vendors: [
      {
        id: "VA001",
        name: "Lagos Delights",
        email: "contact@lagosdelights.co.uk",
        status: "pending"
      }
    ]
  });
});

v1Router.get('/products/pending', (req, res) => {
  res.json({
    products: [
      {
        id: "P001",
        name: "Authentic Jollof Rice Spice Mix",
        vendor: "Mama Asha's Kitchen",
        status: "pending"
      }
    ]
  });
});

// Mount v1 API
app.use('/api/v1', v1Router);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 AfriGos Admin API running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/v1/health`);
});

module.exports = app;
