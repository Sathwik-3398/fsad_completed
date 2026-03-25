import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  hubId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: Number,
  frequency: { type: String, enum: ['DAILY', 'ALTERNATE', 'WEEKLY'] },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'CANCELLED'] },
  billingDay: Number,
  fixedDay: Boolean,
  lastDeliveredDate: Date,
  nextDeliveryDate: Date,
  deliveryCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Subscription', subscriptionSchema);
