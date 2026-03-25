import React, { useState } from "react";
import { Ticket, Plus, Trash2, Calendar, DollarSign, TrendingDown } from "lucide-react";
import { useApp } from "../store";
import api from "../api";

const Coupons = () => {
  const { coupons, addCoupon } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT" as const,
    value: 0,
    minOrder: 0,
    expiryDays: 30,
    status: "ACTIVE" as const,
    description: ""
  });

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) {
      alert("Please fill all required fields");
      return;
    }
    addCoupon({
      code: form.code,
      discountType: form.discountType,
      value: Number(form.value),
      minOrder: Number(form.minOrder),
      expiryDate: new Date(Date.now() + form.expiryDays * 24 * 60 * 60 * 1000).toISOString(),
      status: form.status,
      description: form.description
    });
    setForm({ code: "", discountType: "PERCENT", value: 0, minOrder: 0, expiryDays: 30, status: "ACTIVE", description: "" });
    setShowForm(false);
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await api.deleteCoupon(couponId);
        alert("✅ Coupon deleted");
      } catch (error) {
        alert("❌ Failed to delete coupon");
      }
    }
  };

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Coupons</h2>
          <p className="text-slate-600 text-sm mt-1">Generate and manage discount coupons</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-bold"
        >
          <Plus size={20} /> Generate Coupon
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddCoupon} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-6">
            <h3 className="text-2xl font-black text-slate-900">Create New Coupon</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Coupon Code *</label>
                <input 
                  type="text" 
                  placeholder="e.g., SAVE20" 
                  value={form.code} 
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-bold uppercase hover:border-slate-400 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Discount Type *</label>
                <select 
                  value={form.discountType} 
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as any })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                >
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Discount Value *</label>
                <input 
                  type="number" 
                  placeholder="e.g., 20" 
                  value={form.value} 
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Order (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 500" 
                  value={form.minOrder} 
                  onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Valid For (Days) *</label>
                <input 
                  type="number" 
                  placeholder="e.g., 30" 
                  value={form.expiryDays} 
                  onChange={(e) => setForm({ ...form, expiryDays: Number(e.target.value) })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                <select 
                  value={form.status} 
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
              <textarea 
                placeholder="e.g., New Year Special - 20% off on all dairy products" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="flex-1 bg-slate-300 text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-400 transition-all font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-bold"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
            <Ticket size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-slate-600 font-bold">No coupons created yet</p>
            <p className="text-slate-500 text-sm mt-1">Click "Generate Coupon" to create promotional coupons</p>
          </div>
        ) : (
          coupons.map((c) => {
            const expired = isExpired(c.expiryDate);
            const isActiveValid = c.status === 'ACTIVE' && !expired;
            
            return (
              <div 
                key={c.id} 
                className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-2 ${isActiveValid ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100'}`}
              >
                {/* Header */}
                <div className={`p-6 ${isActiveValid ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-slate-500 to-slate-600'} text-white`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Ticket size={24} />
                      <div>
                        <p className="text-xs font-bold opacity-90 uppercase">Coupon Code</p>
                        <h3 className="text-2xl font-black">{c.code}</h3>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${expired ? 'bg-red-500' : c.status === 'ACTIVE' ? 'bg-white text-green-600' : 'bg-white text-slate-600'}`}>
                      {expired ? 'EXPIRED' : c.status}
                    </span>
                  </div>
                </div>

                {/* Discount Display */}
                <div className="p-6 border-b border-slate-200">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingDown size={20} className="text-amber-600" />
                      <p className="text-4xl font-black text-slate-900">
                        {c.discountType === "PERCENT" ? `${c.value}%` : `₹${c.value}`}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 font-bold">OFF</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <div className="flex gap-3 items-start">
                    <DollarSign size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-600 uppercase">Min Order Amount</p>
                      <p className="text-lg font-black text-slate-900">₹{c.minOrder || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <Calendar size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-600 uppercase">Expires</p>
                      <p className={`font-bold ${expired ? 'text-red-600' : 'text-slate-900'}`}>
                        {new Date(c.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {c.description && (
                    <div className="bg-slate-100 rounded-lg p-3">
                      <p className="text-xs font-bold text-slate-600 uppercase mb-1">Description</p>
                      <p className="text-sm text-slate-900">{c.description}</p>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="p-6 border-t border-slate-200">
                  <button 
                    onClick={() => handleDeleteCoupon(c.id)} 
                    className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all font-bold"
                  >
                    <Trash2 size={18} /> Delete Coupon
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Coupons;