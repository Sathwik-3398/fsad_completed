#!/usr/bin/env node

// Quick Admin User Creator
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async (email, password, name) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geetha-dairy');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`⚠️ Admin with email ${email} already exists!`);
      console.log(`ID: ${existingAdmin.id}`);
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Role: ${existingAdmin.role}`);
      
      // Ask if user wants to replace it
      console.log('\nTo replace this admin, run:');
      console.log(`node create-admin.js "${email}" "${password}" "${name}" --force`);
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Password hashed');

    // Create admin user
    const adminId = `USR-ADMIN-${Date.now()}`;
    const admin = new User({
      id: adminId,
      name: name || 'Admin User',
      email: email,
      phone: '9000000000',
      password: hashedPassword,
      role: 'ADMIN',
      walletBalance: 0,
      lastLogin: new Date()
    });

    await admin.save();
    console.log('\n✅ ADMIN CREATED SUCCESSFULLY!\n');

    console.log('📋 Admin Details:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`ID: ${adminId}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ADMIN`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    console.log('\n🌐 Login at: http://localhost:3002');

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get arguments from command line
const args = process.argv.slice(2);
const email = args[0] || 'admin@test.com';
const password = args[1] || 'password123';
const name = args[2] || 'Admin User';

console.log('🚀 Creating Admin User...\n');
createAdmin(email, password, name);
