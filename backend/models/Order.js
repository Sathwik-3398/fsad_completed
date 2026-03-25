import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  outletId: { type: String, required: true },
  hubId: String,
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: { type: String, enum: ['ordered', 'confirmed', 'packed', 'picked_up', 'in_transit', 'delivered', 'CANCELLED'] },
  deliveryAddress: String,
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'] },
  paymentMethod: { type: String, enum: ['WALLET', 'UPI', 'COD'] },
  orderType: { type: String, enum: ['ADHOC', 'SUBSCRIPTION'] },
  wantsInvoice: Boolean,
  assignedDeliveryPartner: String,
  totalAmount: Number,
  invoiceData: mongoose.Schema.Types.Mixed,
  timestamps: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
