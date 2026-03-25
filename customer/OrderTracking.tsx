
import React from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface OrderTrackingProps {
  order: Order;
  darkMode?: boolean;
}

// Add animated CSS for checkmark bouncing
const animationStyles = `
  @keyframes checkmark-bounce {
    0% {
      transform: scale(0) rotate(-45deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(10deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(22, 163, 74, 0);
    }
  }
  
  .checkmark-animated {
    animation: checkmark-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  .pulse-glow {
    animation: pulse-glow 1.5s infinite;
  }
`;

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order, darkMode }) => {
  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'ordered', label: 'Order Received' },
    { key: 'picked_up', label: 'Partner at Hub' },
    { key: 'in_transit', label: 'On the Way' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStatusIndex = steps.findIndex(s => s.key === order.status);

  return (
    <>
      <style>{animationStyles}</style>
      <div className={`p-6 rounded-[2rem] border transition-all bg-slate-50 border-slate-100`}>
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-black opacity-40">Status Update</h4>
          <span className={`text-[8px] font-black px-2 py-1 rounded uppercase bg-black text-white`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-0">
          {steps.map((step, index) => {
            const isCompleted = currentStatusIndex > index || (order.status === 'delivered' && index === 3);
            const isCurrent = order.status === step.key;
            
            const timestamp = order.timestamps?.[step.key];

            return (
              <div key={step.key} className="flex gap-4 min-h-[70px]">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white checkmark-animated' 
                      : isCurrent 
                      ? 'bg-black text-white pulse-glow' 
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-white" />
                    ) : (
                      <Circle size={12} fill={isCurrent ? 'currentColor' : 'transparent'} />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-1 flex-1 my-1 transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-gradient-to-b from-green-600 to-green-500' 
                        : 'bg-slate-300'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm font-black uppercase tracking-tight transition-all duration-300 ${
                        isCompleted 
                          ? 'text-green-600' 
                          : isCurrent
                          ? 'text-black'
                          : 'text-slate-400'
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && !isCompleted && (
                        <p className="text-[10px] text-orange-500 font-bold mt-1 animate-pulse">⏳ In Progress</p>
                      )}
                      {isCompleted && (
                        <p className="text-[10px] text-green-600 font-bold mt-1">✓ Completed</p>
                      )}
                    </div>
                    {timestamp && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock size={12} />
                        <span className="text-[10px] font-semibold">
                          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final delivery message */}
        {order.status === 'delivered' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <p className="text-sm font-black text-green-700">🎉 Order Delivered Successfully!</p>
            <p className="text-xs text-green-600 mt-1">Thank you for your order!</p>
          </div>
        )}
      </div>
    </>
  );
};
