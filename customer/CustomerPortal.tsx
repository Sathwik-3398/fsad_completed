
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store';
import { Category, Product, Subscription, Order, PaymentMode, SavedAddress } from '../types';
import api from '../api';
import styles from './CustomerPortal.module.css';
import logoImage from './logo.jpg?url';
import {
  Search, MapPin, Calendar, ChevronRight, User as UserIcon,
  Plus, Minus, X, ShoppingBag, Home, Wallet, Package,
  ChevronDown, Truck, Star, ChevronLeft, ShoppingCart,
  ShieldAlert, Zap, Banknote, CreditCard, Moon, LogOut,
  Smartphone, Globe, Info, Receipt, CheckCircle2, ArrowRight,
  FileText, History, Settings, HelpCircle, LayoutGrid, Clock, Loader2,
  Edit2, Trash2, Home as HomeIcon, Briefcase, Tag, Check
} from 'lucide-react';
import { OrderTracking } from './OrderTracking';

export const CustomerPortal: React.FC = () => {
  const {
    products, cart, addToCart, removeFromCart, user, orders, placeOrder, addSubscription,
    subscriptions, selectedOutlet, setSelectedOutlet, outlets, rechargeWallet,
    hubInventory, isAppOpen, logout, addSavedAddress, removeSavedAddress, coupons, refreshOrders
  } = useApp();

  // Navigation State
  const [view, setView] = useState<'HOME' | 'CART' | 'PRODUCT_DETAIL' | 'SUB_SETUP' | 'TRACKING' | 'ACCOUNT' | 'INVOICE_DETAIL' | 'SUBSCRIPTIONS'>('HOME');
  const [accountTab, setAccountTab] = useState<'OVERVIEW' | 'ORDERS' | 'WALLET' | 'SUBS' | 'INVOICES' | 'INFO' | 'PAYMENTS' | 'ADDRESSES'>('OVERVIEW');
  const [complaintText, setComplaintText] = useState('');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [subTenure, setSubTenure] = useState(30);
  const [subMessage, setSubMessage] = useState('');
  const [isSubProcessing, setIsSubProcessing] = useState(false);







  // Interaction State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<Order | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  // Checkout & Address State
  const [selectedPayment, setSelectedPayment] = useState<PaymentMode>('WALLET');
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const [addrForm, setAddrForm] = useState({
    hNo: '', plotNo: '', colony: '', street: '', pincode: '', city: ''
  });
  const [isAddrSet, setIsAddrSet] = useState(false);
  const [selectedAddressLabel, setSelectedAddressLabel] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');

  // Wallet Recharge Flow
  const [rechargeStep, setRechargeStep] = useState<'SELECT' | 'PAYMENT' | 'PROCESSING'>('SELECT');
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);

  // Sub Setup State
  const [subQty, setSubQty] = useState(1);
  const [subFrequency, setSubFrequency] = useState<'DAILY' | 'ALTERNATE' | 'WEEKLY'>('DAILY');
  const [subSlot, setSubSlot] = useState('6:00 AM - 8:00 AM');
  const [subStartDate, setSubStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Track delivered orders for celebration message
  const [justDeliveredOrders, setJustDeliveredOrders] = useState<Set<string>>(new Set());
  const [deliveredOrdersHiding, setDeliveredOrdersHiding] = useState<Set<string>>(new Set());

  // Auto-refresh orders every 15 seconds to sync status changes from delivery partners
  useEffect(() => {
    if (!user?.id || !refreshOrders) return;
    
    // Refresh on component mount
    refreshOrders();
    
    // Then refresh every 15 seconds
    const interval = setInterval(() => {
      refreshOrders();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [user?.id, refreshOrders]);
  const getStock = (pid: string) => {
    if (!selectedOutlet) return 0;
    return hubInventory.find(i => i.hubId === selectedOutlet.id && i.productId === pid)?.stock || 0;
  };

  const billSubtotal = cart.reduce((s, i) => s + (i.product.price * i.quantity), 0);
  const taxes = Math.round(billSubtotal * 0.05);
  const deliveryFee = 15;
  
  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    const coupon = coupons.find(c => c.code === appliedCoupon);
    if (!coupon || coupon.status !== 'ACTIVE' || billSubtotal < coupon.minOrder) return 0;
    const expiryDate = new Date(coupon.expiryDate);
    if (new Date() > expiryDate) return 0;
    return coupon.discountType === 'PERCENT' 
      ? Math.round((billSubtotal * coupon.value) / 100)
      : coupon.value;
  };
  
  const discount = getDiscount();
  const billTotal = cart.length > 0 ? Math.max(0, billSubtotal + taxes + deliveryFee - discount) : 0;

  const userOrders = useMemo(() => orders.filter(o => o.userId === user?.id), [orders, user?.id]);
  const activeDeliveries = useMemo(() => userOrders.filter(o => o.status !== 'delivered' && o.status !== 'CANCELLED'), [userOrders]);
  const userInvoices = useMemo(() => userOrders.filter(o => o.wantsInvoice), [userOrders]);

  // Detect when orders become delivered and show celebration
  useEffect(() => {
    userOrders.forEach(order => {
      if (order.status === 'delivered' && !justDeliveredOrders.has(order.id!)) {
        // Order just became delivered
        setJustDeliveredOrders(prev => new Set([...prev, order.id!]));
        
        // After 3 seconds, start hiding it (fade out animation)
        const hideTimeout = setTimeout(() => {
          setDeliveredOrdersHiding(prev => new Set([...prev, order.id!]));
        }, 3000);
        
        return () => clearTimeout(hideTimeout);
      }
    });
  }, [userOrders, justDeliveredOrders]);

  const suggestedProducts = useMemo(() => {
    return products
      .filter(p =>
        (activeCategory === 'All' || p.category === activeCategory) &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !cart.find(c => c.product.id === p.id)
      )
      .slice(0, 6);
  }, [products, cart, activeCategory, searchQuery]);

  if (!user) return null;

  const currentDeliveryAddress = `${addrForm.hNo}, ${addrForm.plotNo}, ${addrForm.colony}, ${addrForm.street}, ${addrForm.city} - ${addrForm.pincode}`;

  const handlePlaceOrder = async () => {
    if (!isAddrSet) {
      alert("❌ Please set your delivery address first.");
      return;
    }
    if (selectedPayment === 'WALLET' && user.walletBalance < billTotal) {
      alert("❌ Insufficient wallet balance. Please recharge.");
      return;
    }

    setIsProcessingOrder(true);
    try {
      console.log('🚀 Placing order...');
      const order = await placeOrder(currentDeliveryAddress, selectedPayment, billTotal, wantsInvoice);
      
      if (!order) {
        alert('❌ Failed to place order. Please check your internet connection and try again.');
        return;
      }
      
      if (!order.id) {
        alert('❌ Invalid response from server. Please try again.');
        return;
      }
      
      console.log('✅ Order placed successfully. ID:', order.id);
      
      if (!order.assignedDeliveryPartner) {
        alert('⚠️ Order placed successfully but no delivery partner available yet.\n\nYour order will be assigned manually. Go to Live Tracking to monitor it.');
      } else {
        alert(`✅ Order placed! Your delivery partner is on the way.`);
      }
      
      setActiveTrackingId(order.id);
      setView('TRACKING');
    } catch (error) {
      console.error('❌ Order error:', error);
      alert('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error occurred'));
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleRechargeWallet = (amount: number) => {
    setRechargeAmount(amount);
    setRechargeStep('PAYMENT');
  };

  const handleSaveAddress = () => {
    if (!addressLabel.trim()) {
      alert("❌ Please enter an address label (e.g., Home, Work)");
      return;
    }
    if (Object.values(addrForm).every(v => typeof v === 'string' && v.trim() !== '')) {
      addSavedAddress({
        label: addressLabel,
        hNo: addrForm.hNo,
        plotNo: addrForm.plotNo,
        colony: addrForm.colony,
        street: addrForm.street,
        pincode: addrForm.pincode,
        city: addrForm.city
      });
      alert("✅ Address saved successfully!");
      setShowAddressForm(false);
      setAddressLabel('');
      setIsAddrSet(true);
    } else {
      alert("❌ Please fill all address fields.");
    }
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setAddrForm({
      hNo: addr.hNo,
      plotNo: addr.plotNo,
      colony: addr.colony,
      street: addr.street,
      pincode: addr.pincode,
      city: addr.city
    });
    setSelectedAddressLabel(addr.label);
    setIsAddrSet(true);
  };

  const processRechargePayment = () => {
    setRechargeStep('PROCESSING');
    setTimeout(() => {
      rechargeWallet(rechargeAmount);
      setRechargeStep('SELECT');
      setRechargeAmount(0);
      alert('Wallet Recharged Successfully!');
    }, 2000);
  };

  const handleActivateSubscription = () => {
    if (!selectedProduct) return;
    const firstDayCost = selectedProduct.price * subQty;

    if (selectedPayment === 'WALLET' && user.walletBalance < firstDayCost) {
      alert(`Insufficient balance for first day payment (₹${firstDayCost}). Please recharge.`);
      return;
    }

    const subData = {
      productId: selectedProduct.id,
      quantityPerDay: subQty,
      frequency: subFrequency,
      timeSlot: subSlot,
      startDate: subStartDate,
      hubId: selectedOutlet.id,
      deliveryAddress: currentDeliveryAddress
    };

    const success = addSubscription(subData, firstDayCost);
    if (success) {
      alert('Subscription Plan Activated Successfully!');
      setView('SUBSCRIPTIONS');
    }
  };

  if (!isAppOpen) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex flex-col items-center justify-center p-8 text-center">
        <Moon size={64} className="text-[#E8A76F] mb-8 animate-pulse" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 text-[#3E5C76]">Under Maintenance</h1>
        <p className="text-[#3E5C76] text-sm max-w-xs mx-auto mb-10 font-bold">Updating stock for the morning shift. See you at 5:00 AM.</p>
        <button onClick={() => { setView('ACCOUNT'); setAccountTab('ORDERS'); }} className="bg-[#3E5C76] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">Past Orders</button>
      </div>
    );
  }

  if (!selectedOutlet) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-[#7BA04E]/20 rounded-[2rem] flex items-center justify-center text-[#7BA04E] mb-8 animate-bounce">
          <MapPin size={40} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 text-[#3E5C76]">Service Location</h1>
        <p className="text-[#3E5C76] text-sm mb-10 max-w-xs uppercase font-bold tracking-widest">Select your nearest Sri Geetha Hub</p>
        <div className="w-full max-w-md space-y-3">
          {outlets.map(o => (
            <button key={o.id} onClick={() => setSelectedOutlet(o)} className="w-full bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-[#3E5C76] hover:bg-[#FBF0DF] flex justify-between items-center group transition-all shadow-sm">
              <div className="text-left">
                <p className="font-black text-sm uppercase tracking-tight text-[#3E5C76]">{o.name}</p>
                <p className="text-[9px] text-[#3E5C76] font-bold uppercase tracking-widest mt-1 opacity-70">{o.address}</p>
              </div>
              <ChevronRight className="text-[#3E5C76] transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8A76F]/20 px-6 pt-4 pb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Sri Geetha Dairy" className="h-12 w-auto" />
            <div onClick={() => setSelectedOutlet(null)} className="flex items-center gap-2 cursor-pointer group">
              <div className="bg-[#7BA04E]/20 p-2 rounded-xl text-[#7BA04E] group-hover:bg-[#3E5C76] group-hover:text-white transition-colors">
                <MapPin size={14} />
              </div>
              <div>
                <p className="text-[7px] font-black text-[#3E5C76] uppercase tracking-widest opacity-50">Delivering To</p>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#3E5C76]">{selectedOutlet.name} <ChevronDown size={12} /></div>
              </div>
            </div>
          </div>
          <div onClick={() => { setView('ACCOUNT'); setAccountTab('WALLET'); }} className="bg-[#3E5C76] text-white px-4 py-2 rounded-2xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#3E5C76]/20 text-white">
            <Wallet size={12} className="text-[#7BA04E]" />
            <span className="text-[11px] font-black tracking-tighter text-white">₹{user.walletBalance}</span>
          </div>
        </div>

        {(view === 'HOME' || view === 'SUBSCRIPTIONS') && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3E5C76] opacity-30" size={14} />
            <input
              type="text"
              placeholder='Search Milk, Curd, Ghee...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FBF0DF] rounded-2xl py-3 pl-10 pr-4 text-[10px] font-black outline-none border-2 border-transparent focus:border-[#3E5C76] focus:bg-white transition-all text-[#3E5C76]"
            />
          </div>
        )}
      </header>

      <main className="p-4">
      {view === 'PRODUCT_DETAIL' && selectedProduct && (
  <div className="p-6 space-y-6 animate-fade-in text-gray-800">

    {/* Back */}
    <button
      onClick={() => setView('HOME')}
      className="text-sm text-gray-500"
    >
      ← Back
    </button>

    {/* Product Image */}
    <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
      <img
        src={selectedProduct.images[0]}
        className="h-48 mx-auto object-contain"
      />
    </div>

    {/* Product Info */}
    <div>
      <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
      <p className="text-sm text-gray-500 mt-2">
        Fresh dairy product delivered daily.
      </p>
      <p className="text-lg font-semibold mt-2">
        ₹{selectedProduct.price}
      </p>
    </div>

    {/* BUY NOW */}
    <button
      onClick={() => {
        addToCart(selectedProduct);
        setView('CART');
      }}
      className="w-full bg-gray-800 text-white py-3 rounded-2xl"
    >
      Buy Now
    </button>

    {/* SUBSCRIBE BUTTON */}
    <button
      onClick={() => setView('SUB_SETUP')}
      className="w-full bg-green-600 text-white py-3 rounded-2xl"
    >
      Subscribe
    </button>

  </div>
)}
{view === 'SUB_SETUP' && selectedProduct && (
  <div className="p-6 space-y-6 text-gray-800">

    <button
      onClick={() => setView('PRODUCT_DETAIL')}
      className="text-sm text-gray-500"
    >
      ← Back
    </button>

    <h2 className="text-lg font-bold">
      Subscribe to {selectedProduct.name}
    </h2>

    {/* Frequency */}
    <div>
      <label className="text-sm">Frequency</label>
      <select
        value={subFrequency}
        onChange={(e) => setSubFrequency(e.target.value as any)}
        className="w-full border rounded-lg p-2 mt-1"
      >
        <option value="DAILY">Daily</option>
        <option value="ALTERNATE">Alternate Days</option>
        <option value="WEEKLY">Weekly</option>
      </select>
    </div>

    {/* Time Slot */}
    <div>
      <label className="text-sm">Delivery Time</label>
      <select
        value={subSlot}
        onChange={(e) => setSubSlot(e.target.value)}
        className="w-full border rounded-lg p-2 mt-1"
      >
        <option>6:00 AM - 8:00 AM</option>
        <option>8:00 AM - 10:00 AM</option>
      </select>
    </div>

    {/* Tenure */}
    <div>
      <label className="text-sm">Tenure (Days)</label>
      <input
        type="number"
        value={subTenure}
        onChange={(e) => setSubTenure(Number(e.target.value))}
        className="w-full border rounded-lg p-2 mt-1"
      />
    </div>

    {/* Special Message */}
    <div>
      <label className="text-sm">Special Instructions</label>
      <textarea
        value={subMessage}
        onChange={(e) => setSubMessage(e.target.value)}
        className="w-full border rounded-lg p-2 mt-1"
        placeholder="Leave at gate / Call before delivery..."
      />
    </div>

    {/* Payment Mode */}
    <div>
      <label className="text-sm">Payment Mode</label>
      <select
        value={selectedPayment}
        onChange={(e) => setSelectedPayment(e.target.value as any)}
        className="w-full border rounded-lg p-2 mt-1"
      >
        <option value="WALLET">Wallet</option>
        <option value="UPI">UPI</option>
        <option value="COD">Cash on Delivery</option>
      </select>
    </div>

    {/* Confirm Subscription */}
    <button
      disabled={isSubProcessing}
      onClick={() => {
  const totalCost = selectedProduct.price * subTenure;

  if (selectedPayment === 'WALLET' && user.walletBalance < totalCost) {
    alert("Insufficient wallet balance.");
    return;
  }

  if (!selectedOutlet?.id) {
    alert("Please select a hub/outlet first.");
    return;
  }

  setIsSubProcessing(true);

  setTimeout(() => {
    // Calculate end date based on tenure (tenure is in days)
    const startDate = new Date(subStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + subTenure);

    const newSubscription = {
      id: `SUB-${Date.now()}`,
      userId: user.id,
      productId: selectedProduct.id,
      product: selectedProduct,  // ✓ Keep product object for UI rendering
      hubId: selectedOutlet.id,
      frequency: subFrequency,
      timeSlot: subSlot,
      quantityPerDay: subQty,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      deliveryAddress: currentDeliveryAddress || 'Not set',
      status: "ACTIVE",
      message: subMessage,
      tenure: subTenure
    };

    console.log('📝 Creating subscription:', newSubscription);
    const success = addSubscription(newSubscription, totalCost);

    setIsSubProcessing(false);

    if (success) {
      alert('✅ Subscription activated successfully!');
      // Reset form
      setSubQty(1);
      setSubFrequency('DAILY');
      setSubSlot('6:00 AM - 8:00 AM');
      setSubTenure(30);
      setSubMessage('');
      setSelectedProduct(null);
      setView('ACCOUNT');
      setAccountTab('SUBS');
    } else {
      alert('❌ Failed to activate subscription. Please try again.');
    }
  }, 1000);
}}

      className="w-full bg-green-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {isSubProcessing ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Processing Payment...
        </>
      ) : (
        "Activate Subscription"
      )}
    </button>

  </div>
)}

        {view === 'HOME' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', ...Object.values(Category)].map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c as any)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase border transition-all ${activeCategory === c ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-black border-slate-100'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {products
                .filter(p => (activeCategory === 'All' || p.category === activeCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(p => {
                  const stock = getStock(p.id);
                  const isSoldOut = stock === 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => { if (!isSoldOut) { setSelectedProduct(p); setView('PRODUCT_DETAIL'); } }}
                      className={`bg-[#FDF5E6] p-3 rounded-[2.2rem] border shadow-sm group cursor-pointer transition-all relative ${isSoldOut ? 'opacity-50 brightness-75' : 'hover:shadow-xl'}`}
                    >
                      {/* Product Image */}
                      <div className="h-32 bg-[#FBF0DF] rounded-[1.8rem] flex items-center justify-center p-4 relative overflow-hidden">
                        <img src={p.images[0] || 'https://via.placeholder.com/150'} className={`w-full h-full object-contain ${!isSoldOut && 'group-hover:scale-110'} transition-all duration-500`} />
                        
                        {/* Sold Out Overlay */}
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-[#3E5C76]/50 flex items-center justify-center rounded-[1.8rem] backdrop-blur-sm">
                            <div className="text-center">
                              <p className="text-white font-black text-lg uppercase tracking-wider">Out of Stock</p>
                              <p className="text-white/80 text-[9px] uppercase tracking-widest mt-1">Check back soon</p>
                            </div>
                          </div>
                        )}
                        
                        {!isSoldOut && (
                          <button
                            onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                            className="absolute bottom-2 right-2 bg-black text-white p-2.5 rounded-xl shadow-lg active:scale-90 transition-transform hover:bg-green-600"
                          >
                            <Plus size={16} className="text-white" />
                          </button>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="mt-3 px-1.5 pb-1 text-[#3E5C76]">
                        <p className="font-black uppercase text-[10px] leading-tight line-clamp-1 tracking-tight text-[#3E5C76]">{p.name}</p>
                        <div className="flex justify-between items-center mt-1.5 text-[#3E5C76]">
                          <p className="text-xs font-black text-[#3E5C76]">₹{p.price}</p>
                          <p className="text-[8px] font-black text-[#3E5C76] opacity-40 uppercase tracking-widest">{p.quantity}</p>
                        </div>
                        
                        {/* Stock Status Badge */}
                        {isSoldOut && (
                          <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-center">
                            <p className="text-[8px] font-black text-red-600 uppercase tracking-widest">Sold Out</p>
                          </div>
                        )}
                        {!isSoldOut && stock < 5 && (
                          <div className="mt-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-center">
                            <p className="text-[8px] font-black text-yellow-600 uppercase tracking-widest">Low Stock ({stock})</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              }
            </div>

            {cart.length > 0 && (
              <div className="fixed bottom-28 left-4 right-4 z-50 animate-slide-up">
                <button
                  onClick={() => setView('CART')}
                  className="w-full bg-[#7BA04E] text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-4 text-white">
                    <div className="bg-white/20 p-2 rounded-xl text-white">
                      <ShoppingCart size={20} className="text-white" />
                    </div>
                    <div className="text-left text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">{cart.length} items added</p>
                      <p className="text-xs font-black text-white">₹{billTotal} total</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">View Basket</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-white" />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'CART' && (
          <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <button onClick={() => setView('HOME')} className="p-3 bg-white rounded-2xl shadow-sm active:scale-90 transition-transform"><ChevronLeft size={20} className="text-[#3E5C76]" /></button>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-[#3E5C76]">Order Checkout</h2>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-24 opacity-20 text-[#3E5C76]">
                <ShoppingBag size={80} className="mx-auto mb-6 text-[#3E5C76]" />
                <p className="text-sm font-black uppercase tracking-widest text-[#3E5C76]">Basket is Empty</p>
                <button onClick={() => setView('HOME')} className="mt-8 bg-[#3E5C76] text-white px-8 py-3 rounded-xl font-bold uppercase text-[10px]">Back to Market</button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Items List */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#E8A76F]/20">
                  <div className="divide-y divide-[#FBF0DF]">
                    {cart.map(i => (
                      <div key={i.product.id} className="py-4 first:pt-0 last:pb-4 flex justify-between items-center text-[#3E5C76]">
                        <div className="flex items-center gap-4 text-[#3E5C76]">
                          <div className="w-14 h-14 bg-[#FBF0DF] rounded-2xl p-2 flex items-center justify-center">
                            <img src={i.product.images[0]} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-tight text-[#3E5C76]">{i.product.name}</p>
                            <p className="text-[9px] font-black text-[#3E5C76] opacity-40 mt-0.5 uppercase tracking-widest">₹{i.product.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 bg-[#FBF0DF] p-1.5 rounded-xl text-[#3E5C76]">
                          <button onClick={() => removeFromCart(i.product.id)} className="p-2 bg-white rounded-lg shadow-sm active:scale-90"><Minus size={12} className="text-[#3E5C76]" /></button>
                          <span className="text-[11px] font-black min-w-[20px] text-center text-[#3E5C76]">{i.quantity}</span>
                          <button onClick={() => addToCart(i.product)} className="p-2 bg-white rounded-lg shadow-sm active:scale-90"><Plus size={12} className="text-[#3E5C76]" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setView('HOME')} className="w-full mt-4 py-4 bg-[#7BA04E]/10 rounded-2xl flex items-center justify-center gap-3 border border-dashed border-[#7BA04E]/30 group hover:bg-[#7BA04E]/20 transition-all text-[#7BA04E]">
                    <Plus size={16} className="text-[#7BA04E]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#7BA04E]">Add more products</span>
                  </button>
                </div>

                {/* Recommendations Section */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#3E5C76] opacity-40 ml-4">Recommended Items</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide text-black">
                    {suggestedProducts.map(p => (
                      <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border shadow-sm min-w-[180px] flex flex-col items-center text-center animate-scale-up text-[#3E5C76]">
                        <div className="w-24 h-24 bg-[#FBF0DF] rounded-2xl p-4 mb-4 flex items-center justify-center shadow-inner group overflow-hidden">
                          <img src={p.images[0]} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-tight mb-1 text-[#3E5C76] line-clamp-1">{p.name}</p>
                        <button onClick={() => addToCart(p)} className="w-full py-3 bg-[#3E5C76] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Add ₹{p.price}</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address Form */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-[#3E5C76] opacity-40 ml-4 tracking-widest">Enter Delivery Details</p>
                  
                  {/* Saved Addresses */}
                  {(user.savedAddresses || []).length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-black uppercase text-[#3E5C76] opacity-30 ml-4 tracking-widest">Quick Select</p>
                      <div className="grid grid-cols-1 gap-2 px-2">
                        {user.savedAddresses?.map(addr => (
                          <button
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-4 rounded-xl text-left border-2 transition-all ${
                              selectedAddressLabel === addr.label
                                ? 'bg-[#3E5C76] text-white border-[#3E5C76]'
                                : 'bg-white text-[#3E5C76] border-[#FBF0DF] hover:border-[#3E5C76]'
                            }`}
                          >
                            <p className="text-[10px] font-black uppercase">{addr.label}</p>
                            <p className="text-[8px] opacity-60 mt-1">{addr.hNo}, {addr.street}, {addr.city}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address Entry Form */}
                  {showAddressForm ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Label (e.g., Home, Work)"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        className="w-full p-4 rounded-xl border border-[#E8A76F] text-[#3E5C76] text-[10px] font-black uppercase placeholder:opacity-40 focus:border-[#3E5C76] outline-none"
                      />
                    </div>
                  ) : null}

                  <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <AddressInput label="House No" value={addrForm.hNo} onChange={(v) => setAddrForm({ ...addrForm, hNo: v })} />
                      <AddressInput label="Plot No" value={addrForm.plotNo} onChange={(v) => setAddrForm({ ...addrForm, plotNo: v })} />
                    </div>
                    <AddressInput label="Colony" value={addrForm.colony} onChange={(v) => setAddrForm({ ...addrForm, colony: v })} />
                    <AddressInput label="Street Name" value={addrForm.street} onChange={(v) => setAddrForm({ ...addrForm, street: v })} />
                    <div className="grid grid-cols-2 gap-4">
                      <AddressInput label="Pincode" value={addrForm.pincode} onChange={(v) => setAddrForm({ ...addrForm, pincode: v })} />
                      <AddressInput label="City" value={addrForm.city} onChange={(v) => setAddrForm({ ...addrForm, city: v })} />
                    </div>
                    
                    <div className="flex gap-2">
                      {showAddressForm ? (
                        <>
                          <button
                            onClick={handleSaveAddress}
                            className="flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-[#7BA04E] text-white hover:bg-[#6a8a43] transition-all"
                          >
                            💾 Save Address
                          </button>
                          <button
                            onClick={() => {
                              setShowAddressForm(false);
                              setAddressLabel('');
                            }}
                            className="flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-[#FBF0DF] text-[#3E5C76] hover:bg-[#E8A76F]/20 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              if (Object.values(addrForm).every(v => typeof v === 'string' && v.trim() !== '')) {
                                setIsAddrSet(true);
                              } else {
                                alert("Please fill all address fields.");
                              }
                            }}
                            className={`flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${isAddrSet ? 'bg-[#7BA04E] text-white' : 'bg-[#3E5C76] text-white'}`}
                          >
                            {isAddrSet ? '✓ Address Set' : 'Set Delivery Location'}
                          </button>
                          <button
                            onClick={() => setShowAddressForm(true)}
                            className="flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-[#3E5C76] text-white hover:bg-[#4a6a8d] transition-all"
                          >
                            💾 Save & Use
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coupons & Offers */}
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-black opacity-40 ml-4 tracking-widest flex items-center gap-2">
                    <Tag size={14}/> Available Offers
                  </div>
                  {coupons.length > 0 ? (
                    <div className="space-y-3">
                      {coupons.filter(c => c.status === 'ACTIVE' && billSubtotal >= c.minOrder).map(coupon => (
                        <div
                          key={coupon.id}
                          onClick={() => {
                            if (appliedCoupon === coupon.code) {
                              setAppliedCoupon(null);
                            } else {
                              setAppliedCoupon(coupon.code);
                            }
                          }}
                          className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl cursor-pointer transition-all transform hover:scale-105 ${appliedCoupon === coupon.code ? 'ring-2 ring-white' : ''}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs font-black uppercase">{coupon.code}</p>
                              <p className="text-[10px] opacity-80">{coupon.discountType === 'PERCENT' ? `Save ${coupon.value}%` : `Save ₹${coupon.value}`} • Min ₹{coupon.minOrder}</p>
                            </div>
                            {appliedCoupon === coupon.code && <Check size={20} className="text-white"/>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-black opacity-50">No active offers available</p>
                  )}
                </div>

                {/* Billing Details */}
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4 text-[#3E5C76]">
                  <div className="flex justify-between text-[10px] font-black uppercase text-[#3E5C76] opacity-50"><span>Subtotal</span><span>₹{billSubtotal}</span></div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-[#3E5C76] opacity-50"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
                  <div className="flex justify-between text-[10px] font-black uppercase text-[#3E5C76] opacity-50"><span>Taxes (5%)</span><span>₹{taxes}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[10px] font-black uppercase text-[#7BA04E]"><span>Coupon Discount</span><span>-₹{discount}</span></div>
                  )}
                  <div className="flex justify-between text-[20px] font-black uppercase border-t border-dashed pt-4 text-[#3E5C76]"><span>To Pay</span><span>₹{billTotal}</span></div>
                </div>
                {/* Generate Invoice Option */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Generate Invoice</p>
                    <p className="text-xs text-gray-500">Download GST Invoice for this order</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={wantsInvoice}
                    onChange={() => setWantsInvoice(!wantsInvoice)}
                    className="w-5 h-5 accent-gray-800"
                  />
                </div>


                {/* Payment Selection */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-[#3E5C76] opacity-40 ml-4 tracking-widest">Payment Method</p>
                  <div className="grid grid-cols-1 gap-3">
                    <PaymentBtn active={selectedPayment === 'WALLET'} icon={<Wallet size={18} />} label={`Wallet Credits (₹${user.walletBalance})`} onClick={() => setSelectedPayment('WALLET')} />
                    <PaymentBtn active={selectedPayment === 'UPI'} icon={<Smartphone size={18} />} label="UPI Apps" onClick={() => setSelectedPayment('UPI')} />
                    <PaymentBtn active={selectedPayment === 'COD'} icon={<Banknote size={18} />} label="Cash on Delivery" onClick={() => setSelectedPayment('COD')} />
                  </div>
                </div>

                {/* Final Checkout Button */}
                <div className="sticky bottom-4 left-0 right-0 z-50">
                  <button
                    disabled={isProcessingOrder}
                    onClick={handlePlaceOrder}
                    className="w-full bg-[#3E5C76] text-white py-6 rounded-[2.5rem] font-black uppercase text-xs shadow-3xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50 text-white"
                  >
                    {isProcessingOrder ? <Loader2 className="animate-spin text-white" size={20} /> : <Zap size={18} className="text-yellow-400 fill-yellow-400" />}
                    <span className="text-white">{isProcessingOrder ? 'Confirming...' : `Pay & Order • ₹${billTotal}`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {accountTab === 'SUBS' && (
  <div className="space-y-6 p-6 text-[#3E5C76] animate-fade-in">
    <header className="flex items-center gap-6">
      <button onClick={() => setAccountTab('OVERVIEW')} className="p-3 bg-white rounded-2xl shadow-sm active:scale-90 transition-transform"><ChevronLeft size={20} className="text-[#3E5C76]" /></button>
      <h3 className="text-2xl font-black uppercase tracking-tighter text-[#3E5C76]">
        My Subscriptions
      </h3>
    </header>

    {subscriptions.filter(sub => sub.userId === user.id).length === 0 ? (
      <div className="text-center py-20 opacity-30">
        <Package size={48} className="mx-auto mb-4 text-[#3E5C76]" />
        <p className="text-[10px] font-black uppercase text-[#3E5C76]">No active subscriptions</p>
      </div>
    ) : (
      <div className="space-y-4">
        {subscriptions
          .filter(sub => sub.userId === user.id)
          .map(sub => {
            const productName = sub.product?.name || sub.productName || 'Product';
            const productImage = sub.product?.images?.[0] || 'https://via.placeholder.com/100';
            const startDate = new Date(sub.startDate).toLocaleDateString();
            const endDate = new Date(sub.endDate).toLocaleDateString();
            const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={sub.id}
                className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-[#FBF0DF] rounded-xl overflow-hidden flex-shrink-0">
                    <img src={productImage} alt={productName} className="w-full h-full object-contain p-2" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black uppercase text-[#3E5C76]">{productName}</p>
                    <p className="text-[9px] text-[#3E5C76] opacity-50 font-bold uppercase mt-1">{sub.frequency}</p>
                    <span className={`inline-block text-[9px] font-black px-3 py-1 rounded-lg mt-2 uppercase ${
                      sub.status === 'ACTIVE' 
                        ? 'bg-[#7BA04E]/20 text-[#7BA04E]' 
                        : sub.status === 'PAUSED'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="border-t pt-4 grid grid-cols-2 gap-3 text-[9px]">
                  <div className="bg-[#FBF0DF] p-3 rounded-xl">
                    <p className="font-bold uppercase opacity-50 text-[#3E5C76]">Qty/Day</p>
                    <p className="text-lg font-black text-[#3E5C76] mt-1">{sub.quantityPerDay || sub.quantity || 1}</p>
                  </div>
                  <div className="bg-[#FBF0DF] p-3 rounded-xl">
                    <p className="font-bold uppercase opacity-50 text-[#3E5C76]">Time</p>
                    <p className="text-sm font-black text-[#3E5C76] mt-1">{sub.timeSlot}</p>
                  </div>
                  <div className="bg-[#FBF0DF] p-3 rounded-xl">
                    <p className="font-bold uppercase opacity-50 text-[#3E5C76]">Start</p>
                    <p className="text-sm font-black text-[#3E5C76] mt-1">{startDate}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${daysLeft > 0 ? 'bg-[#7BA04E]/20' : 'bg-red-50'}`}>
                    <p className="font-bold uppercase opacity-50 text-[#3E5C76]">Days Left</p>
                    <p className={`text-lg font-black mt-1 ${daysLeft > 0 ? 'text-[#7BA04E]' : 'text-red-600'}`}>{Math.max(0, daysLeft)}</p>
                  </div>
                </div>

                {/* Special Instructions */}
                {sub.message && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <p className="text-[9px] font-black uppercase text-blue-600">Special Instructions</p>
                    <p className="text-[10px] text-blue-700 mt-1">{sub.message}</p>
                  </div>
                )}

                {/* Delivery Address */}
                <div className="bg-[#FBF0DF] p-3 rounded-xl">
                  <p className="text-[9px] font-black uppercase opacity-50 text-[#3E5C76]">Delivery Address</p>
                  <p className="text-[10px] text-[#3E5C76] mt-1 font-semibold">{sub.deliveryAddress || 'Not set'}</p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => alert("Pause/Cancel coming soon")}
                  className="w-full bg-[#3E5C76] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Manage Subscription
                </button>
              </div>
            );
          })}
      </div>
    )}

  </div>
)}


        {view === 'ACCOUNT' && (
          <div className="animate-fade-in pb-20">
            {accountTab === 'OVERVIEW' ? (
              <div className="space-y-10 p-6 text-[#3E5C76]">

                {/* PROFILE HEADER */}
                <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
                  <div className="w-24 h-24 bg-[#FBF0DF] rounded-full mx-auto flex items-center justify-center mb-4">
                    <UserIcon size={40} className="text-[#7BA04E]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#3E5C76]">{user.name}</h2>
                  <p className="text-sm text-[#3E5C76] opacity-60">{user.phone}</p>
                </div>

                {/* ORDERS & SUBSCRIPTIONS */}
                <Section title="Orders & Subscriptions">
                  <ProfileItem label="Order History" onClick={() => setAccountTab('ORDERS')} />
                  <ProfileItem label="Active Subscriptions" onClick={() => setAccountTab('SUBS')} />
                  <ProfileItem label="Your Invoices" onClick={() => setAccountTab('INVOICES')} />
                  <ProfileItem label="Track Orders" onClick={() => setView('TRACKING')} />
                </Section>

                {/* ADDRESS BOOK */}
                <Section title="Address Book">
                  <ProfileItem label="Saved Addresses" onClick={() => setAccountTab('ADDRESSES')} />
                  <ProfileItem label="Add New Address" onClick={() => setAccountTab('ADDRESSES')} />
                </Section>

                {/* WISHLIST */}
                <Section title="Wishlist">
                  {wishlist.length === 0 ? (
                    <div className="text-sm text-gray-400">No items in wishlist</div>
                  ) : (
                    wishlist.map((item, i) => (
                      <div key={i} className="text-sm">{item.name}</div>
                    ))
                  )}
                </Section>

                {/* PAYMENTS */}
                <Section title="Payment">
                  <ProfileItem label={`Wallet (₹${user.walletBalance})`} onClick={() => setAccountTab('WALLET')} />
                  <ProfileItem label="Saved Cards / UPI" onClick={() => setAccountTab('PAYMENTS')} />
                </Section>

                {/* SERVICE & SUPPORT */}
                <Section title="Service & Support">
                  <ProfileItem label="Our Impact" onClick={() => alert('We support local dairy farmers 🥛')} />

                  {/* Raise Complaint */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm mt-4">
                    <p className="text-sm font-medium mb-2">Raise Complaint</p>
                    <textarea
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                      placeholder="Write your complaint..."
                    />
                    <button
                      onClick={() => {
                        if (!complaintText.trim()) return;
                        const submitComplaint = async () => {
                          try {
                            const complaintData = {
                              userId: user?.id || 'UNKNOWN',
                              orderId: '',
                              hubId: selectedOutlet?.id || '',
                              category: 'PRODUCT_QUALITY',
                              description: complaintText
                            };
                            const result = await api.addComplaint(complaintData);
                            setComplaints([...complaints, { text: complaintText, date: new Date(), id: result.id }]);
                            setComplaintText('');
                            alert('✅ Complaint submitted successfully');
                          } catch (error: any) {
                            console.error('Error submitting complaint:', error);
                            alert('❌ Failed to submit complaint. Please try again.');
                          }
                        };
                        submitComplaint();
                      }}
                      className="mt-2 w-full bg-gray-800 text-white py-2 rounded-lg text-sm"
                    >
                      Submit Complaint
                    </button>
                  </div>

                  {/* Complaint History */}
                  {complaints.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm mt-4">
                      <p className="text-sm font-semibold mb-2">Complaint History</p>
                      {complaints.map((c, i) => (
                        <div key={i} className="text-xs text-gray-600 mb-2">
                          {c.text}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* ACCOUNT SETTINGS */}
                <Section title="Account">
                  <button
                    onClick={() => {
                      logout();
                      setView('HOME');
                    }}
                    className="w-full flex items-center justify-between gap-4 p-4 bg-red-50 hover:bg-red-100 rounded-2xl shadow-sm transition-colors active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={20} className="text-red-600" />
                      <span className="font-semibold text-red-600">Logout</span>
                    </div>
                    <ChevronRight size={18} className="text-red-400" />
                  </button>
                </Section>

              </div>
            ) : (


              <div className="p-6 space-y-8 text-[#3E5C76]">
                <header className="flex items-center gap-6">
                  <button onClick={() => setAccountTab('OVERVIEW')} className="p-3 bg-white rounded-2xl shadow-sm active:scale-90 transition-transform"><ChevronLeft size={20} className="text-[#3E5C76]" /></button>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-[#3E5C76]">
                    {accountTab === 'INFO' ? 'Your Information' :
                      accountTab === 'PAYMENTS' ? 'Payment Options' :
                        accountTab === 'ADDRESSES' ? 'Saved Addresses' : accountTab}
                  </h3>
                </header>

                {accountTab === 'INFO' && (
                  <div className="bg-white p-8 rounded-[3rem] border shadow-sm space-y-6">
                    <InfoRow label="Full Name" value={user.name} />
                    <InfoRow label="Email Address" value={user.email} />
                    <InfoRow label="Phone Number" value={user.phone} />
                    <InfoRow label="Customer ID" value={`#SRI-${user.id.slice(-6)}`} />
                    <button className="w-full py-4 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest mt-4">Edit Profile</button>
                  </div>
                )}

                {accountTab === 'PAYMENTS' && (
                  <div className="space-y-6">
                    <div className="bg-black p-10 rounded-[3.5rem] text-center text-white shadow-2xl">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">Wallet Balance</p>
                      <h3 className="text-6xl font-black tracking-tighter text-white">₹{user.walletBalance}</h3>
                      <button onClick={() => setAccountTab('WALLET')} className="mt-8 bg-white text-black px-8 py-3 rounded-xl font-black uppercase text-[10px]">Add Money</button>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase text-black opacity-40 ml-4">Saved Methods</p>
                      <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl"><Smartphone size={20} /></div>
                          <div><p className="text-[11px] font-black uppercase">Primary UPI</p><p className="text-[9px] font-black opacity-40 uppercase">user@okaxis</p></div>
                        </div>
                        <CheckCircle2 className="text-green-600" />
                      </div>
                      <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] font-black uppercase text-[10px] opacity-40 flex items-center justify-center gap-3">
                        <Plus size={16} /> Add New Payment Mode
                      </button>
                    </div>
                  </div>
                )}

                {accountTab === 'ADDRESSES' && (
                  <div className="space-y-6">
                    <button
                      onClick={() => {
                        const label = prompt("Address Label (Home/Work)?");
                        if (label) {
                          addSavedAddress({
                            label, hNo: '123', plotNo: 'A', colony: 'Park', street: 'Main', pincode: '560001', city: 'Bangalore'
                          });
                        }
                      }}
                      className="w-full py-5 bg-black text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                    >
                      <Plus size={16} /> Add New Address
                    </button>

                    <div className="space-y-4">
                      {(user.savedAddresses || []).length === 0 ? (
                        <div className="py-20 text-center opacity-20"><MapPin size={48} className="mx-auto" /><p className="text-[10px] font-black uppercase mt-4">No addresses saved</p></div>
                      ) :
                        user.savedAddresses?.map(addr => (
                          <div key={addr.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex items-center justify-between group">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-black">
                                {addr.label.toLowerCase().includes('home') ? <HomeIcon size={24} /> : <Briefcase size={24} />}
                              </div>
                              <div>
                                <p className="text-[11px] font-black uppercase text-black">{addr.label}</p>
                                <p className="text-[9px] font-black opacity-40 uppercase mt-0.5">{addr.hNo}, {addr.street}, {addr.city}</p>
                              </div>
                            </div>
                            <button onClick={() => removeSavedAddress(addr.id)} className="p-3 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {accountTab === 'WALLET' && (
                  <div className="space-y-8">
                    <div className="bg-black p-12 rounded-[3.5rem] text-center text-white shadow-2xl">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">Available Credits</p>
                      <h3 className="text-6xl font-black tracking-tighter text-white">₹{user.walletBalance}</h3>
                    </div>

                    {rechargeStep === 'SELECT' && (
                      <div className="space-y-6 text-black">
                        <p className="text-[10px] font-black uppercase text-black opacity-40 ml-4 tracking-widest">Select Recharge Amount</p>
                        <div className="grid grid-cols-3 gap-3">
                          {[200, 500, 1000].map(v => (
                            <button key={v} onClick={() => handleRechargeWallet(v)} className="py-5 bg-white rounded-2xl font-black text-sm border-2 border-slate-100 hover:border-black transition-all text-black">₹{v}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {rechargeStep === 'PAYMENT' && (
                      <div className="bg-white p-8 rounded-[3rem] border-2 border-black shadow-xl animate-scale-up space-y-6 text-black">
                        <h4 className="text-xl font-black uppercase text-black">Complete Payment</h4>
                        <p className="text-xs font-black text-black opacity-50 uppercase">Adding ₹{rechargeAmount} to your wallet. Choose payment method to authorize.</p>
                        <div className="space-y-3">
                          <button onClick={processRechargePayment} className="w-full p-5 bg-slate-50 rounded-2xl flex items-center justify-between group border-2 border-transparent hover:border-black transition-all text-black">
                            <div className="flex items-center gap-4 text-black"><Smartphone className="text-black" /><span className="text-[10px] font-black uppercase text-black">Pay via UPI</span></div>
                            <ChevronRight size={16} className="text-black" />
                          </button>
                          <button onClick={processRechargePayment} className="w-full p-5 bg-slate-50 rounded-2xl flex items-center justify-between group border-2 border-transparent hover:border-black transition-all text-black">
                            <div className="flex items-center gap-4 text-black"><CreditCard className="text-black" /><span className="text-[10px] font-black uppercase text-black">Pay via Card</span></div>
                            <ChevronRight size={16} className="text-black" />
                          </button>
                        </div>
                        <button onClick={() => setRechargeStep('SELECT')} className="w-full py-4 text-[10px] font-black uppercase text-black opacity-40">Cancel Payment</button>
                      </div>
                    )}

                    {rechargeStep === 'PROCESSING' && (
                      <div className="py-20 text-center animate-pulse text-black">
                        <Loader2 size={48} className="animate-spin mx-auto mb-4 text-black" />
                        <h4 className="text-xl font-black uppercase text-black">Verifying Payment...</h4>
                      </div>
                    )}
                  </div>
                )}

                {accountTab === 'ORDERS' && (
                  <div className="space-y-4">
                    {userOrders.length === 0 ? (
                      <div className="py-20 text-center opacity-20"><Package size={48} className="mx-auto text-black" /><p className="text-[10px] font-black uppercase text-black">History is empty</p></div>
                    ) :
                      userOrders.map(o => (
                        <div key={o.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm space-y-4 text-black">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black uppercase text-black opacity-40">#{o.id}</p>
                            <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase ${o.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                              {o.status}
                            </span>
                          </div>
                          <div className="pt-4 border-t border-dashed flex justify-between font-black text-xs uppercase text-black">
                            <span>Total Amount</span>
                            <span>₹{o.total}</span>
                          </div>
                          {o.status !== 'delivered' && o.status !== 'CANCELLED' && (
                            <button onClick={() => { setActiveTrackingId(o.id); setView('TRACKING'); }} className="w-full py-3 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-white">Track Now</button>
                          )}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {accountTab === 'INVOICES' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Receipt size={48} className="mx-auto mb-4 opacity-30" />
                <p>No orders placed yet</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-200">
                    <div>
                      <p className="text-lg font-black text-slate-900">Invoice</p>
                      <p className="text-xs text-slate-600 mt-1">{order.invoiceData?.invoiceNumber || `INV-${order.id.slice(0, 8)}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">{new Date(order.invoiceData?.invoiceDate || order.createdAt).toLocaleDateString()}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'picked' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Order Tracking Stages */}
                  <div className="mb-6 p-4 bg-white rounded-lg">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Order Status</p>
                    <div className="flex justify-between items-center gap-2">
                      {['ordered', 'picked', 'out_for_delivery', 'delivered'].map((stage, idx) => (
                        <div key={stage} className="flex-1 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition-all ${
                            order.status === 'delivered' || 
                            (order.status === 'out_for_delivery' && idx <= 2) ||
                            (order.status === 'picked' && idx <= 1) ||
                            (order.status === 'ordered' && idx === 0)
                              ? 'bg-green-500 text-white scale-110' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <p className="text-xs text-center text-slate-700 font-semibold line-clamp-2">
                            {stage === 'ordered' ? 'Ordered' :
                             stage === 'picked' ? 'Picked Up' :
                             stage === 'out_for_delivery' ? 'Out for Delivery' :
                             'Delivered'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="space-y-4 mb-4">
                    {order.invoiceData?.items?.map((item: any) => (
                      <div key={item.productId} className="flex justify-between items-center text-sm pb-2 border-b border-slate-200">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-600">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="font-bold text-slate-900">₹{item.subtotal}</p>
                      </div>
                    ))}
                  </div>

                  {/* Invoice Totals */}
                  <div className="space-y-2 mb-4 p-3 bg-white rounded-lg">
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>Subtotal:</span>
                      <span>₹{order.invoiceData?.subtotal || order.total}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>Taxes (5%):</span>
                      <span>₹{order.invoiceData?.taxes || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>Delivery Fee:</span>
                      <span>₹{order.invoiceData?.deliveryFee || 15}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total:</span>
                      <span className="text-green-600">₹{order.invoiceData?.total || order.total}</span>
                    </div>
                  </div>

                  {/* Customer & Delivery Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4 p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-slate-600 font-semibold">Customer</p>
                      <p className="text-slate-900">{order.invoiceData?.customerName || user?.name || 'N/A'}</p>
                      <p className="text-slate-600">{order.invoiceData?.customerPhone || user?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">Hub</p>
                      <p className="text-slate-900">{order.invoiceData?.hubName || 'N/A'}</p>
                      <p className="text-slate-600">{order.invoiceData?.hubAddress || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Download & Print Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-800 transition-all"
                    >
                      🖨️ Print
                    </button>
                    <button
                      onClick={() => {
                        const invoiceText = `
Invoice: ${order.invoiceData?.invoiceNumber}
Date: ${new Date(order.invoiceData?.invoiceDate).toLocaleDateString()}

Items:
${order.invoiceData?.items?.map((item: any) => `${item.name} x${item.quantity} = ₹${item.subtotal}`).join('\n')}

Subtotal: ₹${order.invoiceData?.subtotal}
Taxes: ₹${order.invoiceData?.taxes}
Delivery Fee: ₹${order.invoiceData?.deliveryFee}
Total: ₹${order.invoiceData?.total}
                        `;
                        const blob = new Blob([invoiceText], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${order.invoiceData?.invoiceNumber}.txt`;
                        a.click();
                      }}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-green-700 transition-all"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}


        {/* Order Tracking View */}
        {view === 'TRACKING' && (
          <div className="animate-fade-in space-y-6 pb-20">
            <style>{`
              .status-badge {
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              
              .status-change-pulse {
                animation: statusPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              
              @keyframes statusPulse {
                0% {
                  transform: scale(0.95);
                  opacity: 0.8;
                }
                50% {
                  transform: scale(1.05);
                  opacity: 1;
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
              
              .stage-icon {
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              
              .stage-completed {
                animation: stageComplete 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              
              @keyframes stageComplete {
                0% {
                  transform: scale(0.8) rotate(-180deg);
                  opacity: 0;
                }
                50% {
                  transform: scale(1.15) rotate(10deg);
                }
                100% {
                  transform: scale(1) rotate(0deg);
                  opacity: 1;
                }
              }
              
              .stage-active {
                animation: stagePulse 1.5s ease-in-out infinite;
              }
              
              @keyframes stagePulse {
                0%, 100% {
                  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
                  transform: scale(1);
                }
                50% {
                  box-shadow: 0 0 0 12px rgba(59, 130, 246, 0);
                  transform: scale(1.02);
                }
              }
              
              .order-card-update {
                animation: orderUpdate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
              }
              
              @keyframes orderUpdate {
                0% {
                  transform: translateY(-2px);
                  opacity: 0.95;
                }
                100% {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            `}</style>

            <div className="flex items-center gap-4">
              <button onClick={() => setView('HOME')} className="p-3 bg-white rounded-2xl shadow-sm"><ChevronLeft size={20} className="text-black" /></button>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Order Tracking</h2>
            </div>
            
            {/* Show just delivered orders with celebration */}
            {Array.from(justDeliveredOrders).map(orderId => {
              const deliveredOrder = userOrders.find(o => o.id === orderId);
              if (!deliveredOrder || deliveredOrdersHiding.has(orderId)) return null;
              
              return (
                <div 
                  key={`celebration-${orderId}`}
                  className={`bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 rounded-[2rem] p-8 shadow-2xl text-center transform transition-all duration-500 ${
                    deliveredOrdersHiding.has(orderId) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  <div className="animate-bounce text-6xl mb-4">🎉</div>
                  <h3 className="text-3xl font-black text-white mb-2">Order Delivered!</h3>
                  <p className="text-lg text-white font-bold mb-1">Your order #<span className="text-yellow-100">{orderId}</span> has arrived</p>
                  <p className="text-xl text-white font-black mt-4">✨ Enjoy the day! ✨</p>
                  <p className="text-sm text-white mt-6 opacity-90">Clearing basket in a moment...</p>
                </div>
              );
            })}
            
            {(activeDeliveries.length > 0 || justDeliveredOrders.size > 0) ? (
              <div className="space-y-4">
                {activeDeliveries.map(order => (
                  <div key={order.id} className="order-card-update bg-gradient-to-br from-white to-blue-50 rounded-[2rem] p-6 shadow-lg border border-blue-100">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-blue-100">
                      <div>
                        <p className="text-lg font-black text-slate-900">Order #{order.id}</p>
                        <p className="text-xs text-slate-600 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`status-badge status-change-pulse px-4 py-2 rounded-full text-xs font-bold ${
                        order.status === 'delivered' ? 'bg-green-500 text-white' :
                        order.status === 'in_transit' ? 'bg-blue-500 text-white' :
                        order.status === 'picked_up' ? 'bg-amber-500 text-white' :
                        'bg-slate-500 text-white'
                      }`}>
                        {order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                      </span>
                    </div>

                    {/* Tracking Stages */}
                    <div className="space-y-4 mb-6">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Tracked Progress</p>
                      <div className="space-y-3">
                        {[
                          { stage: 'ordered', label: '📦 Order Placed', icon: '✓', color: 'green' },
                          { stage: 'picked_up', label: '🏢 Picked Up at Hub', icon: '✓', color: 'blue' },
                          { stage: 'in_transit', label: '🚚 Out for Delivery', icon: '→', color: 'yellow' },
                          { stage: 'delivered', label: '🎉 Delivered', icon: '✓', color: 'green' }
                        ].map((step, idx) => {
                          const isActive = order.status === step.stage || 
                            (order.status === 'delivered' && step.stage) ||
                            (order.status === 'in_transit' && (step.stage === 'in_transit' || step.stage === 'picked_up' || step.stage === 'ordered')) ||
                            (order.status === 'picked_up' && (step.stage === 'picked_up' || step.stage === 'ordered')) ||
                            (order.status === 'ordered' && step.stage === 'ordered');
                          
                          const isCompleted = 
                            (order.status === 'delivered') ||
                            (order.status === 'in_transit' && (step.stage === 'in_transit' || step.stage === 'picked_up' || step.stage === 'ordered')) ||
                            (order.status === 'picked_up' && (step.stage === 'picked_up' || step.stage === 'ordered')) ||
                            (order.status === 'ordered' && step.stage === 'ordered');

                          return (
                            <div key={step.stage} className="flex gap-3 items-start">
                              <div className={`stage-icon w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 transition-all ${
                                isCompleted 
                                  ? 'stage-completed bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/40' 
                                  : isActive 
                                  ? 'stage-active bg-blue-500 text-white' 
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {isCompleted ? '✓' : step.icon}
                              </div>
                              <div className="flex-1 pt-2">
                                <p className={`font-bold transition-colors duration-300 ${isCompleted || isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                                  {step.label}
                                </p>
                                <p className={`text-xs transition-colors duration-300 ${
                                  isCompleted ? 'text-green-600 font-semibold' :
                                  isActive ? 'text-blue-600 font-semibold animate-pulse' :
                                  'text-slate-600'
                                }`}>
                                  {isCompleted ? '✓ Completed' : isActive ? '⏳ In Progress' : 'Pending'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Items</p>
                      <div className="space-y-2">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                            <div>
                              <p className="font-semibold text-slate-900">{item.name || 'Product'}</p>
                              <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-slate-900">₹{(item.price || 0) * (item.quantity || 1)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Delivery To</p>
                      <p className="text-sm text-slate-900 font-semibold">{order.deliveryAddress}</p>
                    </div>

                    {/* Delivery Partner Info */}
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-4">
                      <p className="text-xs font-bold text-purple-900 uppercase tracking-widest mb-2">Assigned Delivery Partner</p>
                      {order.assignedDeliveryPartner ? (
                        <p className="text-sm text-purple-900 font-semibold">📍 {order.assignedDeliveryPartner}</p>
                      ) : (
                        <p className="text-sm text-purple-700">⏳ No partner assigned yet</p>
                      )}
                    </div>

                    {/* Estimate */}
                    {order.status !== 'delivered' && (
                      <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-4">
                        <p className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">Estimated Delivery</p>
                        <p className="text-sm font-bold text-blue-900">
                          {order.status === 'in_transit' ? 'Within 30 minutes' :
                           order.status === 'picked_up' ? 'In 1-2 hours' :
                           'In 2-3 hours'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-black opacity-40 uppercase">Basket is empty</p>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-22 bg-white border-t border-[#E8A76F]/20 flex justify-around items-center px-4 z-[50] rounded-t-[2.5rem] shadow-lg">
        <NavBtn active={view === 'HOME'} icon={<Home size={22} />} label="Market" onClick={() => setView('HOME')} />
        <NavBtn active={view === 'TRACKING'} icon={<Truck size={22} />} label="Live" badge={activeDeliveries.length} onClick={() => setView('TRACKING')} />
        <NavBtn active={view === 'CART'} icon={<ShoppingCart size={22} />} label="Basket" badge={cart.length} onClick={() => setView('CART')} />
        <NavBtn active={view === 'ACCOUNT'} icon={<UserIcon size={22} />} label="Account" onClick={() => { setView('ACCOUNT'); setAccountTab('OVERVIEW'); }} />
      </nav>
    </div>
  );
};

// Subcomponents
const AddressInput = ({ label, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[8px] font-black uppercase tracking-widest text-[#3E5C76] opacity-40 ml-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#FBF0DF] border-2 border-transparent focus:border-[#3E5C76] p-3 rounded-xl text-[10px] font-black outline-none transition-all text-[#3E5C76]"
      placeholder={`Enter ${label}...`}
    />
  </div>
);

const InfoRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-[#FBF0DF] last:border-0">
    <p className="text-[10px] font-black uppercase text-[#3E5C76] opacity-40">{label}</p>
    <p className="text-[11px] font-black text-[#3E5C76]">{value}</p>
  </div>
);

const NavBtn = ({ active, icon, label, badge, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 px-4 relative ${active ? 'text-[#3E5C76]' : 'text-[#3E5C76] opacity-30'}`}>
    <div className={active ? 'text-[#3E5C76]' : 'text-[#3E5C76] opacity-30'}>{icon}</div>
    {badge > 0 && <span className="absolute -top-1 right-2 bg-[#3E5C76] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white text-white">{badge}</span>}
    <span className="text-[8px] font-black uppercase tracking-widest text-[#3E5C76]">{label}</span>
  </button>
);

const PaymentBtn = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`w-full p-5 rounded-[1.8rem] border-2 flex justify-between items-center transition-all ${active ? 'bg-[#3E5C76] border-[#3E5C76] text-white' : 'bg-white border-[#FBF0DF] text-[#3E5C76]'}`}>
    <div className="flex items-center gap-4 text-[#3E5C76]"><div className={active ? 'text-white' : 'text-[#3E5C76]'}>{icon}</div> <span className={`text-[11px] font-black uppercase ${active ? 'text-white' : 'text-[#3E5C76]'}`}>{label}</span></div>
    {active ? <CheckCircle2 size={20} className="text-[#7BA04E]" /> : <div className="w-5 h-5 rounded-full border-2 border-[#FBF0DF]" />}
  </button>
);

const AccountActionCard = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col items-center text-center gap-3 group hover:border-black transition-all">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-black group-hover:scale-110 transition-transform">{icon}</div>
    <p className="text-[10px] font-black uppercase text-black">{label}</p>
  </button>
);
const AccountItem = ({ label, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center text-sm font-medium hover:bg-gray-50 transition"
  >
    {label}
    <ChevronRight size={16} className="text-gray-400" />
  </button>
);
const Section = ({ title, children }: any) => (
  <div>
    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const ProfileItem = ({ label, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center text-sm hover:bg-gray-50 transition"
  >
    {label}
    <ChevronRight size={16} className="text-gray-400" />
  </button>
);
