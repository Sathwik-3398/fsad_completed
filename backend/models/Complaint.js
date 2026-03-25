import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  orderId: { type: String, default: '' },
  hubId: { type: String, required: true },
  category: String,
  description: String,
  status: { type: String, enum: ['PENDING', 'RESOLVED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Complaint', complaintSchema);
