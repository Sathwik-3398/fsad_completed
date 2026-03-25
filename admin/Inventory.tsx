import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../store";
import { Plus, Minus, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import api from "../api";

const Inventory: React.FC = () => {
  const { outlets, products, refreshHubInventory } = useApp();
  const [hubInventory, setHubInventory] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localOutlets, setLocalOutlets] = useState<any[]>([]);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    hubId: "",
    productId: "",
    quantity: 0,
    action: "add" as "add" | "increase" | "decrease"
  });

  const productsForHub = useMemo(() => {
    const pool = (localProducts.length > 0 ? localProducts : products) || [];
    if (!form.hubId) return pool.map((p: any) => ({ id: p.id, inventoryId: null, name: p.name, stock: 0, exists: false }));
    const invs = hubInventory.filter(inv => String(inv.hubId) === String(form.hubId));
    // Return full product list but annotate with inventory data if present so
    // users can add initial stock for products that don't yet exist in the hub.
    return pool.map((p: any) => {
      const inv = invs.find(i => i.productId === p.id);
      return {
        id: p.id,
        inventoryId: inv ? inv.id : null,
        name: p.name,
        stock: inv ? inv.stock : 0,
        exists: !!inv
      };
    });
  }, [form.hubId, hubInventory, localProducts, products]);

  useEffect(() => {
    loadInventory();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [hubsRes, productsRes] = await Promise.all([api.getHubs(), api.getProducts()]);
      setLocalOutlets(Array.isArray(hubsRes) ? hubsRes : []);
      setLocalProducts(Array.isArray(productsRes) ? productsRes : []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const data = await api.getHubInventory("");
      setHubInventory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hubId || !form.productId || form.quantity <= 0) {
      alert("❌ Please fill all required fields with valid values");
      return;
    }
    try {
      setIsLoading(true);
      console.log("🔁 Inventory submit payload:", form);
      const payload = { hubId: form.hubId, productId: form.productId, quantity: Number(form.quantity) };
      let result: any = null;
      if (form.action === "add") result = await api.addStock(payload);
      if (form.action === "increase") result = await api.increaseStock(payload);
      if (form.action === "decrease") result = await api.decreaseStock(payload);
      console.log("🔁 Inventory API result:", result);
      if (result) {
        alert(`✅ Stock updated: ${result.message || "Operation successful"}`);
        await loadInventory();
        try {
          if (refreshHubInventory) await refreshHubInventory();
        } catch (err) {
          console.warn('Failed to refresh global inventory:', err);
        }
        resetForm();
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message || "Operation failed"}`);
      console.error("Stock update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInventory = async (inventoryId: string, productName: string, hubName: string) => {
    if (!window.confirm(`🗑️ Delete inventory for ${productName} at ${hubName}? This cannot be undone.`)) return;
    try {
      setIsLoading(true);
      const result = await api.deleteInventory(inventoryId);
      alert(`✅ ${result.message || "Inventory deleted successfully"}`);
      await loadInventory();
      try {
        if (refreshHubInventory) await refreshHubInventory();
      } catch (err) {
        console.warn('Failed to refresh global inventory:', err);
      }
    } catch (error: any) {
      alert(`❌ Failed to delete: ${error.message || "Unknown error"}`);
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (inv: any, action: "increase" | "decrease") => {
    const quantity = action === "increase" ? 10 : 5;
    if (action === "decrease" && inv.stock < quantity) {
      alert(`❌ Cannot decrease by ${quantity}. Current stock: ${inv.stock}`);
      return;
    }
    try {
      setIsLoading(true);
      const requestData = { hubId: inv.hubId, productId: inv.productId, quantity };
      let result: any = null;
      if (action === "increase") result = await api.increaseStock(requestData);
      else result = await api.decreaseStock(requestData);
      if (result) {
        const newStock = action === "increase" ? inv.stock + quantity : inv.stock - quantity;
        alert(`✅ Stock ${action === "increase" ? "increased" : "decreased"} by ${quantity}. New stock: ${newStock}`);
        await loadInventory();
        try {
          if (refreshHubInventory) await refreshHubInventory();
        } catch (err) {
          console.warn('Failed to refresh global inventory:', err);
        }
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message || "Operation failed"}`);
      console.error(`Quick ${action} error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ hubId: "", productId: "", quantity: 0, action: "add" });
    setShowAddForm(false);
    setEditingId(null);
  };

  const getProductName = (id: string) => (localProducts.length > 0 ? localProducts : products).find((p: any) => p.id === id)?.name || id;
  const getHubName = (id: string) => (localOutlets.length > 0 ? localOutlets : outlets).find((h: any) => h.id === id)?.name || id;

  const getStatusColor = (stock: number) => {
    if (stock === 0) return "bg-red-100 text-red-700";
    if (stock < 10) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusLabel = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 10) return "Low Stock";
    return "In Stock";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Inventory Management</h2>
          <p className="text-slate-600 text-sm mt-1">Manage stock levels across hubs</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadInventory}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-400 text-white px-6 py-3 rounded-lg hover:bg-slate-500 transition-all font-bold disabled:opacity-50"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              resetForm();
              setShowAddForm(true);
            }}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50"
          >
            <Plus size={20} /> Add/Update Stock
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 flex items-center gap-3">
          <RefreshCw size={20} className="text-blue-600 animate-spin" />
          <span className="text-blue-700 font-semibold">Loading inventory...</span>
        </div>
      )}

      {showAddForm && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-slate-900 mb-6">📦 Manage Stock</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hub *</label>
                <select
                  value={form.hubId}
                  onChange={(e) => setForm({ ...form, hubId: e.target.value })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                  required
                >
                  <option value="">Select Hub</option>
                  {(localOutlets.length > 0 ? localOutlets : outlets).map((h: any) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product *</label>
                <select
                  value={form.productId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setForm({ ...form, productId: pid });
                    const inv = hubInventory.find(i => String(i.hubId) === String(form.hubId) && i.productId === pid);
                    setEditingId(inv ? inv.id : null);
                  }}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                  required
                >
                  <option value="">Select Product</option>
                  {productsForHub.length > 0 ? (
                    productsForHub.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} — stock: {p.stock}</option>
                    ))
                  ) : (
                    (localProducts.length > 0 ? localProducts : products).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Action *</label>
                <select
                  value={form.action}
                  onChange={(e) => setForm({ ...form, action: e.target.value as any })}
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                  required
                >
                  <option value="add">➕ Add Initial Stock</option>
                  <option value="increase">⬆️ Increase Stock</option>
                  <option value="decrease">⬇️ Decrease Stock</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Actions:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• <strong>Add Initial Stock:</strong> Creates new inventory record or adds to existing</li>
                  <li>• <strong>Increase Stock:</strong> Adds quantity to current stock level</li>
                  <li>• <strong>Decrease Stock:</strong> Reduces stock (with validation against current level)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                ✅ Update Stock
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

      <div className="grid gap-4">
        {hubInventory.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <AlertCircle size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-gray-500 text-lg">No inventory records. Add stock to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    const prodName = getProductName(form.productId);
                    const hubName = getHubName(form.hubId);
                    handleDeleteInventory(editingId, prodName, hubName);
                  }}
                  className="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all"
                >
                  Delete
                </button>
              )}
            </div>

            {hubInventory.map((inv) => (
              <div key={inv.id} className="bg-white border rounded-lg p-4 grid md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-2">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{getHubName(inv.hubId)}</h4>
                  <p className="text-sm text-slate-600 mb-2">📦 {getProductName(inv.productId)}</p>
                  <div className="text-xs text-slate-500"><span>ID: {inv.id || 'N/A'}</span></div>
                </div>

                <div className="flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-600 uppercase mb-1">Current Stock</p>
                  <h3 className="text-3xl font-black text-slate-900">{inv.stock}</h3>
                </div>

                <div className="flex flex-col items-center">
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(inv.stock)}`}>
                    {getStatusLabel(inv.stock)}
                  </span>
                  {inv.lastRestocked && (
                    <p className="text-xs text-slate-600 mt-2">📅 {new Date(inv.lastRestocked).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => handleQuickAction(inv, 'increase')}
                    disabled={isLoading}
                    className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                    title="Quick add 10 units"
                  >
                    <Plus size={16} /> +10
                  </button>
                  <button
                    onClick={() => handleQuickAction(inv, 'decrease')}
                    disabled={isLoading || inv.stock < 5}
                    className="p-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                    title="Quick remove 5 units"
                  >
                    <Minus size={16} /> -5
                  </button>
                  <button
                    onClick={() => handleDeleteInventory(inv.id, getProductName(inv.productId), getHubName(inv.hubId))}
                    disabled={isLoading}
                    className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                    title="Delete inventory record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;