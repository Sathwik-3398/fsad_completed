import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  hubId: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  passwordEncrypted: { type: Boolean, default: false },
  vehicleType: { 
    type: String, 
    enum: ['BIKE', 'SCOOTER', 'CAR'], 
    default: 'BIKE' 
  },
  vehicleNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'ON_BREAK'], 
    default: 'ACTIVE' 
  },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  deliveriesCompleted: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  isOnline: { type: Boolean, default: false },
  lastActiveAt: Date,
  createdBy: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('DeliveryPartner', deliveryPartnerSchema);
