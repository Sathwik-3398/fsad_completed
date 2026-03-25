import React, { useState, useEffect } from "react";
import { useApp } from "../store";
import { Trash2, Plus, Edit2, MapPin, Phone, Lock, User, AlertCircle } from "lucide-react";
import api from "../api";

const DeliveryPartners = () => {
  const { outlets, refreshDeliveryPartners } = useApp();
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    phone: "",
    password: "",
    hubId: "",
    vehicleType: "BIKE",
    vehicleNumber: "",
    email: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE"
  });

  useEffect(() => {
    loadDeliveryPartners();
  }, []);

  const loadDeliveryPartners = async () => {
    try {
      const data = await api.getDeliveryPartners();
      setDeliveryPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading delivery partners:", error);
    }
  };

  const resetForm = () => {
    setFormData({ 
      username: "", name: "", phone: "", password: "", hubId: "", 
      vehicleType: "BIKE", vehicleNumber: "", email: "", status: "ACTIVE" 
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.name || !formData.phone || !formData.password || !formData.hubId) {
      alert("❌ Please fill all required fields");
      return;
    }

    try {
      const result = await api.addDeliveryPartner({
        username: formData.username,
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        hubId: formData.hubId,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        email: formData.email || undefined,
        status: formData.status
      });

      if (result && result.id) {
        alert(`✅ Delivery partner created!\nUsername: ${result.username}\nPassword: ${formData.password}\n\nShare these credentials with the partner.`);
        await loadDeliveryPartners();
        try {
          if (refreshDeliveryPartners) await refreshDeliveryPartners();
        } catch (err) {
          console.warn('Failed to refresh global delivery partners:', err);
        }
        resetForm();
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message || 'Failed to create delivery partner'}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await api.deleteDeliveryPartner(id);
        alert("✅ Delivery partner deleted successfully");
        await loadDeliveryPartners();
        try {
          if (refreshDeliveryPartners) await refreshDeliveryPartners();
        } catch (err) {
          console.warn('Failed to refresh global delivery partners:', err);
        }
      } catch (error) {
        alert("❌ Failed to delete delivery partner");
      }
    }
  };

  const getHubName = (hubId: string) => {
    return outlets.find(h => h.id === hubId)?.name || hubId;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Delivery Partners</h2>
          <p className="text-slate-600 text-sm mt-1">Manage delivery personnel and assignments</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-bold"
        >
          <Plus size={20} /> Add Partner
        </button>
      </div>

      {/* Form Modal */}
      {isAdding && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            📝 Create New Delivery Partner
          </h3>
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Important:</strong> Admin creates credentials. Delivery partner logs in with username and password. They will be restricted to their assigned hub.
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required Fields */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Username * <span className="text-xs text-gray-500">(for login)</span></label>
                <input
                  type="text"
                  placeholder="e.g., john_delivery"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g., 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password * <span className="text-xs text-gray-500">(secure access)</span></label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assigned Hub *</label>
                <select
                  value={formData.hubId}
                  onChange={(e) => setFormData({ ...formData, hubId: e.target.value })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                  required
                >
                  <option value="">Select Hub</option>
                  {outlets.map(hub => (
                    <option key={hub.id} value={hub.id}>{hub.name} ({hub.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                >
                  <option value="BIKE">🚲 Bike</option>
                  <option value="SCOOTER">🛵 Scooter</option>
                  <option value="CAR">🚗 Car</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Number</label>
                <input
                  type="text"
                  placeholder="e.g., KA-05-AB-1234"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g., john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                ✅ Create Partner
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Partners List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">All Partners ({deliveryPartners.length})</h3>
        {deliveryPartners.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-gray-500 text-lg">No delivery partners yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {deliveryPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-bold text-slate-900">{partner.name}</h4>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        partner.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {partner.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User size={14} />
                      <span>@{partner.username}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(partner.id, partner.name)}
                      className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 bg-slate-50 p-2 rounded">
                    <Phone size={16} className="text-blue-600" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-slate-50 p-2 rounded">
                    <MapPin size={16} className="text-red-600" />
                    <span>{getHubName(partner.hubId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-slate-50 p-2 rounded">
                    <span className="text-lg">🚗</span>
                    <span>{partner.vehicleType} ({partner.vehicleNumber})</span>
                  </div>
                  {partner.email && (
                    <div className="flex items-center gap-2 text-gray-600 bg-slate-50 p-2 rounded">
                      <span>📧</span>
                      <span>{partner.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 bg-slate-50 p-2 rounded">
                    <span>🎯</span>
                    <span>{partner.deliveriesCompleted || 0} deliveries</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-slate-50 p-2 rounded">
                    <span>⭐</span>
                    <span>{partner.rating || 0} / 5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPartners;
