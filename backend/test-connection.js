import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000
    });
    
    console.log('✅ MongoDB Connected successfully!');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
};

testConnection();
