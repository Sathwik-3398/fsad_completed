import React, { useEffect, useState } from "react";
import { RefreshCw, Calendar, Package, DollarSign, User } from "lucide-react";
import api from "../api";
import { useApp } from "../store";

const Subscriptions = () => {
  const { outlets } = useApp();
  const [subs, setSubs] = useState<any[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    loadSubs();
  }, []);

  const loadSubs = async () => {
    try {
      const data = await api.getSubscriptions();
      setSubs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    }
  };

  const handleStatusChange = async (subId: string, newStatus: string) => {
    try {
      await api.updateSubscriptionStatus(subId, newStatus);
      loadSubs();
      alert("✅ Subscription updated to " + newStatus);
    } catch (error) {
      alert("❌ Failed to update subscription status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'PAUSED':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'CANCELED':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const filteredSubs = subs.filter((s) => {
    const statusMatch = filterStatus === "ALL" || s.status === filterStatus;
    const hubMatch = !selectedHubId || s.hubId === selectedHubId;
    return statusMatch && hubMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Subscriptions</h2>
          <p className="text-slate-600 text-sm mt-1">Manage ongoing customer subscriptions</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg font-bold">
          {subs.length} Active
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
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="CANCELED">Canceled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid gap-4">
        {filteredSubs.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
            <RefreshCw size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-slate-600 font-bold">No subscriptions found</p>
          </div>
        ) : (
          filteredSubs.map((s) => (
            <div key={s._id || s.id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Subscription ID & Status */}
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Sub ID</p>
                  <p className="text-lg font-black text-slate-900 mb-3">#{(s.id || s._id).slice(0, 8)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(s.status || 'ACTIVE')}`}>
                    {s.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>

                {/* Customer & Hub */}
                <div className="md:col-span-2">
                  <div className="flex gap-2 mb-3">
                    <User size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                      <p className="text-sm font-semibold text-slate-900">{s.userId?.slice(0, 12)}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hub</p>
                  <p className="text-sm text-slate-700">{s.hubId || 'N/A'}</p>
                </div>

                {/* Product & Quantity */}
                <div className="md:col-span-2">
                  <div className="flex gap-2 items-start">
                    <Package size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Product</p>
                      <p className="text-sm font-semibold text-slate-900">{s.productId?.slice(0, 12)}</p>
                      <p className="text-xs text-slate-600 mt-1">Qty: {s.quantity || 1}/day</p>
                    </div>
                  </div>
                </div>

                {/* Frequency & Duration */}
                <div className="md:col-span-2">
                  <div className="flex gap-2 items-start">
                    <Calendar size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Frequency</p>
                      <p className="text-sm font-semibold text-slate-900">{s.frequency || 'DAILY'}</p>
                      <p className="text-xs text-slate-600 mt-1">For {s.duration || 30} days</p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="md:col-span-2">
                  <div className="flex gap-2 items-start">
                    <DollarSign size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-lg font-black text-green-600">₹{s.totalPrice || 0}</p>
                      <p className="text-xs text-slate-600 mt-1">{new Date(s.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="md:col-span-2 flex items-end">
                  <div className="w-full">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Update</label>
                    <select
                      value={s.status || "ACTIVE"}
                      onChange={(e) => handleStatusChange(s._id || s.id, e.target.value)}
                      className={`w-full border-2 rounded-lg p-2 text-xs font-bold transition-colors cursor-pointer ${getStatusColor(s.status || 'ACTIVE')}`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">Paused</option>
                      <option value="CANCELED">Canceled</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dates Footer */}
              <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="font-bold text-slate-600">Start Date</p>
                  <p className="text-slate-900">{new Date(s.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-600">Days Remaining</p>
                  <p className="text-slate-900 font-black text-green-600">{s.duration || 30}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-600">Price/Day</p>
                  <p className="text-slate-900">₹{Math.round((s.totalPrice || 0) / (s.duration || 30))}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-600">Status Type</p>
                  <p className="text-slate-900 capitalize">{s.status?.toLowerCase()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
