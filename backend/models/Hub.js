import mongoose from 'mongoose';

const hubSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  serviceArea: { type: String },  // Maps to Outlet.serviceArea
  contactNumber: { type: String }, // Maps to Outlet.contactNumber
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Hub', hubSchema);
