import DeliveryPartner from '../models/DeliveryPartner.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/authMiddleware.js';

export const addDeliveryPartner = async (req, res) => {
  try {
    const { hubId, username, name, phone, email, password, vehicleType, vehicleNumber, status } = req.body;
    
    // Validate required fields
    if (!hubId || !username || !name || !phone || !password) {
      return res.status(400).json({ error: 'Missing required fields: hubId, username, name, phone, password' });
    }
    
    const id = `DP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Check if username already exists
    const existingUsername = await DeliveryPartner.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'This username is already taken' });
    }
    
    // Check if phone already exists
    const existingPhone = await DeliveryPartner.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Delivery partner with this phone number already exists' });
    }
    
    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const partner = new DeliveryPartner({
      id,
      hubId,
      username,
      name,
      phone,
      email,
      password: hashedPassword,
      passwordEncrypted: true,
      vehicleType: vehicleType || 'BIKE',
      vehicleNumber,
      status: status || 'ACTIVE',
      isOnline: false,
      currentLocation: { lat: 0, lng: 0 },
      createdBy: 'admin'
    });
    
    await partner.save();
    res.status(201).json({
      id: partner.id,
      hubId: partner.hubId,
      username: partner.username,
      name: partner.name,
      phone: partner.phone,
      status: partner.status,
      message: '✅ Delivery partner created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDeliveryPartners = async (req, res) => {
  try {
    const { hubId } = req.query;
    const query = hubId ? { hubId } : {};
    const partners = await DeliveryPartner.find(query).select('-password');
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDeliveryPartner = async (req, res) => {
  try {
    const { status, isOnline, currentLocation, lastActiveAt } = req.body;
    const update = {};
    
    if (status) update.status = status;
    if (typeof isOnline === 'boolean') update.isOnline = isOnline;
    if (currentLocation) update.currentLocation = currentLocation;
    if (lastActiveAt) update.lastActiveAt = lastActiveAt;
    
    update.updatedAt = new Date();
    
    const partner = await DeliveryPartner.findOneAndUpdate(
      { id: req.params.id },
      update,
      { new: true }
    ).select('-password');
    
    if (!partner) return res.status(404).json({ error: 'Delivery partner not found' });
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDeliveryPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOneAndDelete({ id: req.params.id });
    if (!partner) return res.status(404).json({ error: 'Delivery partner not found' });
    res.json({ message: '✅ Delivery partner deleted successfully', id: partner.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDeliveryPartnerById = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ id: req.params.id }).select('-password');
    if (!partner) return res.status(404).json({ error: 'Delivery partner not found' });
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginDeliveryPartner = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }
    
    const partner = await DeliveryPartner.findOne({ phone });
    
    if (!partner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare passwords
    const isPasswordValid = bcrypt.compareSync(password, partner.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if partner is active
    if (partner.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Your account is not active. Contact admin.' });
    }
    
    // Generate JWT token
    const token = generateToken({
      id: partner.id,
      username: partner.username,
      hubId: partner.hubId,
      role: 'DELIVERY_PARTNER'
    });
    
    res.json({ 
      success: true,
      token,
      partner: {
        id: partner.id,
        username: partner.username,
        name: partner.name,
        phone: partner.phone,
        hubId: partner.hubId,
        vehicleType: partner.vehicleType,
        status: partner.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

