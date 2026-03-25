import mongoose from 'mongoose';

const savedAddressSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  address: String,
  isDefault: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('SavedAddress', savedAddressSchema);
