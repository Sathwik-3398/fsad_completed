import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from '@/store';
import AdminPortal from '@/admin/AdminPortal';
import { AdminAuth } from '@/auth/AuthPortal';
import { useApp } from '@/store';

const AdminApp = () => {
  const { user } = useApp();
  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role === 'ADMIN' ? <AdminPortal /> : <AdminAuth />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppProvider>
      <AdminApp />
    </AppProvider>
  </React.StrictMode>
);
