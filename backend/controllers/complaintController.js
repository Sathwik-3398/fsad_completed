import Complaint from '../models/Complaint.js';

export const addComplaint = async (req, res) => {
  try {
    const { userId, orderId, hubId, category, description } = req.body;
    const id = `CMP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const complaint = new Complaint({
      id, userId, orderId, hubId, category, description, status: 'PENDING'
    });
    
    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const { userId, hubId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (hubId) query.hubId = hubId;
    
    const complaints = await Complaint.find(query);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findOneAndUpdate(
      { id: req.params.id },
      { 
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
        updatedAt: new Date()
      },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
