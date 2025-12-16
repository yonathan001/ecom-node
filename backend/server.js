const express = require('express');
const cors = require('cors');
require('dotenv').config();

const auth = require('./lib/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const profileRoutes = require('./routes/profile');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Better Auth routes - convert Express req/res to Web API format
app.all('/api/auth/*', async (req, res) => {
  try {
    // Create a Web Request object from Express request
    const url = new URL(req.url, `http://${req.headers.host}`);
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
    });

    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const response = await auth.handler(webRequest);
    
    // Convert Web Response to Express response
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
});

// Other routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

// Auto-seed database on first run
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('📦 No users found. Running initial seed...');
      const { execSync } = require('child_process');
      execSync('node prisma/seed.js', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Seed check error:', error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await checkAndSeed();
});
