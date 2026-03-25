import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['CUSTOMER', 'ADMIN', 'DELIVERY_PARTNER'], required: true },
  avatar: String,
  walletBalance: { type: Number, default: 0 },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
