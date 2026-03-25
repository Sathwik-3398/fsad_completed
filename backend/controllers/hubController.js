import Hub from '../models/Hub.js';

export const addHub = async (req, res) => {
  try {
    const { name, address, serviceArea, contactNumber, status, lat, lng } = req.body;
    const id = `HUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const hub = new Hub({
      id,
      name,
      address,
      serviceArea: serviceArea || '',
      contactNumber: contactNumber || '',
      status: status || 'ACTIVE',
      lat: lat || 0,
      lng: lng || 0
    });
    
    await hub.save();
    res.status(201).json(hub);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHubs = async (req, res) => {
  try {
    const hubs = await Hub.find();
    res.json(hubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteHub = async (req, res) => {
  try {
    const hub = await Hub.findOneAndDelete({ id: req.params.id });
    if (!hub) return res.status(404).json({ error: 'Hub not found' });
    res.json({ message: 'Hub deleted', hub });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHubById = async (req, res) => {
  try {
    const hub = await Hub.findOne({ id: req.params.id });
    if (!hub) return res.status(404).json({ error: 'Hub not found' });
    res.json(hub);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
