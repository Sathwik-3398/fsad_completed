import React, { useEffect, useState } from "react";
import { Building2, Package, ShoppingCart, Ticket, TrendingUp, ArrowUpRight } from "lucide-react";
import api from "../api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    hubs: 0,
    products: 0,
    orders: 0,
    coupons: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const hubs = await api.getHubs();
      const products = await api.getProducts();
      const orders = await api.getOrders();
      const coupons = await api.getCoupons();

      setStats({
        hubs: hubs?.length || 0,
        products: products?.length || 0,
        orders: orders?.length || 0,
        coupons: coupons?.length || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900">Dashboard</h2>
        <p className="text-slate-600 text-sm mt-1">System overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Hubs" 
          value={stats.hubs} 
          icon={<Building2 size={24} />}
          color="from-blue-500 to-blue-600"
          trend="+2 this week"
        />
        <Card 
          title="Products" 
          value={stats.products} 
          icon={<Package size={24} />}
          color="from-green-500 to-green-600"
          trend="+5 new items"
        />
        <Card 
          title="Orders" 
          value={stats.orders} 
          icon={<ShoppingCart size={24} />}
          color="from-purple-500 to-purple-600"
          trend="+12 today"
        />
        <Card 
          title="Coupons" 
          value={stats.coupons} 
          icon={<Ticket size={24} />}
          color="from-amber-500 to-amber-600"
          trend="+3 active"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white flex items-center justify-center flex-shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 uppercase">Total Revenue</p>
              <p className="text-2xl font-black text-slate-900 mt-1">₹ {(stats.orders * 500).toLocaleString()}</p>
              <p className="text-xs text-green-600 font-bold mt-2">↑ 8% from last week</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center flex-shrink-0">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 uppercase">System Status</p>
              <p className="text-2xl font-black text-slate-900 mt-1">✅ All Systems</p>
              <p className="text-xs text-green-600 font-bold mt-2">Operational 99.9% Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon, color, trend }: any) => (
  <div className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 relative overflow-hidden`}>
    {/* Decorative element */}
    <div className="absolute -right-8 -top-8 opacity-10 text-white">
      {icon}
    </div>

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
          {icon}
        </div>
      </div>

      <p className="text-sm font-bold opacity-90 uppercase tracking-widest">{title}</p>
      <h3 className="text-4xl font-black mt-2">{value}</h3>
      
      <div className="mt-4 pt-4 border-t border-white border-opacity-20">
        <p className="text-xs opacity-90">{trend}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
