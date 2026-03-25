
import React from 'react';
import { AppProvider, useApp } from './store';
import { CustomerPortal } from './customer/CustomerPortal';
import { DeliveryPortal } from './delivery/DeliveryPortal';
import  AdminPortal  from './admin/AdminPortal';
import { CustomerAuth, DeliveryAuth, AdminAuth } from './auth/AuthPortal';
import { ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

const Router: React.FC = () => {
  const { user, activePortal, setActivePortal } = useApp();

  const renderContent = () => {
    switch (activePortal) {
      case 'CUSTOMER':
        return (user?.role === 'CUSTOMER') ? <CustomerPortal /> : <CustomerAuth />;
      case 'DELIVERY':
        return (user?.role === 'DELIVERY') ? <DeliveryPortal /> : <DeliveryAuth />;
      case 'ADMIN':
        return (user?.role === 'ADMIN') ? <AdminPortal /> : <AdminAuth />;
      default:
        return <CustomerAuth />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Simulator Switcher */}
      <div className="bg-slate-900 text-white z-[100] shadow-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-lg">G</div>
            <span className="font-bold tracking-tighter hidden sm:inline">SRI GEETHA SIMULATOR</span>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
            <PortalTab 
              active={activePortal === 'CUSTOMER'} 
              icon={<ShoppingBag size={14}/>} 
              label="Customer" 
              onClick={() => setActivePortal('CUSTOMER')} 
            />
            <PortalTab 
              active={activePortal === 'DELIVERY'} 
              icon={<Truck size={14}/>} 
              label="Delivery" 
              onClick={() => setActivePortal('DELIVERY')} 
            />
            <PortalTab 
              active={activePortal === 'ADMIN'} 
              icon={<ShieldCheck size={14}/>} 
              label="Admin" 
              onClick={() => setActivePortal('ADMIN')} 
            />
          </div>

          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {user ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {user.name} ({user.role})
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Logged Out
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

const PortalTab: React.FC<{ active: boolean, icon: React.ReactNode, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all text-xs font-bold ${
      active 
        ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/10' 
        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
};

export default App;
