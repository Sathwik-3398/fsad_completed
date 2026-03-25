import React, { useState } from "react";
import {
  LayoutDashboard, Package, Home, Truck, ShoppingCart,
  RefreshCw, AlertCircle, Ticket, Settings as SettingsIcon, ChevronRight, LogOut
} from "lucide-react";
import { useApp } from "../store";
import Dashboard from "./Dashboard";
import Hubs from "./Hubs";
import Products from "./Products";
import Inventory from "./Inventory";
import Orders from "./Orders";
import Subscriptions from "./Subscriptions";
import Complaints from "./Complaints";
import Coupons from "./Coupons";
import Settings from "./Settings";
import DeliveryPartners from "./DeliveryPartners";

const AdminPortal = () => {
  const { logout } = useApp();
  const [menu, setMenu] = useState("DASHBOARD");

  const menuItems = [
    { label: "Dashboard", id: "DASHBOARD", icon: LayoutDashboard },
    { label: "Hubs", id: "HUBS", icon: Home },
    { label: "Products", id: "PRODUCTS", icon: Package },
    { label: "Inventory", id: "INVENTORY", icon: Truck },
    { label: "Delivery Partners", id: "DELIVERY_PARTNERS", icon: Truck },
    { label: "Orders", id: "ORDERS", icon: ShoppingCart },
    { label: "Subscriptions", id: "SUBSCRIPTIONS", icon: RefreshCw },
    { label: "Complaints", id: "COMPLAINTS", icon: AlertCircle },
    { label: "Coupons", id: "COUPONS", icon: Ticket },
    { label: "Settings", id: "SETTINGS", icon: SettingsIcon }
  ];

  const renderSection = () => {
    switch (menu) {
      case "DASHBOARD":
        return <Dashboard />;
      case "HUBS":
        return <Hubs />;
      case "PRODUCTS":
        return <Products />;
      case "INVENTORY":
        return <Inventory />;
      case "DELIVERY_PARTNERS":
        return <DeliveryPartners />;
      case "ORDERS":
        return <Orders />;
      case "SUBSCRIPTIONS":
        return <Subscriptions />;
      case "COMPLAINTS":
        return <Complaints />;
      case "COUPONS":
        return <Coupons />;
      case "SETTINGS":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 space-y-4 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="pb-6 border-b border-slate-700">
          <h1 className="text-2xl font-black tracking-tighter mb-2">SRI GEETHA</h1>
          <p className="text-slate-400 text-sm font-semibold">Dairy Management System</p>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-semibold text-sm group ${
                  menu === item.id
                    ? "bg-gradient-to-r from-blue-600 to-green-500 shadow-lg shadow-blue-500/30 text-white"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <Icon size={18} className={menu === item.id ? "text-white" : "group-hover:text-white"} />
                <span>{item.label}</span>
                {menu === item.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-slate-700 space-y-4">
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-all font-semibold text-sm group border border-red-500/30"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
          <div className="text-xs text-slate-400">
            <p className="mb-2">Admin Panel v1.0</p>
            <p>© 2026 Sri Geetha Dairy</p>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          {/* Top Bar */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-slate-800 mb-1">
                {menuItems.find(m => m.id === menu)?.label || "Dashboard"}
              </h2>
              <p className="text-slate-500">Manage your dairy delivery operations</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPortal;
