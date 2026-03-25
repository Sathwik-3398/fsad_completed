import React, { useState } from "react";
import { useApp } from "../store";

const Inventory = () => {
  const { hubInventory, outlets, products, updateHubStock } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    hubId: "",
    productId: "",
    quantity: 0
  });

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hubId || !form.productId) {
      alert("Please select hub and product");
      return;
    }
    updateHubStock(form.hubId, form.productId, Number(form.quantity));
    setForm({ hubId: "", productId: "", quantity: 0 });
    setShowForm(false);
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || id;
  const getHubName = (id: string) => outlets.find(h => h.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Stock
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddStock} className="bg-white p-6 rounded shadow space-y-4">
          <select value={form.hubId} onChange={(e) => setForm({ ...form, hubId: e.target.value })} className="w-full border p-2 rounded" required>
            <option value="">Select Hub</option>
            {outlets.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="w-full border p-2 rounded" required>
            <option value="">Select Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full border p-2 rounded" required />
          <div className="flex gap-4">
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {hubInventory.length === 0 ? (
          <div className="text-gray-500">No inventory</div>
        ) : (
          hubInventory.map((inv) => (
            <div key={`${inv.hubId}-${inv.productId}`} className="bg-white p-4 rounded shadow">
              <p className="font-bold">{getHubName(inv.hubId)}</p>
              <p className="text-sm">{getProductName(inv.productId)}</p>
              <p className="text-sm text-gray-500">Stock: {inv.stock}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inventory;
