import Subscription from '../models/Subscription.js';

export const addSubscription = async (req, res) => {
  try {
    const { userId, hubId, productId, quantity, frequency, startDate, endDate, billingDay, fixedDay } = req.body;
    const id = `SUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const subscription = new Subscription({
      id, userId, hubId, productId, quantity, frequency, startDate, endDate, status: 'ACTIVE', billingDay, fixedDay
    });
    
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const { userId, hubId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (hubId) query.hubId = hubId;
    
    const subscriptions = await Subscription.find(query);
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const subscription = await Subscription.findOneAndUpdate(
      { id: req.params.id },
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({ id: req.params.id });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ message: 'Subscription deleted', subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markSubscriptionDelivered = async (req, res) => {
  try {
    const { subscriptionId, deliveryPartnerId, deliveryDate } = req.body;
    
    // Calculate next delivery date based on frequency
    let nextDeliveryDate = new Date(deliveryDate);
    const subscription = await Subscription.findOne({ $or: [{ id: subscriptionId }, { _id: subscriptionId }] });
    
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    
    if (subscription.frequency === 'DAILY') {
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 1);
    } else if (subscription.frequency === 'ALTERNATE') {
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 2);
    } else if (subscription.frequency === 'WEEKLY') {
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 7);
    }
    
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { $or: [{ id: subscriptionId }, { _id: subscriptionId }] },
      { 
        lastDeliveredDate: new Date(deliveryDate),
        nextDeliveryDate: nextDeliveryDate,
        deliveryCount: (subscription.deliveryCount || 0) + 1,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json(updatedSubscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
