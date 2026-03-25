import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, useApp } from './store';
import { DeliveryPortal } from './delivery/DeliveryPortal';
import { DeliveryAuth } from './auth/AuthPortal';

const DeliveryAppContent: React.FC = () => {
  const { user } = useApp();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-slate-900 text-white z-[100] shadow-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-lg">🚚</div>
            <span className="font-bold tracking-tighter hidden sm:inline">DELIVERY PARTNER PORTAL</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {user ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {user.name} (DELIVERY)
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Logged Out
              </span>
            )}
          </div>
          <a href="/" className="text-xs font-bold text-slate-400 hover:text-white">← All Portals</a>
        </div>
      </div>

      <main className="flex-1">
        {user?.role === 'DELIVERY' ? <DeliveryPortal /> : <DeliveryAuth />}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
console.log('📦 Root element search result:', rootElement);
if (!rootElement) {
  console.error('❌ CRITICAL: Could not find root element!');
  document.body.innerHTML = '<div style="color:red;font-size:20px;padding:20px;">ERROR: Root element not found. Check console.</div>';
  throw new Error("Could not find root element to mount to");
}

console.log('✅ Root element found, creating React root');
const root = ReactDOM.createRoot(rootElement);

try {
  console.log('🚀 Starting React render...');
  root.render(
    <React.StrictMode>
      <AppProvider>
        <DeliveryAppContent />
      </AppProvider>
    </React.StrictMode>
  );
  console.log('✅ React render successful');
} catch (error) {
  console.error('❌ React render error:', error);
  document.body.innerHTML = `<div style="color:red;font-size:16px;padding:20px;"><h2>Application Error</h2><p>${error instanceof Error ? error.message : String(error)}</p><p>Check browser console for details.</p></div>`;
}
