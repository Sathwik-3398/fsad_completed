import SavedAddress from '../models/SavedAddress.js';

export const addSavedAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;
    const id = `ADDR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const savedAddress = new SavedAddress({
      id, userId, address, isDefault: false
    });
    
    await savedAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSavedAddresses = async (req, res) => {
  try {
    const { userId } = req.query;
    const addresses = await SavedAddress.find({ userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeSavedAddress = async (req, res) => {
  try {
    const address = await SavedAddress.findOneAndDelete({ id: req.params.id });
    if (!address) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address deleted', address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Remove default from other addresses
    await SavedAddress.updateMany({ userId }, { isDefault: false });
    
    // Set this as default
    const address = await SavedAddress.findOneAndUpdate(
      { id: req.params.id },
      { isDefault: true },
      { new: true }
    );
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
