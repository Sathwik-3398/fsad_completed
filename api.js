const API_URL = import.meta.env.VITE_API_URL || 'https://sri-geetha-dairy.onrender.com/api';

const api = {
  // User endpoints
  register: async (data) => {
    const res = await fetch(`${API_URL}/users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }
    return res.json();
  },

  login: async (data) => {
    const res = await fetch(`${API_URL}/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Invalid credentials');
    }
    return res.json();
  },

  getUser: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`);
    return res.json();
  },

  updateWallet: async (id, amount, action) => {
    const res = await fetch(`${API_URL}/users/${id}/wallet`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, action }) });
    return res.json();
  },

  getAllUsers: async () => {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch users');
    }
    return res.json();
  },

  // Product endpoints
  addProduct: async (data) => {
    const res = await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  getProducts: async () => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch products');
    }
    return res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Hub endpoints
  addHub: async (data) => {
    const res = await fetch(`${API_URL}/hubs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  getHubs: async () => {
    const res = await fetch(`${API_URL}/hubs`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch hubs');
    }
    return res.json();
  },

  deleteHub: async (id) => {
    const res = await fetch(`${API_URL}/hubs/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Inventory endpoints
  addStock: async (data) => {
    const res = await fetch(`${API_URL}/inventory`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to add stock');
    }
    return res.json();
  },

  getHubInventory: async (hubId) => {
    const res = await fetch(`${API_URL}/inventory?hubId=${hubId || ''}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch inventory');
    }
    return res.json();
  },

  updateStock: async (id, stock) => {
    const res = await fetch(`${API_URL}/inventory/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock }) });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update stock');
    }
    return res.json();
  },

  increaseStock: async (data) => {
    const res = await fetch(`${API_URL}/inventory/increase`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to increase stock');
    }
    return res.json();
  },

  decreaseStock: async (data) => {
    const res = await fetch(`${API_URL}/inventory/decrease`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to decrease stock');
    }
    return res.json();
  },

  deleteInventory: async (id) => {
    const res = await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete inventory');
    }
    return res.json();
  },

  // Order endpoints
  placeOrder: async (data) => {
    const res = await fetch(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to place order');
    }
    return res.json();
  },

  getOrders: async (userId, outletId) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (outletId) params.append('outletId', outletId);
    const res = await fetch(`${API_URL}/orders?${params}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch orders');
    }
    return res.json();
  },

  updateOrderStatus: async (id, status, assignedDeliveryPartner) => {
    const res = await fetch(`${API_URL}/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, assignedDeliveryPartner }) });
    return res.json();
  },

  // Subscription endpoints
  addSubscription: async (data) => {
    const res = await fetch(`${API_URL}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  getSubscriptions: async (userId, hubId) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (hubId) params.append('hubId', hubId);
    const res = await fetch(`${API_URL}/subscriptions?${params}`);
    return res.json();
  },

  updateSubscriptionStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/subscriptions/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    return res.json();
  },

  deleteSubscription: async (id) => {
    const res = await fetch(`${API_URL}/subscriptions/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Complaint endpoints
  addComplaint: async (data) => {
    const res = await fetch(`${API_URL}/complaints`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  getComplaints: async (userId, hubId) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (hubId) params.append('hubId', hubId);
    const res = await fetch(`${API_URL}/complaints?${params}`);
    return res.json();
  },

  updateComplaintStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/complaints/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    return res.json();
  },

  markSubscriptionDelivered: async (data) => {
    const res = await fetch(`${API_URL}/subscriptions/mark-delivered`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  // Coupon endpoints
  addCoupon: async (data) => {
    const res = await fetch(`${API_URL}/coupons`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  getCoupons: async () => {
    const res = await fetch(`${API_URL}/coupons`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch coupons');
    }
    return res.json();
  },

  validateCoupon: async (code, orderTotal) => {
    const res = await fetch(`${API_URL}/coupons/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, orderTotal }) });
    return res.json();
  },

  deleteCoupon: async (id) => {
    const res = await fetch(`${API_URL}/coupons/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Address endpoints
  addSavedAddress: async (data) => {
    const res = await fetch(`${API_URL}/addresses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  getSavedAddresses: async (userId) => {
    const res = await fetch(`${API_URL}/addresses?userId=${userId}`);
    return res.json();
  },

  removeSavedAddress: async (id) => {
    const res = await fetch(`${API_URL}/addresses/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Delivery Partner endpoints
  addDeliveryPartner: async (data) => {
    const res = await fetch(`${API_URL}/delivery-partners`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  getDeliveryPartners: async (hubId) => {
    const url = new URL(`${API_URL}/delivery-partners`);
    if (hubId) url.searchParams.append('hubId', hubId);
    const res = await fetch(url);
    return res.json();
  },

  updateDeliveryPartner: async (id, data) => {
    const res = await fetch(`${API_URL}/delivery-partners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  deleteDeliveryPartner: async (id) => {
    const res = await fetch(`${API_URL}/delivery-partners/${id}`, { method: 'DELETE' });
    return res.json();
  },

  loginDeliveryPartner: async (data) => {
    const res = await fetch(`${API_URL}/delivery-partners/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Delivery partner login failed');
    }
    return res.json();
  },

  getDeliveryPartnerOrders: async (deliveryPartnerId) => {
    const res = await fetch(`${API_URL}/orders/delivery-partner/${deliveryPartnerId}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Failed to fetch orders: ${res.status}`);
    }
    return res.json();
  }
};

export default api;
