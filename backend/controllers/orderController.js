import Order from '../models/Order.js';
import HubInventory from '../models/HubInventory.js';
import User from '../models/User.js';
import DeliveryPartner from '../models/DeliveryPartner.js';

export const placeOrder = async (req, res) => {
  try {
    const { userId, outletId, items, deliveryAddress, paymentMethod, wantsInvoice, totalAmount, invoiceData } = req.body;
    
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check inventory
    for (const item of items) {
      const inv = await HubInventory.findOne({ hubId: outletId, productId: item.productId });
      if (!inv || inv.stock < item.quantity) {
        return res.status(400).json({ error: `${item.name} is out of stock` });
      }
    }
    
    const id = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Assign a delivery partner from the hub
    const hubIdString = String(outletId);
    console.log(`🔍 Searching for active delivery partner for hub: ${hubIdString}`);
    
    // First, let's debug and see what delivery partners exist for this hub
    const allPartnersForHub = await DeliveryPartner.find({ hubId: hubIdString });
    console.log(`📋 Total delivery partners for hub ${hubIdString}: ${allPartnersForHub.length}`);
    if (allPartnersForHub.length > 0) {
      console.log(`   Partner details:`, allPartnersForHub.map(p => ({ id: p.id, status: p.status, name: p.name })));
    }
    
    const deliveryPartner = await DeliveryPartner.findOne({ 
      hubId: hubIdString, 
      status: 'ACTIVE' 
    });
    
    if (!deliveryPartner) {
      console.warn(`⚠️ WARNING: No active delivery partners found for hub: ${hubIdString}`);
      console.log('   -> This order will be placed without a delivery partner');
      console.log('   -> Admin needs to assign a delivery partner manually');
    } else {
      console.log(`✅ Found active delivery partner: ${deliveryPartner.id} (${deliveryPartner.name})`);
    }
    
    const assignedDeliveryPartnerId = deliveryPartner ? deliveryPartner.id : null;
    
    const order = new Order({
      id,
      userId,
      customerName: invoiceData?.customerName || user.name,
      customerEmail: invoiceData?.customerEmail || user.email,
      customerPhone: invoiceData?.customerPhone || user.phone,
      outletId,
      hubId: outletId,
      items,
      total: totalAmount || total,
      status: 'ordered',
      deliveryAddress,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      paymentMethod,
      orderType: 'ADHOC',
      wantsInvoice,
      totalAmount: totalAmount || total,
      invoiceData,
      assignedDeliveryPartner: assignedDeliveryPartnerId,
      timestamps: { ordered: new Date().toISOString() }
    });
    
    // Deduct inventory
    for (const item of items) {
      const inv = await HubInventory.findOne({ hubId: outletId, productId: item.productId });
      inv.stock -= item.quantity;
      await inv.save();
    }
    
    // Deduct from wallet if payment method is WALLET
    if (paymentMethod === 'WALLET') {
      user.walletBalance -= (totalAmount || total);
      await user.save();
    }
    
    await order.save();
    
    // Convert Mongoose document to plain object
    const orderResponse = order.toObject();
    
    // Ensure the response always has an 'id' field
    const responseData = {
      ...orderResponse,
      id: orderResponse.id || orderResponse._id.toString(),
      _id: orderResponse._id
    };
    
    console.log('✅ Order created successfully:', responseData.id, 'assigned to:', responseData.assignedDeliveryPartner || 'No partner');
    console.log('   📦 SAVED ORDER DETAILS:');
    console.log('   - assignedDeliveryPartner:', responseData.assignedDeliveryPartner);
    console.log('   - assignedDeliveryPartner TYPE:', typeof responseData.assignedDeliveryPartner);
    console.log('   - hubId:', responseData.hubId);
    console.log('   - FULL OBJECT:', JSON.stringify(responseData, null, 2));
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('❌ Order creation failed:', error.message, error.stack);
    res.status(500).json({ error: error.message, details: error.stack });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { userId, outletId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (outletId) query.outletId = outletId;
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, assignedDeliveryPartner } = req.body;
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { 
        status,
        assignedDeliveryPartner: assignedDeliveryPartner || undefined,
        updatedAt: new Date()
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderByDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPartnerId } = req.params;
    console.log(`🔍 Fetching orders for delivery partner: ${deliveryPartnerId}`);
    console.log(`   - SEARCHING FOR deliveryPartnerId TYPE: ${typeof deliveryPartnerId}`);
    console.log(`   - QUERY OBJECT: { assignedDeliveryPartner: "${deliveryPartnerId}" }`);
    
    // First, let's check ALL orders in the database
    const allOrders = await Order.find({}).sort({ createdAt: -1 });
    console.log(`   📊 TOTAL ORDERS IN DB: ${allOrders.length}`);
    if (allOrders.length > 0) {
      console.log(`   📋 ALL ORDERS - assignedDeliveryPartner values:`);
      allOrders.forEach(o => {
        console.log(`      - Order ${o.id}: assignedDeliveryPartner = "${o.assignedDeliveryPartner}" (TYPE: ${typeof o.assignedDeliveryPartner})`);
      });
    }
    
    // Now search for this specific partner
    const orders = await Order.find({ assignedDeliveryPartner: deliveryPartnerId }).sort({ createdAt: -1 });
    
    console.log(`📦 Found ${orders.length} orders for delivery partner ${deliveryPartnerId}`);
    if (orders.length > 0) {
      console.log('   Orders:', orders.map(o => ({ id: o.id, status: o.status, assignedDeliveryPartner: o.assignedDeliveryPartner })));
    }
    
    res.json(orders);
  } catch (error) {
    console.error(`❌ Error fetching orders for delivery partner:`, error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
