import React, { useEffect, useState } from "react";
import { ChevronDown, Truck, MapPin, DollarSign, Calendar } from "lucide-react";
import api from "../api";
import { useApp } from "../store";

const Orders = () => {
  const { outlets, deliveryPartners } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string>("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
      alert("✅ Order status updated to " + newStatus);
    } catch (error) {
      alert("❌ Failed to update order status");
    }
  };

  const handleAssignPartner = async (orderId: string, partnerId: string) => {
    if (!partnerId) {
      alert("❌ Please select a delivery partner");
      return;
    }
    try {
      const order = orders.find(o => (o._id || o.id) === orderId);
      const status = order?.status || 'ordered';
      await api.updateOrderStatus(orderId, status, partnerId);
      loadOrders();
      alert("✅ Delivery partner assigned successfully");
      setAssigningOrderId(null);
      setSelectedPartner("");
    } catch (error) {
      alert("❌ Failed to assign delivery partner");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'picked':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'PENDING':
      case 'ordered':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const filteredOrders = orders.filter((o) => {
    const statusMatch = filterStatus === "ALL" || o.status === filterStatus;
    const hubMatch = !selectedHubId || o.hubId === selectedHubId;
    return statusMatch && hubMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Orders</h2>
          <p className="text-slate-600 text-sm mt-1">Manage and track customer orders</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg font-bold">
          {orders.length} Total
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Filter by Hub</label>
          <select
            value={selectedHubId || ""}
            onChange={(e) => setSelectedHubId(e.target.value || null)}
            className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
          >
            <option value="">All Hubs</option>
            {outlets.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ordered">Ordered</option>
            <option value="picked">Picked</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
            <Truck size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-slate-600 font-bold">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((o) => (
            <div key={o._id || o.id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Order ID & Status */}
                <div className="md:col-span-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Order ID</p>
                  <p className="text-lg font-black text-slate-900 mb-3">#{(o.id || o._id).slice(0, 8)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(o.status || 'PENDING')}`}>
                    {o.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>

                {/* Customer & Hub Info */}
                <div className="md:col-span-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-sm font-bold text-slate-900 mb-2">{o.userId || 'Unknown'}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hub</p>
                  <p className="text-sm font-semibold text-slate-700">{o.hubId || 'N/A'}</p>
                </div>

                {/* Items & Amount */}
                <div className="md:col-span-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Items</p>
                  <p className="text-sm font-bold text-slate-900 mb-2">{o.items?.length || 0} items</p>
                  <div className="text-xs space-y-1">
                    {o.items?.slice(0, 2).map((item: any, idx: number) => (
                      <p key={idx} className="text-slate-600">• {item.name} ×{item.quantity}</p>
                    ))}
                    {o.items?.length > 2 && <p className="text-slate-600 font-semibold">+{o.items.length - 2} more</p>}
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Amount</p>
                  <p className="text-lg font-black text-green-600">₹{o.totalAmount || o.amount || 0}</p>
                  <p className="text-xs text-slate-600 mt-2">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Status Update */}
                <div className="md:col-span-1 flex items-end">
                  <div className="w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Update</label>
                    <select
                      value={o.status || "PENDING"}
                      onChange={(e) => handleStatusChange(o._id || o.id, e.target.value)}
                      className={`w-full border-2 rounded-lg p-2 text-xs font-bold transition-colors cursor-pointer ${getStatusColor(o.status || 'PENDING')}`}
                    >
                      <option value="ordered">Ordered</option>
                      <option value="picked">Picked</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="CANCELED">Canceled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Partner */}
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                <div className="flex gap-2 items-start">
                  <MapPin size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Delivery Address</p>
                    <p className="text-sm text-slate-900 font-semibold">{o.deliveryAddress?.hNo || 'N/A'}, {o.deliveryAddress?.colony || 'N/A'}</p>
                    <p className="text-xs text-slate-600">{o.deliveryAddress?.city || ''} - {o.deliveryAddress?.pincode || ''}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <Truck size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Assigned Delivery Partner</p>
                    {assigningOrderId === o._id || assigningOrderId === o.id ? (
                      <div className="flex gap-2">
                        <select
                          value={selectedPartner}
                          onChange={(e) => setSelectedPartner(e.target.value)}
                          className="flex-1 border-2 border-blue-300 p-2 rounded-lg text-sm font-semibold"
                        >
                          <option value="">Select Partner...</option>
                          {deliveryPartners.filter(p => p.hubId === o.hubId && p.status === 'ACTIVE').map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignPartner(o._id || o.id, selectedPartner)}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold text-xs hover:bg-green-600 transition-all"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => { setAssigningOrderId(null); setSelectedPartner(""); }}
                          className="px-3 py-2 bg-gray-400 text-white rounded-lg font-bold text-xs hover:bg-gray-500 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <p className={`text-sm font-semibold ${o.assignedDeliveryPartner ? 'text-green-600' : 'text-red-600'}`}>
                          {o.assignedDeliveryPartner || '❌ Not Assigned'}
                        </p>
                        {!o.assignedDeliveryPartner && (
                          <button
                            onClick={() => setAssigningOrderId(o._id || o.id)}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600 transition-all"
                          >
                            Assign Now
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
