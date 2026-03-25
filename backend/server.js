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

// Fallback environment variables injected by Assistant for Render
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dairy_secret_2026';

const app = express();

// Middleware - CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins temporarily for easier deployment
    callback(null, true);
  },
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
  process.env.MONGODB_URI || 'mongodb+srv://kit:kit@cluster0.f3pt3vc.mongodb.net/geetha-dairy?retryWrites=true&w=majority&appName=Cluster0';

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
