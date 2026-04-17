import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Order } from '../types';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  User, 
  Cpu, 
  ChevronRight, 
  AlertCircle,
  Package,
  ArrowRight,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      if (!loading) navigate('/');
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'orders'), 
      where('status', '==', 'ordered')
      // Removed orderBy to avoid requiring a composite index which might be blocking server response on refresh
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Sort in memory to avoid index requirements
      ordersData.sort((a, b) => {
        const dateA = a.created_at?.toDate()?.getTime() || 0;
        const dateB = b.created_at?.toDate()?.getTime() || 0;
        return dateB - dateA;
      });

      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching orders:", err);
      // Still show the UI but with empty state or error if needed
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, navigate]); // Removed loading from dependencies to fix infinite loop

  const handleConfirmDelivery = async (orderId: string) => {
    if (!window.confirm('Confirm that this order has been delivered successfully? By clicking "Confirm", the customer will be able to order this item again.')) return;
    
    setActionLoading(orderId);
    try {
      // Update status to 'delivered'. In GadgetDetails.tsx, we specifically query for where status == 'ordered'.
      // When the status changes to 'delivered', that listener will return an empty list, 
      // which sets 'order' to null and changes the button back to "Order Now".
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivered',
        updated_at: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Delete this order record?')) return;
    setActionLoading(orderId);
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 lg:py-16 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 sm:mb-20">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-xl text-cyan-600 font-black text-[10px] uppercase tracking-widest border border-cyan-100">
            <ShieldCheck className="w-3 h-3" />
            Admin Control Center
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-gray-900 leading-none">
            Order <span className="text-cyan-500">Management</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-xl">
            Track and process customer orders in real-time. Confirm deliveries to keep the workflow moving.
          </p>
        </div>
        
        <div className="px-8 py-6 bg-gray-900 rounded-[2.5rem] text-white flex items-center gap-8 shadow-2xl shadow-gray-200">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-1">Total Active</p>
            <p className="text-3xl font-black leading-none">{orders.length}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <ShoppingBag className="w-8 h-8 text-cyan-500" />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No Active Orders</h3>
          <p className="text-gray-500 font-medium">When customers order gadgets, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col lg:flex-row gap-8 items-start lg:items-center"
              >
                {/* Gadget Image */}
                <div className="relative w-full lg:w-48 aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-50 shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src={order.gadget_image} 
                    alt={order.gadget_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-100">
                        {order.status}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        Ordered {new Date(order.created_at?.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none group-hover:text-cyan-600 transition-colors">
                      {order.gadget_name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-all">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <User className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Customer Name</p>
                        <p className="text-sm font-bold text-gray-900">{order.user_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-all">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <ExternalLink className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Reference ID</p>
                        <p className="text-[10px] font-mono font-bold text-gray-900 break-all">{order.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 self-stretch justify-center">
                  <button
                    onClick={() => handleConfirmDelivery(order.id)}
                    disabled={!!actionLoading}
                    className="flex-1 lg:flex-none px-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 group/btn whitespace-nowrap"
                  >
                    {actionLoading === order.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 group-hover/btn:scale-125 transition-transform" />
                        Confirm Delivery
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    disabled={!!actionLoading}
                    className="w-14 lg:w-full h-14 lg:h-auto flex items-center justify-center gap-3 px-0 lg:px-6 py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all border border-red-100"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span className="hidden lg:inline">Cancel Order</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
