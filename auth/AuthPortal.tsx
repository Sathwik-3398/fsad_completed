import React, { useState } from 'react';
import { useApp } from '../store';
import { User as UserIcon, Lock, Mail, Phone, ArrowRight, Truck, ShieldCheck } from 'lucide-react';

/* ============================= */
/*        CUSTOMER AUTH          */
/* ============================= */

export const CustomerAuth: React.FC = () => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser, loginUser, setActivePortal } = useApp();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (mode === 'REGISTER') {
        const userData = {
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          password: formData.get('password') as string,
          role: 'CUSTOMER'
        };

        if (!userData.name || !userData.email || !userData.phone || !userData.password) {
          alert('Please fill in all fields');
          return;
        }

        await registerUser(userData);
        alert('Registration successful! Please login.');
        setMode('LOGIN');
      } else {
        const user = await loginUser(
          formData.get('email') as string,
          formData.get('password') as string
        );

        if (!user || user.role !== 'CUSTOMER') {
          alert('Invalid credentials.');
        } else {
          alert(`Welcome back, ${user.name}!`);
          setActivePortal('CUSTOMER');
        }
      }
    } catch (error) {
      const err = error as Error;
      console.error(err);
      alert(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Header Section */}
      <div className="text-center mb-8 z-10">
        <div className="text-4xl mb-2">☀️</div>
        <h1 className="text-4xl font-black text-[#3E5C76] leading-none tracking-tight">
          SRIGEETHA<br />DAIRY
        </h1>
      </div>

      {/* Login Card with Decorators */}
      <div className="relative w-full max-w-md">
        {/* Decorator Cows */}
        <img 
          src="https://cdn-icons-png.flaticon.com/512/1998/1998610.png" 
          className="absolute -top-12 -left-8 w-24 h-24 rotate-[-15deg] z-20 opacity-80"
          alt="jumping cow"
        />
        <img 
          src="https://cdn-icons-png.flaticon.com/512/1998/1998610.png" 
          className="absolute -bottom-10 -right-6 w-28 h-28 z-20 opacity-80"
          style={{ transform: 'scaleX(-1)' }}
          alt="jumping cow"
        />

        {/* The Card */}
        <div className="bg-white rounded-[40px] shadow-2xl p-10 relative z-10">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setMode('LOGIN')}
              className={`flex-1 py-2 font-bold border-b-2 text-center ${
                mode === 'LOGIN'
                  ? 'border-[#7BA04E] text-[#7BA04E]'
                  : 'border-gray-200 text-gray-400'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setMode('REGISTER')}
              className={`flex-1 py-2 font-bold border-b-2 text-center ${
                mode === 'REGISTER'
                  ? 'border-[#7BA04E] text-[#7BA04E]'
                  : 'border-gray-200 text-gray-400'
              }`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'REGISTER' && (
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">👤</span>
                <input 
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-[#F0F7FF] rounded-2xl border-none focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            )}

            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">👤</span>
              <input 
                name="email"
                type="email"
                placeholder={mode === 'LOGIN' ? "Email or Username" : "Email"}
                required
                className="w-full pl-12 pr-4 py-4 bg-[#F0F7FF] rounded-2xl border-none focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            {mode === 'REGISTER' && (
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">📱</span>
                <input 
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-[#F0F7FF] rounded-2xl border-none focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            )}

            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔒</span>
              <input 
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-4 bg-[#F0F7FF] rounded-2xl border-none focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7BA04E] hover:bg-[#6a8a43] text-white font-bold py-4 rounded-2xl transition-colors mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : (mode === 'LOGIN' ? 'LOG IN' : 'SIGN UP')}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            {mode === 'LOGIN' && (
              <a href="#" className="block text-sm text-blue-400 hover:underline">Forgot Password?</a>
            )}
            <div className="text-sm text-gray-600">
              {mode === 'LOGIN' 
                ? "Don't have an account? " 
                : "Already have an account? "}
              <button 
                type="button"
                onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="font-bold text-[#3E5C76] hover:underline cursor-pointer"
              >
                {mode === 'LOGIN' ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================= */
/*        DELIVERY AUTH          */
/* ============================= */

export const DeliveryAuth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginPartner, setActivePortal } = useApp();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const partner = await loginPartner(
        formData.get('phone') as string,
        formData.get('password') as string
      );

      if (!partner) {
        alert('Access denied.');
      } else {
        alert(`Welcome back, ${partner.name}!`);
        setActivePortal('DELIVERY');
      }
    } catch (error) {
      alert('Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 w-full max-w-md rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <Truck className="mx-auto text-orange-500" size={40} />
          <h2 className="text-white text-xl font-bold mt-4">Partner Login</h2>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <Input dark icon={<Phone size={18} />} name="phone" placeholder="Mobile Number" />
          <Input dark icon={<Lock size={18} />} name="password" type="password" placeholder="Password" />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl"
          >
            {isLoading ? 'Signing In...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ============================= */
/*          ADMIN AUTH           */
/* ============================= */

export const AdminAuth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser, setActivePortal } = useApp();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const user = await loginUser(
        formData.get('email') as string,
        formData.get('password') as string
      );

      if (!user || user.role !== 'ADMIN') {
        alert('Access denied.');
      } else {
        alert(`Welcome back, ${user.name}!`);
        setActivePortal('ADMIN');
      }
    } catch {
      alert('Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <ShieldCheck className="mx-auto text-slate-900" size={40} />
          <h2 className="text-xl font-bold mt-4">Admin Login</h2>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <Input icon={<Mail size={18} />} name="email" type="email" placeholder="Admin Email" />
          <Input icon={<Lock size={18} />} name="password" type="password" placeholder="Password" />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl"
          >
            {isLoading ? 'Authenticating...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ============================= */
/*            INPUT              */
/* ============================= */

const Input: React.FC<{
  icon?: React.ReactNode;
  name: string;
  type?: string;
  placeholder: string;
  dark?: boolean;
}> = ({ icon, name, type = 'text', placeholder, dark }) => (
  <div className="relative">
    <input
      name={name}
      type={type}
      required
      placeholder={placeholder}
      className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 outline-none transition-all text-black ${
        dark
          ? 'bg-gray-200 border-gray-600'
          : 'bg-gray-50 border-gray-200'
      }`}
    />
    {icon && (
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
    )}
  </div>
);