import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import hubRoutes from './routes/hubs.js';
import inventoryRoutes from './routes/inventory.js';
import orderRoutes from './routes/orders.js';
import subscriptionRoutes from './routes/subscriptions.js';
import complaintRoutes from './routes/complaints.js';
import couponRoutes from './routes/coupons.js';
import addressRoutes from './routes/addresses.js';
import deliveryPartnerRoutes from './routes/delivery-partners.js';

dotenv.config();

const app = express();

// Middleware - CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:4000', 'http://localhost:5173', 'http://localhost:6011', 'http://10.231.37.2:3001', 'http://10.231.37.2:3002', 'http://10.231.37.2:3003', 'http://10.231.44.1:3001', 'http://10.231.44.1:3002', 'http://10.231.44.1:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Database Connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geetha-dairy';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/delivery-partners', deliveryPartnerRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Online',
    timestamp: new Date(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 6011;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
