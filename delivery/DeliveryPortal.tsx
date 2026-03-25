import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store';
import api from '../api';
import { 
  MapPin, Phone, CheckCircle2, Package, Clock, DollarSign, LogOut, 
  User as UserIcon, ChevronRight, Settings, Star, Power, Calendar, 
  ShoppingBag, Navigation, ArrowRight, AlertCircle, TrendingUp, 
  Wallet, Award, History, Bell, ShieldCheck, CreditCard, ExternalLink,
  Loader2, CheckCircle, Home as LucideHome, Truck, Eye, EyeOff
} from 'lucide-react';
import { Order } from '../types';

// --- Helper Components ---

const Store = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>;
const Home = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color?: string }> = ({ label, value, icon, color }) => (
  <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 text-center">
    <div className={`mb-2 flex justify-center ${color || 'text-slate-500'}`}>{icon}</div>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
    <p className="text-sm font-black">{value}</p>
  </div>
);

const OrderCard: React.FC<{ 
  order: any; 
  hubName: string; 
  onUpdateStatus: (id: string, status: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  loading?: boolean 
}> = ({ order, hubName, onUpdateStatus, onAccept, onReject, loading = false }) => {
  const [showItems, setShowItems] = useState(false);
  const statusSteps = ['ordered', 'accepted', 'picked_up', 'in_transit', 'delivered'];
  const currentIndex = statusSteps.indexOf(order.status);
  const progress = Math.max(0, (currentIndex / (statusSteps.length - 1)) * 100);
  
  const getNextStatus = () => {
    const statusMap: Record<string, string> = {
      'ordered': 'accepted',
      'accepted': 'picked_up',
      'picked_up': 'in_transit',
      'in_transit': 'delivered'
    };
    return statusMap[order.status];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ordered': 'bg-blue-500/10 text-blue-400',
      'accepted': 'bg-green-500/10 text-green-400',
      'picked_up': 'bg-yellow-500/10 text-yellow-400',
      'in_transit': 'bg-purple-500/10 text-purple-400',
      'delivered': 'bg-green-500/10 text-green-400',
      'CANCELLED': 'bg-red-500/10 text-red-400'
    };
    return colors[status] || 'bg-slate-800 text-slate-400';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ordered': 'Ordered',
      'accepted': 'Accepted',
      'picked_up': 'Picked Up',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  };

  // Calculate total weight
  const totalWeight = order.items?.reduce((sum: number, item: any) => {
    const weight = parseFloat(item.quantity) * 0.5 || 0; // Default 500g per unit
    return sum + weight;
  }, 0) || 0;

  return (
    <div className="bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden hover:border-white/10 transition-all">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-black text-white mb-1">Order #{order._id?.slice(-8).toUpperCase() || order.id?.slice(-8).toUpperCase()}</h3>
            <p className="text-xs text-slate-400">
              {new Date(order.createdAt).toLocaleDateString()} · {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Order Type & Payment Info */}
        <div className="flex gap-2 border-t border-white/5 pt-4">
          <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-bold uppercase">
            {order.orderType === 'SUBSCRIPTION' ? '🔁 Subscription' : '📦 Instant Order'}
          </span>
          <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold uppercase">
            {order.paymentMethod || 'COD'}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
            order.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
          }`}>
            {order.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Pending'}
          </span>
        </div>

        {/* Items Section */}
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={() => setShowItems(!showItems)}
            className="flex items-center justify-between w-full pb-3"
          >
            <p className="text-xs text-slate-500 font-bold uppercase">Items ({order.items?.length || 0})</p>
            <ChevronRight size={16} className={`transition-transform ${showItems ? 'rotate-90' : ''}`} />
          </button>
          
          {showItems && order.items && (
            <div className="space-y-2 pb-3 border-t border-white/10 pt-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-xs">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                    {item.specialInstructions && (
                      <p className="text-yellow-400 text-[10px] mt-1">📝 {item.specialInstructions}</p>
                    )}
                  </div>
                  <p className="font-bold text-green-400">₹{item.price?.toFixed(2) || '0.00'}</p>
                </div>
              ))}
              {totalWeight > 0 && (
                <div className="pt-2 border-t border-white/10 mt-2 text-[10px] text-slate-400">
                  📦 Total Weight: {totalWeight.toFixed(2)} kg
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pickup Details */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <div className="flex items-start gap-3">
            <Store className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-bold uppercase">Pickup (Store)</p>
              <p className="text-sm font-semibold">{hubName}</p>
              {order.storeAddress && <p className="text-xs text-slate-500 mt-0.5">{order.storeAddress}</p>}
              {order.storePhone && <p className="text-xs text-slate-500 mt-1">📱 {order.storePhone}</p>}
              {order.pickupOTP && (
                <div className="mt-2 bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/20">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Pickup OTP</p>
                  <p className="text-lg font-black text-orange-400 tracking-widest">{order.pickupOTP}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-bold uppercase">Delivery (Customer)</p>
              <p className="text-sm font-semibold">{order.customerName || 'Customer'}</p>
              <p className="text-xs text-slate-500 mt-1">📍 {order.deliveryAddress || 'N/A'}</p>
              {order.deliveryLandmark && (
                <p className="text-xs text-slate-500">🏘️ {order.deliveryLandmark}</p>
              )}
              {order.customerPhone && (
                <p className="text-xs text-slate-500 mt-1">📱 {order.customerPhone}</p>
              )}
              {order.deliveryOTP && (
                <div className="mt-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Delivery OTP</p>
                  <p className="text-lg font-black text-green-400 tracking-widest">{order.deliveryOTP}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Earnings & Distance */}
        <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Delivery Fee</p>
            <p className="text-sm font-black text-green-400 mt-1">₹{order.deliveryFee || (order.total * 0.1).toFixed(2)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Distance</p>
            <p className="text-sm font-black text-blue-400 mt-1">{order.distance || '2.5'} km</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Incentive</p>
            <p className="text-sm font-black text-yellow-400 mt-1">+₹{order.incentive || '0'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-black uppercase text-slate-400">Progress</p>
            <p className="text-xs font-black text-green-400">{Math.round(progress)}%</p>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        {order.status === 'ordered' ? (
          <div className="pt-4 border-t border-white/5 space-y-2">
            <button
              onClick={() => onAccept?.(order.id || order._id)}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '✓ Accept Order'}
            </button>
            <button
              onClick={() => onReject?.(order.id || order._id)}
              disabled={loading}
              className="w-full py-3 bg-red-600/20 text-red-400 font-bold rounded-xl hover:bg-red-600/30 transition-all active:scale-95 border border-red-500/20 disabled:opacity-50"
            >
              ✗ Reject Order
            </button>
          </div>
        ) : order.status !== 'delivered' && order.status !== 'CANCELLED' && order.status !== 'rejected' ? (
          <div className="pt-4 border-t border-white/5 space-y-2">
            <button
              onClick={() => {
                const nextStatus = getNextStatus();
                if (nextStatus) {
                  console.log(`🖱️ Clicked update button for order: ${order.id}, current status: ${order.status}, next: ${nextStatus}`);
                  onUpdateStatus(order.id || order._id, nextStatus);
                }
              }}
              disabled={loading || !getNextStatus()}
              className={`w-full py-3 rounded-xl font-bold uppercase text-sm transition-all ${
                loading || !getNextStatus()
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                `✓ ${getStatusLabel(getNextStatus())}`
              )}
            </button>
            <button className="w-full py-2 text-red-400 font-bold text-xs border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all">
              🚨 Report Issue
            </button>
          </div>
        ) : order.status === 'delivered' ? (
          <div className="pt-4 border-t border-white/5 px-4 py-3 bg-green-500/10 rounded-xl text-center">
            <p className="text-green-400 font-bold text-xs uppercase">✓ Order Delivered</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Subscription Card Component
const SubscriptionCard: React.FC<{
  subscription: any;
  hubName: string;
  onMarkDelivered?: (id: string) => void;
  onSkip?: (id: string) => void;
  loading?: boolean;
}> = ({ subscription, hubName, onMarkDelivered, onSkip, loading = false }) => {
  const [showFrequency, setShowFrequency] = useState(false);

  const getPlanLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      'DAILY': '📅 Daily',
      'ALTERNATE': '📅 Alternate Days',
      'WEEKLY': '📅 Weekly'
    };
    return labels[frequency] || frequency;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-green-500/10 text-green-400',
      'PAUSED': 'bg-orange-500/10 text-orange-400',
      'CANCELLED': 'bg-red-500/10 text-red-400'
    };
    return colors[status] || 'bg-slate-800 text-slate-400';
  };

  // Check if delivery was already done today
  const today = new Date().toISOString().split('T')[0];
  const lastDeliveredDate = subscription.lastDeliveredDate ? new Date(subscription.lastDeliveredDate).toISOString().split('T')[0] : null;
  const isDeliveredToday = lastDeliveredDate === today;
  
  // Get next delivery date when button will be enabled
  const nextDeliveryDate = subscription.nextDeliveryDate || subscription.startDate;
  const nextDeliveryStr = new Date(nextDeliveryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const startDate = new Date(subscription.startDate).toLocaleDateString();
  const endDate = new Date(subscription.endDate).toLocaleDateString();
  const daysRemaining = Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden hover:border-white/10 transition-all">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-black text-white mb-1">Subscription #{subscription._id?.slice(-8).toUpperCase() || subscription.id?.slice(-8).toUpperCase()}</h3>
            <p className="text-xs text-slate-400">{getPlanLabel(subscription.frequency)}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(subscription.status)}`}>
            {subscription.status}
          </span>
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Start Date</p>
            <p className="text-sm font-semibold mt-1">{startDate}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase">End Date</p>
            <p className="text-sm font-semibold mt-1">{endDate}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Qty/Day</p>
            <p className="text-sm font-semibold mt-1">{subscription.quantityPerDay}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Days Left</p>
            <p className={`text-sm font-semibold mt-1 ${daysRemaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {daysRemaining} days
            </p>
          </div>
        </div>

        {/* Time Slot & Frequency */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-bold uppercase">Delivery Time Slot</p>
              <p className="text-sm font-semibold mt-1">{subscription.timeSlot || '6:00 AM - 8:00 AM'}</p>
            </div>
          </div>
        </div>

        {/* Today's Delivery Info */}
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={() => setShowFrequency(!showFrequency)}
            className="flex items-center justify-between w-full pb-3"
          >
            <p className="text-xs text-slate-500 font-bold uppercase">📦 Today's Delivery</p>
            <ChevronRight size={16} className={`transition-transform ${showFrequency ? 'rotate-90' : ''}`} />
          </button>

          {showFrequency && (
            <div className="space-y-3 pb-3 border-t border-white/10 pt-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-xs text-green-400 font-bold uppercase mb-2">✓ Scheduled for Today</p>
                <div className="space-y-2 text-xs">
                  <p className="text-white font-semibold">{subscription.productName || 'Milk'}</p>
                  <p className="text-slate-400">Quantity: <span className="text-white font-bold">{subscription.quantityPerDay}</span></p>
                  <p className="text-slate-400">Time: <span className="text-white font-bold">{subscription.timeSlot || '6:00 AM - 8:00 AM'}</span></p>
                  {subscription.specialNotes && (
                    <p className="text-yellow-400 mt-2">📝 {subscription.specialNotes}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer & Delivery Info */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-bold uppercase">Delivery Address</p>
              <p className="text-sm font-semibold mt-1">{subscription.customerName || 'Customer'}</p>
              <p className="text-xs text-slate-500 mt-1">{subscription.deliveryAddress}</p>
              {subscription.customerPhone && (
                <p className="text-xs text-slate-500 mt-1">📱 {subscription.customerPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Status Notice */}
        {subscription.status === 'PAUSED' && (
          <div className="border-t border-white/5 pt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <p className="text-orange-400 text-xs font-bold">⏸️ Subscription Paused by Customer</p>
            <p className="text-slate-400 text-[10px] mt-1">Check app for pause period</p>
          </div>
        )}

        {/* Action Buttons */}
        {subscription.status !== 'CANCELLED' && (
          <div className="pt-4 border-t border-white/5 space-y-2">
            {isDeliveredToday ? (
              <div className="w-full py-3 bg-slate-700/50 text-slate-300 font-bold rounded-xl text-center border border-slate-600">
                <p className="text-sm">✓ Already Delivered Today</p>
                <p className="text-xs text-slate-400 mt-1">Next delivery: {nextDeliveryStr}</p>
              </div>
            ) : (
              <button
                onClick={() => onMarkDelivered?.(subscription.id || subscription._id)}
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '✓ Mark Delivered'}
              </button>
            )}
            {subscription.status === 'ACTIVE' && (
              <button
                onClick={() => onSkip?.(subscription.id || subscription._id)}
                disabled={isDeliveredToday}
                className="w-full py-2 text-blue-400 font-bold text-xs border border-blue-500/20 rounded-xl hover:bg-blue-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏭️ Skip Today's Delivery
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const NavButton: React.FC<{ 
  active: boolean; 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void 
}> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 py-2 px-4 rounded-xl transition-all ${
      active
        ? 'bg-green-600/10 text-green-500'
        : 'text-slate-500 hover:text-slate-400'
    }`}
  >
    <div>{icon}</div>
    <span className="text-[10px] font-bold uppercase">{label}</span>
  </button>
);

// --- Main DeliveryPortal Component ---

export const DeliveryPortal: React.FC = () => {
  const { currentDeliveryPartnerId, setActivePortal } = useApp();
  const [deliveryPartner, setDeliveryPartner] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'SUBSCRIPTIONS' | 'HISTORY' | 'EARNINGS' | 'PROFILE'>('ACTIVE');
  const [orderType, setOrderType] = useState<'ALL' | 'INSTANT' | 'SUBSCRIPTION'>('ALL');
  const [isOnline, setIsOnline] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch delivery partner and their orders/subscriptions
  useEffect(() => {
    const fetchData = async () => {
      if (!currentDeliveryPartnerId) {
        console.warn('❌ No delivery partner ID found');
        return;
      }
      
      console.log('🔄 Fetching data for delivery partner:', currentDeliveryPartnerId);
      setLoading(true);
      try {
        // Fetch partner details
        const partnersRes = await api.getDeliveryPartners();
        const partner = Array.isArray(partnersRes) 
          ? partnersRes.find((p: any) => p.id === currentDeliveryPartnerId || p._id === currentDeliveryPartnerId)
          : partnersRes.partner;
        
        if (!partner) {
          console.warn('⚠️ Delivery partner not found:', currentDeliveryPartnerId);
        } else {
          console.log('✅ Delivery partner found:', partner.name, 'Hub:', partner.hubId);
        }
        setDeliveryPartner(partner);

        // Fetch partner's orders
        console.log('📦 Fetching orders for partner:', currentDeliveryPartnerId);
        try {
          const ordersRes = await api.getDeliveryPartnerOrders(currentDeliveryPartnerId);
          console.log('📦 RAW API RESPONSE:', ordersRes);
          
          const fetchedOrders = Array.isArray(ordersRes) ? ordersRes : ordersRes.orders || [];
          
          // Separate instant orders and subscriptions
          const instantOrders = fetchedOrders.filter((o: any) => o.orderType !== 'SUBSCRIPTION');
          const subscriptionOrders = fetchedOrders.filter((o: any) => o.orderType === 'SUBSCRIPTION');
          
          console.log('📦✅ Orders fetched successfully:', fetchedOrders.length, 'orders found');
          console.log('   - Instant orders:', instantOrders.length);
          console.log('   - Subscription orders:', subscriptionOrders.length);
          
          if (fetchedOrders.length > 0) {
            console.log('   First order sample:', fetchedOrders[0]);
          }
          
          setOrders(instantOrders);
          
          // Also fetch subscriptions directly if partner has a hubId
          if (partner?.hubId) {
            try {
              console.log('🔁 Fetching subscriptions for hub:', partner.hubId);
              // Try to fetch subscriptions for this hub
              // If subscriptions API is available, use it
              const subsRes = await api.getSubscriptions?.() || [];
              const hubSubscriptions = Array.isArray(subsRes) 
                ? subsRes.filter((s: any) => s.hubId === partner.hubId && s.status === 'ACTIVE')
                : [];
              console.log('🔁✅ Subscriptions fetched:', hubSubscriptions.length);
              setSubscriptions(hubSubscriptions);
            } catch (subError) {
              console.log('⚠️ Could not fetch subscriptions separately, using subscription orders:', subscriptionOrders.length);
              setSubscriptions(subscriptionOrders);
            }
          } else {
            setSubscriptions(subscriptionOrders);
          }
        } catch (fetchError) {
          console.error('❌ ERROR fetching orders from backend:', fetchError.message);
          console.error('   Full error object:', fetchError.stack);
          setOrders([]);
          setSubscriptions([]);
        }
      } catch (error) {
        console.error('❌ Error fetching delivery data:', error);
        setOrders([]);
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [currentDeliveryPartnerId]);

  const handleAcceptOrder = async (orderId: string) => {
    console.log(`✅ Accepting order ${orderId}`);
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, 'accepted', currentDeliveryPartnerId);
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (order.id === orderId || order._id === orderId) {
            return { ...order, status: 'accepted', deliveryPartnerId: currentDeliveryPartnerId };
          }
          return order;
        })
      );
      console.log(`✅ Order ${orderId} accepted`);
    } catch (error: any) {
      console.error('❌ Error accepting order:', error.message);
      alert('Failed to accept order. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    console.log(`❌ Rejecting order ${orderId}`);
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, 'rejected', currentDeliveryPartnerId);
      setOrders(prevOrders =>
        prevOrders.filter(order => order.id !== orderId && order._id !== orderId)
      );
      console.log(`❌ Order ${orderId} rejected`);
    } catch (error: any) {
      console.error('❌ Error rejecting order:', error.message);
      alert('Failed to reject order. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    console.log(`🔄 Attempting to update order ${orderId} to status: ${newStatus}`);
    setUpdatingOrderId(orderId);
    try {
      const response = await api.updateOrderStatus(orderId, newStatus, currentDeliveryPartnerId);
      console.log(`✅ Backend response:`, response);
      
      if (response.success || response.order || response.id) {
        // Update local state immediately for better UX
        setOrders(prevOrders => {
          const updated = prevOrders.map(order => {
            if (order.id === orderId || order._id === orderId) {
              console.log(`✅ LOCAL STATE: Updated order ${orderId} status from "${order.status}" to "${newStatus}"`);
              return { ...order, status: newStatus };
            }
            return order;
          });
          console.log(`📊 New orders list:`, updated.map(o => ({ id: o.id, status: o.status })));
          return updated;
        });
      } else {
        console.error('❌ Unexpected response format:', response);
      }
    } catch (error: any) {
      console.error('❌ Error updating order status:', error.message || error);
    } finally {
      setUpdatingOrderId(null);
      console.log(`✅ Update finished for order ${orderId}`);
    }
  };

  const handleMarkSubscriptionDelivered = async (subscriptionId: string) => {
    console.log(`🔄 Marking subscription ${subscriptionId} as delivered today`);
    setUpdatingOrderId(subscriptionId);
    try {
      // Create delivery record for today
      const deliveryDate = new Date().toISOString().split('T')[0];
      const payload = {
        subscriptionId,
        deliveryPartnerId: currentDeliveryPartnerId,
        deliveryDate,
        status: 'DELIVERED'
      };

      // Try to use API if available, otherwise update local state
      if (api.markSubscriptionDelivered) {
        await api.markSubscriptionDelivered(payload);
      }

      // Update local state - mark this subscription as delivered today
      setSubscriptions(prevSubs =>
        prevSubs.map(sub => {
          if (sub.id === subscriptionId || sub._id === subscriptionId) {
            console.log(`✅ LOCAL STATE: Updated subscription ${subscriptionId} - marked delivered for today`);
            return {
              ...sub,
              lastDeliveredDate: deliveryDate,
              nextDeliveryDate: getNextDeliveryDate(sub),
              deliveryCount: (sub.deliveryCount || 0) + 1
            };
          }
          return sub;
        })
      );

      alert(`✅ Subscription delivery marked for ${deliveryDate}`);
      console.log('✅ Subscription marked as delivered');
    } catch (error) {
      console.error('❌ Error marking subscription as delivered:', error);
      alert('⚠️ Could not mark delivery. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextDeliveryDate = (subscription: any) => {
    const today = new Date();
    let next = new Date(today);
    
    if (subscription.frequency === 'DAILY') {
      next.setDate(next.getDate() + 1);
    } else if (subscription.frequency === 'ALTERNATE') {
      next.setDate(next.getDate() + 2);
    } else if (subscription.frequency === 'WEEKLY') {
      next.setDate(next.getDate() + 7);
    }
    
    return next.toISOString().split('T')[0];
  };

  const handleSkipSubscriptionDelivery = async (subscriptionId: string) => {
    console.log(`⏭️ Skipping delivery for subscription ${subscriptionId}`);
    setUpdatingOrderId(subscriptionId);
    try {
      const skipDate = new Date().toISOString().split('T')[0];
      const payload = {
        subscriptionId,
        deliveryPartnerId: currentDeliveryPartnerId,
        skipDate,
        reason: 'Delivery skipped by partner'
      };

      // Try to use API if available
      if (api.skipSubscriptionDelivery) {
        await api.skipSubscriptionDelivery(payload);
      }

      // Update local state
      setSubscriptions(prevSubs =>
        prevSubs.map(sub => {
          if (sub.id === subscriptionId || sub._id === subscriptionId) {
            console.log(`⏭️ LOCAL STATE: Updated subscription ${subscriptionId} - delivery skipped for ${skipDate}`);
            return {
              ...sub,
              skippedDates: [...(sub.skippedDates || []), skipDate],
              nextDeliveryDate: getNextDeliveryDate(sub)
            };
          }
          return sub;
        })
      );

      alert(`✅ Delivery skipped for ${skipDate}`);
      console.log('✅ Delivery skipped for today');
    } catch (error) {
      console.error('❌ Error skipping delivery:', error);
      alert('⚠️ Could not skip delivery. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'CANCELLED' && o.status !== 'rejected');
  const activeSubscriptions = subscriptions.filter(s => s.status !== 'CANCELLED');
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const totalEarnings = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0) * 0.1, 0);
  const todayEarnings = completedOrders.filter(o => {
    const orderDate = new Date(o.createdAt).toDateString();
    return orderDate === new Date().toDateString();
  }).reduce((sum, o) => sum + (o.total || 0) * 0.1, 0);

  // Filter for display based on orderType selection
  const displayOrders = orderType === 'INSTANT' ? activeOrders : orderType === 'SUBSCRIPTION' ? [] : activeOrders;
  const displaySubscriptions = orderType === 'SUBSCRIPTION' ? activeSubscriptions : orderType === 'ALL' ? activeSubscriptions : [];

  if (!deliveryPartner) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <Truck size={48} className="mb-4 opacity-30" />
        <h2 className="text-xl font-black mb-2">Loading...</h2>
        <Loader2 className="w-6 h-6 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/5 rounded-full blur-3xl -mr-36 -mt-36 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -ml-36 -mb-36 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-base font-black uppercase tracking-tight">Delivery Partner Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">{deliveryPartner.name}</p>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              isOnline
                ? 'bg-green-600/10 border-green-500 text-green-400'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {isOnline ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="text-xs font-bold uppercase">{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Quick Stats */}
        {activeTab === 'ACTIVE' && (
          <div className="grid grid-cols-3 gap-2">
            <StatCard 
              label="Orders" 
              value={activeOrders.length.toString()} 
              icon={<Truck size={16} />} 
              color="text-orange-400" 
            />
            <StatCard
              label="Subs"
              value={activeSubscriptions.length.toString()}
              icon={<Calendar size={16} />}
              color="text-purple-400"
            />
            <StatCard label="Total" value={`₹${totalEarnings.toFixed(0)}`} icon={<DollarSign size={16} />} color="text-blue-400" />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 space-y-6">
        {activeTab === 'ACTIVE' && (
          <>
            {!isOnline ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-4 border border-slate-800">
                  <Power size={40} className="text-slate-600" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Go Online</h2>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">Turn on to start receiving delivery orders in your zone</p>
                <button
                  onClick={() => setIsOnline(true)}
                  className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all active:scale-95"
                >
                  Go Online
                </button>
              </div>
            ) : (activeOrders.length > 0 || activeSubscriptions.length > 0) ? (
              <div className="space-y-4">
                {/* Order Type Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setOrderType('ALL')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      orderType === 'ALL'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    All ({activeOrders.length + activeSubscriptions.length})
                  </button>
                  <button
                    onClick={() => setOrderType('INSTANT')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      orderType === 'INSTANT'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    📦 Orders ({activeOrders.length})
                  </button>
                  <button
                    onClick={() => setOrderType('SUBSCRIPTION')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      orderType === 'SUBSCRIPTION'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    🔁 Subscriptions ({activeSubscriptions.length})
                  </button>
                </div>

                {/* Instant Orders Section */}
                {(orderType === 'ALL' || orderType === 'INSTANT') && activeOrders.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
                      📦 Active Orders ({activeOrders.length})
                    </h2>
                    <div className="space-y-3">
                      {activeOrders.map(order => (
                        <OrderCard
                          key={order._id || order.id}
                          order={order}
                          hubName={deliveryPartner?.hubName || 'Hub'}
                          onUpdateStatus={handleUpdateOrderStatus}
                          onAccept={handleAcceptOrder}
                          onReject={handleRejectOrder}
                          loading={updatingOrderId === order._id || updatingOrderId === order.id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscription Orders Section */}
                {(orderType === 'ALL' || orderType === 'SUBSCRIPTION') && activeSubscriptions.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
                      🔁 Active Subscriptions ({activeSubscriptions.length})
                    </h2>
                    <div className="space-y-3">
                      {activeSubscriptions.map(subscription => (
                        <SubscriptionCard
                          key={subscription._id || subscription.id}
                          subscription={subscription}
                          hubName={deliveryPartner?.hubName || 'Hub'}
                          onMarkDelivered={handleMarkSubscriptionDelivered}
                          onSkip={handleSkipSubscriptionDelivery}
                          loading={updatingOrderId === subscription._id || updatingOrderId === subscription.id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state for selected filter */}
                {orderType === 'INSTANT' && activeOrders.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <Package size={40} className="text-slate-700 mb-4" />
                    <h2 className="text-lg font-black uppercase">No Active Orders</h2>
                    <p className="text-slate-500 text-sm mt-2">No instant orders right now</p>
                  </div>
                )}

                {orderType === 'SUBSCRIPTION' && activeSubscriptions.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <Package size={40} className="text-slate-700 mb-4" />
                    <h2 className="text-lg font-black uppercase">No Active Subscriptions</h2>
                    <p className="text-slate-500 text-sm mt-2">No subscriptions to deliver today</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <Package size={48} className="text-slate-700 mb-4" />
                <h2 className="text-lg font-black uppercase">No Active Orders</h2>
                <p className="text-slate-500 text-sm mt-2">Waiting for new orders in your zone...</p>
                <p className="text-slate-600 text-xs mt-4 max-w-xs opacity-75">
                  Partner ID: {currentDeliveryPartnerId}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'SUBSCRIPTIONS' && (
          <>
            {!isOnline ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-4 border border-slate-800">
                  <Power size={40} className="text-slate-600" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Go Online</h2>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">Turn on to start receiving subscription deliveries</p>
                <button
                  onClick={() => setIsOnline(true)}
                  className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all active:scale-95"
                >
                  Go Online
                </button>
              </div>
            ) : activeSubscriptions.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
                  🔁 Active Subscriptions ({activeSubscriptions.length})
                </h2>
                <div className="space-y-3">
                  {activeSubscriptions.map(subscription => (
                    <SubscriptionCard
                      key={subscription._id || subscription.id}
                      subscription={subscription}
                      hubName={deliveryPartner?.hubName || 'Hub'}
                      onMarkDelivered={handleMarkSubscriptionDelivered}
                      onSkip={handleSkipSubscriptionDelivery}
                      loading={updatingOrderId === subscription._id || updatingOrderId === subscription.id}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <Calendar size={48} className="text-slate-700 mb-4" />
                <h2 className="text-lg font-black uppercase">No Active Subscriptions</h2>
                <p className="text-slate-500 text-sm mt-2">No subscription deliveries assigned yet</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'HISTORY' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider">Completed Deliveries</h2>
            {completedOrders.length > 0 ? (
              <div className="space-y-3">
                {completedOrders.map(order => (
                  <div key={order._id} className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">+₹{((order.total || 0) * 0.1).toFixed(2)}</p>
                      <span className="text-xs text-green-400 font-bold">Delivered</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center opacity-50">
                <History size={40} className="mx-auto mb-4" />
                <p className="text-sm font-bold">No completed deliveries</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'EARNINGS' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-center shadow-2xl border border-green-500/20">
              <p className="text-white/70 text-sm font-bold uppercase mb-2">Total Earnings</p>
              <h2 className="text-5xl font-black text-white mb-6">₹{totalEarnings.toFixed(2)}</h2>
              <button className="w-full bg-white text-green-600 font-bold py-3 rounded-xl hover:bg-slate-100 transition-all">
                Withdraw Funds
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 font-bold uppercase">Today</p>
                <p className="text-xl font-black text-yellow-400 mt-2">₹{todayEarnings.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500 mt-1">{completedOrders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length} deliveries</p>
              </div>
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 font-bold uppercase">Average</p>
                <p className="text-xl font-black text-blue-400 mt-2">₹{completedOrders.length > 0 ? (totalEarnings / completedOrders.length).toFixed(2) : '0.00'}</p>
                <p className="text-[10px] text-slate-500 mt-1">per delivery</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PROFILE' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-lg">
                {deliveryPartner.name[0]}
              </div>
              <h2 className="text-2xl font-black">{deliveryPartner.name}</h2>
              <p className="text-slate-400 text-sm mt-2">Phone: {deliveryPartner.phone}</p>
            </div>

            <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Vehicle</p>
                <p className="font-semibold">{deliveryPartner.vehicleType || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Status</p>
                <p className={`font-bold ${deliveryPartner.status === 'ACTIVE' ? 'text-green-400' : 'text-slate-400'}`}>
                  {deliveryPartner.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total Deliveries</p>
                <p className="font-bold">{completedOrders.length}</p>
              </div>
            </div>

            <button
              onClick={() => setActivePortal('CUSTOMER')}
              className="w-full bg-slate-900 text-slate-100 font-bold py-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              Switch to Customer View
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md border-t border-white/5 px-3 py-3 flex justify-around z-50">
        <NavButton
          active={activeTab === 'ACTIVE'}
          icon={<Truck size={20} />}
          label="Active"
          onClick={() => setActiveTab('ACTIVE')}
        />
        <NavButton
          active={activeTab === 'SUBSCRIPTIONS'}
          icon={<Calendar size={20} />}
          label="Subs"
          onClick={() => setActiveTab('SUBSCRIPTIONS')}
        />
        <NavButton
          active={activeTab === 'HISTORY'}
          icon={<History size={20} />}
          label="History"
          onClick={() => setActiveTab('HISTORY')}
        />
        <NavButton
          active={activeTab === 'EARNINGS'}
          icon={<TrendingUp size={20} />}
          label="Earnings"
          onClick={() => setActiveTab('EARNINGS')}
        />
        <NavButton
          active={activeTab === 'PROFILE'}
          icon={<UserIcon size={20} />}
          label="Profile"
          onClick={() => setActiveTab('PROFILE')}
        />
      </nav>
    </div>
  );
};
