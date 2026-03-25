
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import api from './api';
import { 
  Product, Outlet, User, Order, Subscription, DeliveryPartner, 
  Role, PaymentMode, Review, Complaint, Category, OrderStatus, 
  HubInventory, Coupon, SystemSettings, SavedAddress 
} from './types';

interface AppState {
  user: User | null;
  activePortal: Role;
  selectedOutlet: Outlet | null;
  cart: { product: Product; quantity: number }[];
  orders: Order[];
  subscriptions: Subscription[];
  deliveryPartners: DeliveryPartner[];
  products: Product[];
  outlets: Outlet[];
  allUsers: User[];
  reviews: Review[];
  complaints: Complaint[];
  hubInventory: HubInventory[];
  coupons: Coupon[];
  systemSettings: SystemSettings;
  isAppOpen: boolean;
  aiInsights: string;
  isProcessingAI: boolean;
  currentDeliveryPartnerId: string | null;
  setActivePortal: (role: Role) => void;
  setUser: (user: User | null) => void;
  setSelectedOutlet: (outlet: Outlet | null) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (address: string, paymentMethod: PaymentMode, finalTotal?: number, wantsInvoice?: boolean) => Promise<Order | null>;
  addSubscription: (sub: any, totalToPay: number) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOutlet: (outlet: Omit<Outlet, 'id'>) => void;
  updateOutlet: (id: string, updates: Partial<Outlet>) => void;
  deleteOutlet: (id: string) => void;
  addDeliveryPartner: (partner: Omit<DeliveryPartner, 'id'>) => void;
  updatePartner: (id: string, updates: Partial<DeliveryPartner>) => void;
  deleteDeliveryPartner: (id: string) => void;
  updateHubStock: (hubId: string, productId: string, amount: number) => void;
  bulkUpdateHubStock: (hubId: string, stocks: { productId: string, stock: number }[]) => void;
  refreshHubInventory: () => Promise<void>;
  refreshDeliveryPartners: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  setIsAppOpen: (isOpen: boolean) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  updateUserStatus: (id: string, status: 'ACTIVE' | 'BLOCKED') => void;
  rechargeWallet: (amount: number) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt'>) => void;
  addSavedAddress: (addr: Omit<SavedAddress, 'id'>) => void;
  removeSavedAddress: (id: string) => void;
  logout: () => void;
  generateAdminAnalytics: () => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<User | null>;
  registerUser: (userData: any) => User;
  loginPartner: (phone: string, pass: string) => Promise<DeliveryPartner | null>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const useApp = () => {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp must be used within AppProvider');
  return c;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [user, setUserState] = useState<User | null>(() => {
    // Restore appropriate user from localStorage based on activePortal
    try {
      const saved = localStorage.getItem('geetha_user_CUSTOMER');
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error('Failed to restore user from localStorage:', err);
      return null;
    }
  });
  const [activePortal, setActivePortalState] = useState<Role>('CUSTOMER');
  const [products, setProducts] = useState<Product[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [hubInventory, setHubInventory] = useState<HubInventory[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isAppOpen, setIsAppOpenState] = useState<boolean>(true);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    deliveryCharge: 15,
    platformFee: 2,
    minOrderAmount: 100,
    subscriptionRules: "Auto-debit from wallet at 4 AM daily.",
    defaultSlots: ["6:00 AM - 8:00 AM", "8:00 AM - 10:00 AM"]
  });
  const [selectedOutlet, setSelectedOutletState] = useState<Outlet | null>(() => {
    try {
      const saved = localStorage.getItem('geetha_selected_outlet');
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error('Failed to restore outlet from localStorage:', err);
      return null;
    }
  });
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [currentDeliveryPartnerId, setCurrentDeliveryPartnerId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('geetha_delivery_partner_id');
    } catch {
      return null;
    }
  });

  // Persist selected outlet to localStorage whenever it changes
  useEffect(() => {
    if (selectedOutlet) {
      try {
        localStorage.setItem('geetha_selected_outlet', JSON.stringify(selectedOutlet));
        console.log(`✅ Outlet saved to localStorage: ${selectedOutlet.name}`);
      } catch (err) {
        console.error('Failed to save outlet to localStorage:', err);
      }
    } else {
      try {
        localStorage.removeItem('geetha_selected_outlet');
        console.log('✅ Outlet cleared from localStorage');
      } catch (err) {
        console.error('Failed to clear outlet from localStorage:', err);
      }
    }
  }, [selectedOutlet]);

  // Initialize data from backend on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [productsRes, hubsRes, inventoryRes, couponsRes, ordersRes, partnersRes] = await Promise.all([
          api.getProducts(),
          api.getHubs(),
          api.getHubInventory(''),
          api.getCoupons(),
          api.getOrders('', ''),
          api.getDeliveryPartners()
        ]);
        
        setProducts(Array.isArray(productsRes) ? productsRes : []);
        setOutlets(Array.isArray(hubsRes) ? hubsRes : []);
        setHubInventory(Array.isArray(inventoryRes) ? inventoryRes : []);
        setCoupons(Array.isArray(couponsRes) ? couponsRes : []);
        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        setDeliveryPartners(Array.isArray(partnersRes) ? partnersRes : []);
        console.log('✅ Orders loaded:', Array.isArray(ordersRes) ? ordersRes.length : 0);
        console.log('✅ Delivery Partners loaded:', Array.isArray(partnersRes) ? partnersRes.length : 0);
      } catch (error) {
        console.log('Initial data load - using fallback');
        // Fallback: server may not be running yet
      }
    };
    loadInitialData();
  }, []);

  // Reload orders when user changes
  useEffect(() => {
    if (user?.id) {
      const loadUserOrders = async () => {
        try {
          const ordersRes = await api.getOrders(user.id, '');
          setOrders(Array.isArray(ordersRes) ? ordersRes : []);
          console.log('✅ User orders loaded:', Array.isArray(ordersRes) ? ordersRes.length : 0);
        } catch (error) {
          console.log('Error loading user orders:', error);
        }
      };
      loadUserOrders();
    }
  }, [user?.id]);

  const setUser = (u: User | null) => {
    setUserState(u);
    // Persist user to localStorage per portal
    if (u) {
      const key = `geetha_user_${activePortal}`;
      localStorage.setItem(key, JSON.stringify(u));
      localStorage.setItem(`geetha_user_token_${activePortal}`, u.id);
      console.log(`✅ Saved ${activePortal} user:`, u.name);
    } else {
      const key = `geetha_user_${activePortal}`;
      localStorage.removeItem(key);
      localStorage.removeItem(`geetha_user_token_${activePortal}`);
      console.log(`✅ Cleared ${activePortal} user`);
    }
  };

  // Switch between portals while preserving user sessions
  const setActivePortal = (portal: Role) => {
    console.log(`🔄 Switching from ${activePortal} to ${portal}`);
    setActivePortalState(portal);
    
    // Load user for the new portal from localStorage
    try {
      const key = `geetha_user_${portal}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const portalUser = JSON.parse(saved);
        setUserState(portalUser);
        console.log(`✅ Loaded ${portal} user:`, portalUser.name);
      } else {
        setUserState(null);
        console.log(`ℹ️ No ${portal} user session found`);
      }
    } catch (err) {
      console.error(`Failed to load ${portal} user:`, err);
      setUserState(null);
    }
    
    // Reset portal-specific state
    setCart([]);
    setSelectedOutletState(null); // Reset outlet when switching portals
  };

  const logout = () => {
    console.log(`🚪 Logging out from ${activePortal}`);
    setUser(null);
    setCart([]);
    setSelectedOutletState(null); // Clear selected outlet on logout
    if (activePortal === 'DELIVERY_PARTNER') {
      setCurrentDeliveryPartnerId(null);
      localStorage.removeItem('geetha_delivery_partner_id');
    }
  };

  const placeOrder = async (address: string, method: PaymentMode, finalTotal?: number, wantsInvoice?: boolean) => {
    if (!isAppOpen) {
      alert("We are currently closed for new orders.");
      return null;
    }
    if (!user || !selectedOutlet || cart.length === 0) return null;
    const total = finalTotal || cart.reduce((s, i) => s + (i.product.price * i.quantity), 0);
    
    for (const item of cart) {
      const inv = hubInventory.find(h => h.hubId === selectedOutlet.id && h.productId === item.product.id);
      if (!inv || inv.stock < item.quantity) {
        alert(`Sorry, ${item.product.name} is out of stock at this hub.`);
        return null;
      }
    }

    // Generate invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceDate = new Date().toISOString();
    const taxes = Math.round(total * 0.05);
    const deliveryFee = 15;
    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      hubName: selectedOutlet.name,
      hubAddress: selectedOutlet.address,
      deliveryAddress: address,
      items: cart.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        subtotal: i.product.price * i.quantity
      })),
      subtotal: total,
      taxes,
      deliveryFee,
      total: total + taxes + deliveryFee,
      paymentMethod: method,
      status: 'PENDING'
    };

    // Find available delivery partner from the same hub
    const partnerForHub = deliveryPartners.find(dp => dp.hubId === selectedOutlet.id && dp.status === 'ACTIVE');
    
    if (!partnerForHub) {
      alert('No available delivery partners for this hub. Order will be placed but assignment pending.');
    }

    // Create order object with invoice
    const orderData = {
      userId: user.id,
      outletId: selectedOutlet.id,
      hubId: selectedOutlet.id,
      deliveryPartnerId: partnerForHub?.id,
      items: cart.map(i => ({ productId: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price })),
      deliveryAddress: address,
      paymentMethod: method,
      wantsInvoice: wantsInvoice || true,
      totalAmount: invoiceData.total,
      invoiceData: invoiceData,
      status: 'ordered',
      timestamps: {
        ordered: new Date().toISOString()
      }
    };

    try {
      const newOrder = await api.placeOrder(orderData);
      console.log('📦 Backend response:', newOrder);
      
      if (!newOrder) {
        throw new Error('No response from server');
      }
      
      // Handle both 'id' and '_id' fields
      const orderId = newOrder.id || newOrder._id;
      if (!orderId) {
        console.error('❌ Order has no ID field. Server Response:', newOrder);
        throw new Error('Invalid response: Order ID missing');
      }
      
      // Normalize the order object
      const normalizedOrder = {
        ...newOrder,
        id: orderId // Ensure id is always set
      };
      
      console.log('✅ Order placed successfully:', orderId);
      console.log('📍 Hub:', selectedOutlet.name);
      console.log('👥 Delivery Partner:', normalizedOrder.assignedDeliveryPartner || 'Will be assigned by admin');
      
      setOrders(prev => [{ ...normalizedOrder, invoiceData }, ...prev]);
      setCart([]);
      
      // Reload orders from server to get fresh data including delivery partner assignment
      try {
        const updatedOrders = await api.getOrders(user.id, '');
        setOrders(Array.isArray(updatedOrders) ? updatedOrders : [{ ...normalizedOrder, invoiceData }]);
      } catch (err) {
        console.log('Could not reload orders from server, using local state');
      }
      
      // Update inventory locally
      setHubInventory(prev => prev.map(inv => {
        const cartItem = cart.find(ci => ci.product.id === inv.productId && inv.hubId === selectedOutlet.id);
        return cartItem ? { ...inv, stock: inv.stock - cartItem.quantity } : inv;
      }));
      
      // Update wallet if needed
      if (method === 'WALLET') {
        const updatedUser = { ...user, walletBalance: user.walletBalance - invoiceData.total };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      }
      
      return normalizedOrder;
    } catch (error: any) {
      console.error('❌ Order placement failed:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  };

  const updateHubStock = (hubId: string, productId: string, amount: number) => {
    api.addStock({ hubId, productId, quantity: amount }).then((res: any) => {
      if (res && res.id) {
        setHubInventory(prev => {
          const exists = prev.find(i => i.hubId === hubId && i.productId === productId);
          if (exists) return prev.map(i => i.hubId === hubId && i.productId === productId ? { ...i, stock: Math.max(0, i.stock + amount) } : i);
          return [...prev, { hubId, productId, stock: Math.max(0, amount) }];
        });
        alert('✅ Stock updated successfully!');
      }
    }).catch((error: any) => {
      console.error('Stock update failed:', error);
      alert('❌ Failed to update stock. Make sure backend is running on port 5001');
    });
  };

  const rechargeWallet = (amount: number) => {
    if (!user) return;
    api.updateWallet(user.id, amount, 'ADD').then((res: any) => {
      if (res && res.walletBalance !== undefined) {
        const updatedUser = { ...user, walletBalance: res.walletBalance };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      }
    }).catch((error: any) => console.error('Wallet recharge failed:', error));
  };

  const addSavedAddress = (addr: Omit<SavedAddress, 'id'>) => {
    if (!user) return;
    api.addSavedAddress({ userId: user.id, address: (addr as any).address }).then((res: any) => {
      const newAddr = res;
      const updatedUser = { ...user, savedAddresses: [...(user.savedAddresses || []), newAddr] };
      setUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }).catch((error: any) => console.error('Address save failed:', error));
  };

  const removeSavedAddress = (id: string) => {
    if (!user) return;
    api.removeSavedAddress(id).then(() => {
      const updatedUser = { ...user, savedAddresses: (user.savedAddresses || []).filter(a => a.id !== id) };
      setUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }).catch((error: any) => console.error('Address removal failed:', error));
  };

  const addReview = (r: Omit<Review, 'id' | 'createdAt'>) => {
    setReviews(prev => [...prev, { ...r, id: `rev-${Date.now()}`, createdAt: new Date().toISOString() }]);
  };

  const addComplaint = (c: Omit<Complaint, 'id' | 'createdAt'>) => {
    const newComplaint = { ...c, id: `comp-${Date.now()}`, createdAt: new Date().toISOString(), status: 'PENDING' as const };
    api.addComplaint(c as any).then(() => {
      setComplaints(prev => [...prev, newComplaint]);
    }).catch((error: any) => console.error('Complaint creation failed:', error));
  };

  const deleteOutlet = (id: string) => {
    api.deleteHub(id).then(() => {
      setOutlets(prev => prev.filter(o => o.id !== id));
    }).catch((error: any) => console.error('Hub deletion failed:', error));
  };

  const generateAdminAnalytics = async () => {
    setIsProcessingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As an analyst for Sri Geetha Dairy, analyze these metrics: ${orders.length} orders, ${subscriptions.length} subscriptions. Provide 3 high-impact operational insights.`,
      });
      setAiInsights(response.text || "Operational performance is optimal.");
    } catch { 
      setAiInsights("Operational performance is optimal. Suggest increasing stock at Indiranagar Hub."); 
    }
    finally { setIsProcessingAI(false); }
  };

  return (
    <AppContext.Provider value={{
      user, activePortal, selectedOutlet, cart, orders, subscriptions, deliveryPartners, 
      products, outlets, allUsers, reviews, complaints, hubInventory, coupons, systemSettings, isAppOpen, aiInsights, isProcessingAI,
      currentDeliveryPartnerId,
      setActivePortal, setUser, setSelectedOutlet: setSelectedOutletState,
      addToCart: (p) => setCart(prev => {
        const ext = prev.find(i => i.product.id === p.id);
        return ext ? prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { product: p, quantity: 1 }];
      }),
      removeFromCart: (id) => setCart(prev => prev.filter(i => i.product.id !== id)),
      clearCart: () => setCart([]),
      placeOrder,
      addSubscription: (s, t) => {
        try {
          if (user && t > 0) {
            api.updateWallet(user.id, t, 'DEDUCT').then((res: any) => {
              console.log('💰 Wallet update response:', res);
              const updatedUser = res?.user || res;
              if (updatedUser && updatedUser.id) {
                setUserState(updatedUser);
                setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                localStorage.setItem('geetha_user_CUSTOMER', JSON.stringify(updatedUser));
              } else {
                console.error('❌ Invalid user response from wallet update');
              }
            }).catch((error: any) => {
              console.error('❌ Wallet deduction failed:', error);
              alert('⚠️ Wallet deduction failed. Subscription may not process correctly.');
            });
          }
          
          api.addSubscription(s).then((res: any) => {
            console.log('✅ Subscription created:', res);
            setSubscriptions(prev => [res, ...prev]);
          }).catch((error: any) => {
            console.error('❌ Subscription creation failed:', error);
            const sub: Subscription = { ...s, id: `SUB-${Date.now()}`, status: 'ACTIVE' };
            setSubscriptions(prev => [sub, ...prev]);
          });
          return true;
        } catch (error) {
          console.error('❌ Error in addSubscription:', error);
          return false;
        }
      },
      updateOrderStatus: (id, s) => {
        api.updateOrderStatus(id, s).then((res: any) => {
          setOrders(prev => prev.map(o => o.id === id ? res : o));
        }).catch((error: any) => {
          console.error('Order status update failed:', error);
          setOrders(prev => prev.map(o => o.id === id ? { 
            ...o, 
            status: s, 
            timestamps: { ...o.timestamps, [s]: new Date().toISOString() } 
          } : o));
        });
      },
      addProduct: (p) => {
        api.addProduct(p).then((res: any) => {
          if (res && res.id) {
            setProducts(prev => [...prev, res]);
            alert('✅ Product added successfully!');
          }
        }).catch((error: any) => {
          console.error('Product creation failed:', error);
          alert('❌ Failed to add product. Make sure backend is running on port 5001');
        });
      },
      updateProduct: (id, u) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...u } : p));
      },
      deleteProduct: (id) => {
        api.deleteProduct(id).then(() => {
          setProducts(prev => prev.filter(p => p.id !== id));
        }).catch((error: any) => console.error('Product deletion failed:', error));
      },
      addOutlet: (o) => {
        api.addHub(o).then((res: any) => {
          if (res && res.id) {
            setOutlets(prev => [...prev, res]);
            alert('✅ Hub added successfully!');
          }
        }).catch((error: any) => {
          console.error('Hub creation failed:', error);
          alert('❌ Failed to add hub. Make sure backend is running on port 5001');
        });
      },
      updateOutlet: (id, u) => {
        setOutlets(prev => prev.map(o => o.id === id ? { ...o, ...u } : o));
      },
      deleteOutlet,
      addDeliveryPartner: (d) => {
        api.addDeliveryPartner(d).then((res: any) => {
          if (res && res.id) {
            setDeliveryPartners(prev => [...prev, res]);
            alert('✅ Delivery partner created successfully! Username: ' + res.username);
          }
        }).catch((error: any) => {
          console.error('Delivery partner creation failed:', error);
          alert('❌ Failed to create delivery partner. ' + (error.error || ''));
        });
      },
      updatePartner: (id, u) => {
        api.updateDeliveryPartner(id, u).then((res: any) => {
          setDeliveryPartners(prev => prev.map(p => p.id === id ? res : p));
        }).catch((error: any) => console.error('Delivery partner update failed:', error));
      },
      deleteDeliveryPartner: (id) => {
        api.deleteDeliveryPartner(id).then(() => {
          setDeliveryPartners(prev => prev.filter(p => p.id !== id));
          alert('✅ Delivery partner deleted successfully');
        }).catch((error: any) => {
          console.error('Delivery partner deletion failed:', error);
          alert('❌ Failed to delete delivery partner');
        });
      },
      updateHubStock,
      bulkUpdateHubStock: (hubId, stocks) => {
        stocks.forEach(s => {
          api.updateStock(s.productId, s.stock).then(() => {
            setHubInventory(prev => {
              const exists = prev.find(i => i.hubId === hubId && i.productId === s.productId);
              if (exists) return prev.map(i => i.hubId === hubId && i.productId === s.productId ? { ...i, stock: s.stock } : i);
              return [...prev, { hubId, productId: s.productId, stock: s.stock }];
            });
          }).catch((error: any) => console.error('Stock update failed:', error));
        });
      },
      refreshHubInventory: async () => {
        try {
          const inventoryRes = await api.getHubInventory('');
          setHubInventory(Array.isArray(inventoryRes) ? inventoryRes : []);
          console.log('✅ Hub inventory refreshed');
        } catch (error: any) {
          console.error('Failed to refresh inventory:', error);
        }
      },
      refreshDeliveryPartners: async () => {
        try {
          const partnersRes = await api.getDeliveryPartners();
          setDeliveryPartners(Array.isArray(partnersRes) ? partnersRes : []);
          console.log('✅ Delivery partners refreshed');
        } catch (error: any) {
          console.error('Failed to refresh delivery partners:', error);
        }
      },
      refreshOrders: async () => {
        try {
          const ordersRes = await api.getOrders('', '');
          setOrders(Array.isArray(ordersRes) ? ordersRes : []);
          console.log('🔄 Orders refreshed from backend:', Array.isArray(ordersRes) ? ordersRes.length : 0);
        } catch (error: any) {
          console.error('Failed to refresh orders:', error);
        }
      },
      addCoupon: (c) => {
        api.addCoupon(c).then((res: any) => {
          if (res && res.id) {
            setCoupons(prev => [...prev, res]);
            alert('✅ Coupon added successfully!');
          }
        }).catch((error: any) => {
          console.error('Coupon creation failed:', error);
          alert('❌ Failed to add coupon. Make sure backend is running on port 5001');
        });
      },
      updateCoupon: (id, u) => setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...u } : c)),
      updateSystemSettings: (s) => setSystemSettings(prev => ({ ...prev, ...s })),
      setIsAppOpen: (isOpen) => setIsAppOpenState(isOpen),
      updateComplaint: (id, u) => {
        api.updateComplaintStatus(id, u.status || 'PENDING').then((res: any) => {
          setComplaints(prev => prev.map(c => c.id === id ? res : c));
        }).catch((error: any) => {
          console.error('Complaint update failed:', error);
          setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...u } : c));
        });
      },
      updateUserStatus: (id, s) => setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status: s } : u)),
      rechargeWallet,
      addReview,
      addComplaint,
      addSavedAddress,
      removeSavedAddress,
      logout,
      generateAdminAnalytics,
      loginUser: async (e, p) => {
        try {
          if (!e || !p) {
            throw new Error('Email and password are required');
          }
          const res = await api.login({ email: e, password: p });
          if (res && res.user) {
            // Determine portal based on user role
            const portal = res.user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
            setActivePortalState(portal);
            
            setUser(res.user); // Use setUser to persist to localStorage with portal-specific key
            setAllUsers(prev => {
              const exists = prev.find(u => u.id === res.user.id);
              return exists ? prev.map(u => u.id === res.user.id ? res.user : u) : [...prev, res.user];
            });
            console.log(`✅ ${portal} user logged in:`, res.user.name);
            return res.user;
          }
          throw new Error('No user data in response');
        } catch (error: any) {
          console.error('❌ Login failed:', error);
          throw error;
        }
      },
      registerUser: async (u) => {
        try {
          const res = await api.register(u);
          if (res && res.user) {
            setUser(res.user); // Use setUser to persist to localStorage
            setAllUsers(prev => [...prev, res.user]);
            return res.user;
          } else {
            console.error('Registration failed: No user in response', res);
            throw new Error('Registration failed: Invalid response');
          }
        } catch (error: any) {
          console.error('❌ Registration failed:', error);
          alert(`Registration Error: ${error.message || 'Unknown error'}`);
          throw error;
        }
      },
      loginPartner: async (phone, pass) => {
        try {
          const response = await api.loginDeliveryPartner({ phone, password: pass });
          if (response && response.partner && response.partner.id) {
            setCurrentDeliveryPartnerId(response.partner.id);
            localStorage.setItem('geetha_delivery_partner_id', response.partner.id);
            
            // Switch to DELIVERY_PARTNER portal
            setActivePortalState('DELIVERY');
            
            // Set user state with DELIVERY role so the app can render DeliveryPortal
            const deliveryUser: User = {
              id: response.partner.id,
              name: response.partner.name,
              email: response.partner.email || '',
              phone: response.partner.phone,
              walletBalance: 0,
              role: 'DELIVERY',
              status: 'ACTIVE'
            };
            setUser(deliveryUser);
            console.log('✅ Delivery partner logged in:', response.partner.name);
            return response.partner as DeliveryPartner;
          }
          return null;
        } catch (error) {
          console.error('❌ Delivery partner login failed:', error);
          return null;
        }
      }
    }}
    >
      {children}
    </AppContext.Provider>
  );
};
