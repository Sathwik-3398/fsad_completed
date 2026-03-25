import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Hub from './models/Hub.js';
import DeliveryPartner from './models/DeliveryPartner.js';
import HubInventory from './models/HubInventory.js';
import Order from './models/Order.js';
import Subscription from './models/Subscription.js';
import Coupon from './models/Coupon.js';
import Complaint from './models/Complaint.js';
import SavedAddress from './models/SavedAddress.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Delete all collections
    await User.deleteMany({});
    console.log('🗑️ Cleared Users');
    
    await Product.deleteMany({});
    console.log('🗑️ Cleared Products');
    
    await Hub.deleteMany({});
    console.log('🗑️ Cleared Hubs');
    
    await DeliveryPartner.deleteMany({});
    console.log('🗑️ Cleared Delivery Partners');
    
    await HubInventory.deleteMany({});
    console.log('🗑️ Cleared Hub Inventory');
    
    await Order.deleteMany({});
    console.log('🗑️ Cleared Orders');
    
    await Subscription.deleteMany({});
    console.log('🗑️ Cleared Subscriptions');
    
    await Coupon.deleteMany({});
    console.log('🗑️ Cleared Coupons');
    
    await Complaint.deleteMany({});
    console.log('🗑️ Cleared Complaints');
    
    await SavedAddress.deleteMany({});
    console.log('🗑️ Cleared Saved Addresses');

    console.log('\n✅ All data cleared! Database is now empty.');
    console.log('📝 You can now create data manually through the portals.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearDatabase();
