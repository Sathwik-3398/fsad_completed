import Product from '../models/Product.js';

export const addProduct = async (req, res) => {
  try {
    const { name, category, price, description, quantity, originalPrice, images, isSubscriptionAvailable, status } = req.body;
    const id = `PRD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const product = new Product({
      id,
      name,
      category,
      price,
      description,
      quantity: quantity || '',
      originalPrice: originalPrice || price,
      images: images || [],
      isSubscriptionAvailable: isSubscriptionAvailable || false,
      status: status || 'ACTIVE'
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
