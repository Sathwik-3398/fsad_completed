import mongoose from 'mongoose';

const hubInventorySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  hubId: { type: String, required: true },
  productId: { type: String, required: true },
  stock: { type: Number, default: 0 },
  lastRestocked: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('HubInventory', hubInventorySchema);
