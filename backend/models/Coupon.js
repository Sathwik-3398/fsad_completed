import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  code: { type: String, unique: true, required: true },
  discountType: { type: String, enum: ['PERCENT', 'FIXED'], required: true },
  value: { type: Number, required: true },
  minOrder: { type: Number, required: true },
  expiryDate: Date,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  usageCount: { type: Number, default: 0 },
  maxUsage: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Coupon', couponSchema);
