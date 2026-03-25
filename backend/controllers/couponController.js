import Coupon from '../models/Coupon.js';

export const addCoupon = async (req, res) => {
  try {
    const { code, discountType, value, minOrder, expiryDate, maxUsage } = req.body;
    const id = `CPN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const coupon = new Coupon({
      id, code: code.toUpperCase(), discountType, value, minOrder, expiryDate, status: 'ACTIVE', maxUsage
    });
    
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    if (coupon.status !== 'ACTIVE') return res.status(400).json({ error: 'Coupon inactive' });
    if (new Date() > new Date(coupon.expiryDate)) return res.status(400).json({ error: 'Coupon expired' });
    if (orderTotal < coupon.minOrder) return res.status(400).json({ error: `Minimum order ${coupon.minOrder} required` });
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) return res.status(400).json({ error: 'Coupon usage limit reached' });
    
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const incrementCouponUsage = async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndUpdate(
      { id: req.params.id },
      { usageCount: (await Coupon.findOne({ id: req.params.id })).usageCount + 1 },
      { new: true }
    );
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndDelete({ id: req.params.id });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted', coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
