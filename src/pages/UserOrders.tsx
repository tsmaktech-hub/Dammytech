import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Order } from '../types';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Package,
  Calendar,
  ChevronRight,
  Truck,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function UserOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'delivered'>('pending');

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Fetch all orders for this user
    const q = query(
      collection(db, 'orders'), 
      where('user_id', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      // Sort in memory to avoid index requirements
      ordersData.sort((a, b) => {
        const dateA = a.created_at?.toDate ? a.created_at.toDate().getTime() : 
                     (a.created_at ? new Date(a.created_at).getTime() : Date.now());
        const dateB = b.created_at?.toDate ? b.created_at.toDate().getTime() : 
                     (b.created_at ? new Date(b.created_at).getTime() : Date.now());
        return dateB - dateA;
      });

      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching user orders:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'pending') return o.status === 'ordered';
    return o.status === 'delivered';
  });

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Please Login</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Sign in to view your order history and track deliveries.</p>
        <Link to="/login" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-xl">
          Login Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Your Orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 lg:py-12 px-4">
      <div className="mb-10 sm:mb-16">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-gray-900 mb-4">
          My <span className="text-cyan-500">Orders</span>
        </h1>
        <p className="text-gray-500 font-medium text-sm sm:text-base">
          Track your purchases and view your order history here.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 font-medium mb-8">Ready to get some new gadgets? Start shopping now!</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-cyan-600 transition-all">
            Browse Store
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                "px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                activeTab === 'pending' ? "bg-white text-cyan-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Processing ({orders.filter(o => o.status === 'ordered').length})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={cn(
                "px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                activeTab === 'delivered' ? "bg-white text-cyan-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Completed ({orders.filter(o => o.status === 'delivered').length})
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-center">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No {activeTab === 'pending' ? 'active' : 'completed'} orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:shadow-gray-100 transition-all flex flex-col sm:flex-row gap-6 items-center"
                  >
                    {/* Image */}
                    <Link 
                      to={`/gadget/${order.gadget_id}`}
                      className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50"
                    >
                      <img 
                        src={order.gadget_image} 
                        alt={order.gadget_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          order.status === 'delivered' 
                            ? 'bg-green-50 text-green-600 border border-green-100' 
                            : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                        }`}>
                          {order.status === 'delivered' ? 'Completed & Delivered' : 'Processing Order'}
                        </span>
                        <div className="flex items-center gap-1 text-[8px] font-bold text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {order.created_at?.toDate ? order.created_at.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-cyan-600 transition-colors">
                        {order.gadget_name}
                      </h3>
                      <div className="flex items-center justify-center sm:justify-start gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                          <Clock className="w-3 h-3" />
                          {order.status === 'delivered' ? 'Delivered' : 'Est. Delivery: 24-48h'}
                        </div>
                      </div>
                    </div>

                    {/* Status Icon / Action */}
                    <div className="shrink-0 flex items-center gap-3">
                      {order.status === 'delivered' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" />
                          Successful
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
                          <Truck className="w-4 h-4 animate-bounce" />
                          In Transit
                        </div>
                      )}
                      <Link 
                        to={`/gadget/${order.gadget_id}`}
                        className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Trust Badge */}
      <div className="mt-12 p-6 bg-cyan-50/50 rounded-3xl border border-cyan-100/50 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
          <Truck className="w-6 h-6" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-black text-cyan-900 uppercase tracking-widest mb-1">Guaranteed Delivery</p>
          <p className="text-xs text-cyan-700/70 font-medium">All orders are tracked and verified by our admin team to ensure success.</p>
        </div>
      </div>
    </div>
  );
}
