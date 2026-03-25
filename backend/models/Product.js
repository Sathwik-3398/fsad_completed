import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  quantity: { type: String },
  images: { type: [String], default: [] },
  description: { type: String },
  isSubscriptionAvailable: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
