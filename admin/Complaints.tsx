import React, { useEffect, useState } from "react";
import { AlertCircle, User, MessageSquare, Calendar, Zap } from "lucide-react";
import api from "../api";
import { useApp } from "../store";

const Complaints = () => {
  const { outlets } = useApp();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await api.getComplaints();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading complaints:", error);
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    try {
      await api.updateComplaintStatus(complaintId, newStatus);
      loadComplaints();
      alert("✅ Complaint updated to " + newStatus);
    } catch (error) {
      alert("❌ Failed to update complaint status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'OPEN':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPriorityColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const statusMatch = filterStatus === "ALL" || c.status === filterStatus;
    const hubMatch = !selectedHubId || c.hubId === selectedHubId;
    return statusMatch && hubMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Complaints</h2>
          <p className="text-slate-600 text-sm mt-1">Track and resolve customer complaints</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-amber-500 text-white px-4 py-2 rounded-lg font-bold">
          {complaints.length} Total
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
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid gap-4">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
            <AlertCircle size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-slate-600 font-bold">No complaints found</p>
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div key={c._id || c.id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-red-200">
              <div className="flex gap-4 mb-4">
                {/* Left Border Indicator */}
                <div className={`w-1 rounded-full ${c.status === 'RESOLVED' ? 'bg-green-500' : c.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Complaint ID</p>
                        <p className="text-lg font-black text-slate-900">#{(c.id || c._id).slice(0, 8)}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(c.status || 'OPEN')}`}>
                          {c.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
                        </span>
                        {c.complaintType && (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getPriorityColor(c.complaintType)}`}>
                            {c.complaintType?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600">{new Date(c.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(c.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="flex gap-2 items-start">
                        <User size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase">Customer</p>
                          <p className="text-sm font-semibold text-slate-900">{c.userName || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase">Type</p>
                        <p className="text-sm font-semibold text-slate-900">{c.complaintType || 'General'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase">Hub</p>
                        <p className="text-sm font-semibold text-slate-900">{c.hubId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <div className="flex gap-2 items-start">
                      <MessageSquare size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Description</p>
                        <p className="text-sm text-slate-900 bg-white rounded-lg p-3 border border-slate-200">
                          {c.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Reference if exists */}
                  {c.orderId && (
                    <div className="flex gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Zap size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase">Related Order</p>
                        <p className="text-sm font-semibold text-blue-900">{c.orderId}</p>
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1 block">Change Status</label>
                      <select
                        value={c.status || "OPEN"}
                        onChange={(e) => handleStatusChange(c._id || c.id, e.target.value)}
                        className={`w-full border-2 rounded-lg p-2 text-xs font-bold transition-colors cursor-pointer ${getStatusColor(c.status || 'OPEN')}`}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
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

export default Complaints;
