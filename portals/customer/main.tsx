import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from '@/store';
import { CustomerPortal } from '@/customer/CustomerPortal';
import { CustomerAuth } from '@/auth/AuthPortal';
import { useApp } from '@/store';

const CustomerApp = () => {
  const { user } = useApp();
  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role === 'CUSTOMER' ? <CustomerPortal /> : <CustomerAuth />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppProvider>
      <CustomerApp />
    </AppProvider>
  </React.StrictMode>
);
