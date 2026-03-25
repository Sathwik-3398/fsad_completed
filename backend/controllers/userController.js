import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const id = `USR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      id, name, email, phone, password: hashedPassword, role, walletBalance: 0
    });
    
    await user.save();
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_key');
    
    res.status(201).json({ user: user.toObject(), token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_key');
    
    res.json({ user: user.toObject(), token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWallet = async (req, res) => {
  try {
    const { amount, action } = req.body;
    const user = await User.findOne({ id: req.params.id });
    
    if (action === 'ADD') {
      user.walletBalance += amount;
    } else if (action === 'DEDUCT') {
      if (user.walletBalance < amount) return res.status(400).json({ error: 'Insufficient balance' });
      user.walletBalance -= amount;
    }
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
