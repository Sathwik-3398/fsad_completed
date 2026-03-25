import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from '@/store';
import { DeliveryPortal } from '@/delivery/DeliveryPortal';
import { DeliveryAuth } from '@/auth/AuthPortal';
import { useApp } from '@/store';

const DeliveryApp = () => {
  const { user } = useApp();
  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role === 'DELIVERY' ? <DeliveryPortal /> : <DeliveryAuth />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppProvider>
      <DeliveryApp />
    </AppProvider>
  </React.StrictMode>
);
