import React, { useState } from "react";
import { Building2, Plus, MapPin, Phone, Trash2 } from "lucide-react";
import { useApp } from "../store";
import api from "../api";

const Hubs = () => {
  const { outlets, addOutlet } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    address: "",
    serviceArea: "",
    contactNumber: "",
    status: "ACTIVE" as const,
    lat: 0,
    lng: 0
  });

  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      alert("Please fill required fields");
      return;
    }
    addOutlet(form);
    setForm({ name: "", address: "", serviceArea: "", contactNumber: "", status: "ACTIVE", lat: 0, lng: 0 });
    setShowForm(false);
  };

  const handleDeleteHub = async (hubId: string, hubName: string) => {
    if (window.confirm(`Are you sure you want to delete "${hubName}"? This action cannot be undone.`)) {
      try {
        await api.deleteHub(hubId);
        alert("✅ Hub deleted successfully");
        if (selectedHubId === hubId) {
          setSelectedHubId(null);
        }
      } catch (error) {
        alert("❌ Failed to delete hub");
      }
    }
  };

  const handleSelectHub = (hub: any) => {
    setSelectedHubId(hub.id);
  };

  const getVehicleIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'BIKE': return '🚲';
      case 'SCOOTER': return '🛵';
      case 'CAR': return '🚗';
      default: return '🚚';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hubs Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Distribution Hubs</h2>
              <p className="text-slate-600 text-sm mt-1">Manage delivery centers</p>
            </div>
            <button 
              onClick={() => setShowForm(true)} 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-bold"
            >
              <Plus size={18} /> Add Hub
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <form onSubmit={handleAddHub} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                <h3 className="text-xl font-black text-slate-900">Create New Hub</h3>
                
                <input 
                  type="text" 
                  placeholder="Hub Name" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Address" 
                  value={form.address} 
                  onChange={(e) => setForm({ ...form, address: e.target.value })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Service Area" 
                  value={form.serviceArea} 
                  onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                />
                <input 
                  type="text" 
                  placeholder="Contact Number" 
                  value={form.contactNumber} 
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                />
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="flex-1 bg-slate-300 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-400 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-bold"
                  >
                    Save Hub
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-3">
            {outlets.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                <Building2 size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-slate-600 font-bold">No hubs created yet</p>
              </div>
            ) : (
              outlets.map((hub) => (
                <div 
                  key={hub.id} 
                  className={`bg-gradient-to-br rounded-2xl shadow-lg hover:shadow-xl transition-all p-5 border-2 cursor-pointer group ${
                    selectedHubId === hub.id 
                      ? 'border-blue-500 from-blue-50 to-blue-100' 
                      : 'border-slate-200 from-white to-slate-50'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <Building2 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1" onClick={() => handleSelectHub(hub)}>
                      <h3 className="font-black text-slate-900">{hub.name}</h3>
                      <div className="space-y-1 mt-2 text-sm">
                        <div className="flex gap-2 items-center text-slate-700">
                          <MapPin size={14} />
                          <span>{hub.address}</span>
                        </div>
                        <div className="flex gap-2 items-center text-slate-600">
                          <Phone size={14} />
                          <span>{hub.contactNumber || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-slate-600">Area: {hub.serviceArea || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        {hub.status || 'ACTIVE'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHub(hub.id, hub.name);
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Hub"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hubs;