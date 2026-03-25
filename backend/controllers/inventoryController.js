import HubInventory from '../models/HubInventory.js';

export const addStock = async (req, res) => {
  try {
    const { hubId, productId, quantity } = req.body;
    const id = `HINV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    let inventory = await HubInventory.findOne({ hubId, productId });
    
    if (inventory) {
      inventory.stock += quantity;
      inventory.lastRestocked = new Date();
      inventory.updatedAt = new Date();
      await inventory.save();
      return res.json({ ...inventory.toObject(), message: '✅ Stock added successfully' });
    }
    
    const newInventory = new HubInventory({
      id, hubId, productId, stock: quantity, lastRestocked: new Date()
    });
    
    await newInventory.save();
    res.status(201).json({ ...newInventory.toObject(), message: '✅ Inventory created and stock added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHubInventory = async (req, res) => {
  try {
    const { hubId } = req.query;
    let query = {};
    if (hubId) query.hubId = hubId;
    
    const inventory = await HubInventory.find(query);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const inventory = await HubInventory.findOneAndUpdate(
      { id: req.params.id },
      { stock, updatedAt: new Date() },
      { new: true }
    );
    if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
    res.json({ ...inventory.toObject(), message: '✅ Stock updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const increaseStock = async (req, res) => {
  try {
    const { hubId, productId, quantity } = req.body;
    
    if (!hubId || !productId || !quantity) {
      return res.status(400).json({ error: 'hubId, productId, and quantity are required' });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    let inventory = await HubInventory.findOne({ hubId, productId });
    
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory record not found. Please add stock first.' });
    }
    
    inventory.stock += quantity;
    inventory.lastRestocked = new Date();
    inventory.updatedAt = new Date();
    await inventory.save();
    
    res.json({ 
      ...inventory.toObject(),
      message: `✅ Stock increased by ${quantity}. New stock: ${inventory.stock}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const decreaseStock = async (req, res) => {
  try {
    const { hubId, productId, quantity } = req.body;
    
    if (!hubId || !productId || !quantity) {
      return res.status(400).json({ error: 'hubId, productId, and quantity are required' });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    const inventory = await HubInventory.findOne({ hubId, productId });
    
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory record not found' });
    }
    
    if (inventory.stock < quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock. Current stock: ${inventory.stock}, Requested: ${quantity}` 
      });
    }
    
    inventory.stock -= quantity;
    inventory.updatedAt = new Date();
    await inventory.save();
    
    res.json({ 
      ...inventory.toObject(),
      message: `✅ Stock decreased by ${quantity}. New stock: ${inventory.stock}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deductStock = async (req, res) => {
  try {
    const { hubId, productId, quantity } = req.body;
    
    const inventory = await HubInventory.findOne({ hubId, productId });
    if (!inventory || inventory.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    inventory.stock -= quantity;
    await inventory.save();
    res.json({ ...inventory.toObject(), message: '✅ Stock deducted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting inventory:', id);
    
    const inventory = await HubInventory.findOneAndDelete({ id });
    
    if (!inventory) {
      console.warn('⚠️ Inventory not found:', id);
      return res.status(404).json({ error: 'Inventory record not found' });
    }
    
    console.log('✅ Inventory deleted:', inventory.id);
    res.json({
      success: true,
      message: `✅ Inventory deleted: ${inventory.productId} from hub ${inventory.hubId}`,
      deletedInventory: inventory.toObject()
    });
  } catch (error) {
    console.error('❌ Delete failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};
