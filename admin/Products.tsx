import React, { useState, useEffect } from "react";
import { Plus, Package, Tag, Layers, DollarSign, Check, Trash2, Image as ImageIcon, X } from "lucide-react";
import { useApp } from "../store";
import api from "../api";

const Products = () => {
  const { addProduct } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<Array<{id: string, base64: string, name: string}>>([]);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    originalPrice: 0,
    category: "",
    quantity: "",
    description: "",
    isSubscriptionAvailable: false
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      alert("Please fill required fields");
      return;
    }
    addProduct({
      name: form.name,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
      category: form.category as any,
      quantity: form.quantity,
      description: form.description,
      isSubscriptionAvailable: form.isSubscriptionAvailable,
      images: images.map(img => img.base64),
      status: 'ACTIVE'
    });
    setForm({ name: "", price: 0, originalPrice: 0, category: "", quantity: "", description: "", isSubscriptionAvailable: false });
    setImages([]);
    setShowForm(false);
    setTimeout(loadProducts, 500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setImages(prev => [...prev, {
            id: Date.now().toString() + Math.random(),
            base64,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select image files only');
      }
    });
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await api.deleteProduct(id);
        alert("✅ Product deleted successfully");
        await loadProducts();
      } catch (error) {
        alert("❌ Failed to delete product");
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'MILK':
        return 'bg-blue-100 text-blue-700';
      case 'CURD':
        return 'bg-purple-100 text-purple-700';
      case 'GHEE':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getDiscount = (original: number, current: number) => {
    if (original && original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Products</h2>
          <p className="text-slate-600 text-sm mt-1">Manage dairy products and pricing</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-bold"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleAddProduct} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-6 my-8">
            <h3 className="text-2xl font-black text-slate-900">Add New Product</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Buffalo Milk" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                <select 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors"
                >
                  <option value="">Select Category</option>
                  <option value="Milk">Milk</option>
                  <option value="Curd">Curd</option>
                  <option value="Ghee">Ghee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Current Price (₹) *</label>
                <input 
                  type="number" 
                  placeholder="e.g., 25" 
                  value={form.price} 
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Original Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 30" 
                  value={form.originalPrice} 
                  onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quantity *</label>
                <input 
                  type="text" 
                  placeholder="e.g., 1L, 500ml" 
                  value={form.quantity} 
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                  className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                  required 
                />
              </div>

              <div className="col-span-1 md:col-span-1">
                <label className="block text-sm font-bold text-slate-700 mb-3">Subscription Available</label>
                <div className="flex items-center gap-2 border-2 border-slate-300 rounded-lg p-3">
                  <input 
                    type="checkbox" 
                    checked={form.isSubscriptionAvailable} 
                    onChange={(e) => setForm({ ...form, isSubscriptionAvailable: e.target.checked })} 
                    className="w-5 h-5 cursor-pointer" 
                  />
                  <span className="font-semibold text-slate-900">Yes, enable subscriptions</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea 
                placeholder="e.g., Fresh, organic buffalo milk delivered daily" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="w-full border-2 border-slate-300 p-3 rounded-lg font-semibold hover:border-slate-400 transition-colors" 
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Product Images</label>
              <div className="space-y-3">
                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <ImageIcon size={20} className="text-slate-600" />
                  <span className="font-semibold text-slate-700">Click to upload images or drag & drop</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden"
                  />
                </label>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase mb-2">{images.length} image{images.length !== 1 ? 's' : ''} selected</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img 
                            src={img.base64} 
                            alt={img.name}
                            className="w-full h-24 object-cover rounded-lg border-2 border-slate-200 group-hover:border-red-300 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            title="Remove image"
                          >
                            <X size={16} />
                          </button>
                          <p className="text-xs text-slate-600 truncate mt-1 px-1">{img.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setImages([]);
                  setForm({ name: "", price: 0, originalPrice: 0, category: "", quantity: "", description: "", isSubscriptionAvailable: false });
                }}
                className="flex-1 bg-slate-300 text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-400 transition-all font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-bold"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid gap-4">
        {products.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
            <Package size={48} className="mx-auto mb-3 opacity-40" />
            <p className="text-slate-600 font-bold">No products created yet</p>
            <p className="text-slate-500 text-sm mt-1">Click "Add Product" to create new dairy products</p>
          </div>
        ) : (
          products.map((p) => {
            const discount = getDiscount(p.originalPrice || p.price, p.price);
            
            return (
              <div key={p.id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-slate-200 group overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Product Images */}
                  {p.images && p.images.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-2 gap-1">
                        {p.images.slice(0, 4).map((img: string, idx: number) => (
                          <img 
                            key={idx}
                            src={img} 
                            alt={`${p.name} ${idx + 1}`}
                            className="w-full h-16 object-cover rounded-lg border border-slate-200"
                          />
                        ))}
                      </div>
                      {p.images.length > 4 && (
                        <p className="text-xs text-slate-600 mt-1 font-semibold">+{p.images.length - 4} more</p>
                      )}
                    </div>
                  )}

                  {/* Product Info */}
                  <div className={`${p.images && p.images.length > 0 ? 'md:col-span-4' : 'md:col-span-5'}`}>
                    <div className="flex gap-3 items-start">
                      <Package size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{p.description}</p>
                        
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(p.category)}`}>
                            {p.category || 'N/A'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            {p.quantity || 'N/A'}
                          </span>
                          {p.isSubscriptionAvailable && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                              <Check size={12} /> Subscription
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="md:col-span-4">
                    <div className="flex items-start gap-3">
                      <DollarSign size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase">Current Price</p>
                        <h4 className="text-2xl font-black text-green-600">₹{p.price}</h4>
                        {p.originalPrice && p.originalPrice !== p.price && (
                          <div className="flex gap-2 items-center mt-1">
                            <del className="text-slate-500 text-sm">₹{p.originalPrice}</del>
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                              {discount}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Delete */}
                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between h-full">
                      <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-bold text-sm">
                        {p.status || 'ACTIVE'}
                      </span>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Products;