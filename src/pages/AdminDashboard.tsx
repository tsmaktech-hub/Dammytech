import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Order } from '../types';
import { useAuth } from '../lib/AuthContext';
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
  Trash2,
  Edit2,
  Plus,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { Gadget } from '../types';

export default function AdminDashboard() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'pending' | 'delivered' | 'inventory'>('pending');

  useEffect(() => {
    // Stop loading if we've checked isAdmin and it's false
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch ALL orders so admin can see history and current orders
    const q = query(collection(db, 'orders'));
    
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Sort in memory to avoid index requirements
      ordersData.sort((a, b) => {
        // Handle potential null/pending timestamps gracefully
        const dateA = a.created_at?.toDate ? a.created_at.toDate().getTime() : 
                     (a.created_at ? new Date(a.created_at).getTime() : Date.now());
        const dateB = b.created_at?.toDate ? b.created_at.toDate().getTime() : 
                     (b.created_at ? new Date(b.created_at).getTime() : Date.now());
        return dateB - dateA;
      });

      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching orders:", err);
      // Ensure we stop loading even on error
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || activeTab !== 'inventory') return;

    setLoading(true);
    const q = query(collection(db, 'gadgets'), orderBy('created_at', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gadgetsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Gadget[];
      setGadgets(gadgetsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching gadgets:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, activeTab]);

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'pending') return o.status === 'ordered';
    return o.status === 'delivered';
  });

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

  const handleDeleteGadget = async (gadgetId: string) => {
    if (!window.confirm('Are you sure you want to delete this gadget matching? This cannot be undone.')) return;
    setActionLoading(gadgetId);
    try {
      await deleteDoc(doc(db, 'gadgets', gadgetId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gadgets/${gadgetId}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditGadget = (gadget: Gadget) => {
    navigate('/', { state: { editingGadget: gadget, openAddModal: true } });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-8 max-w-sm">This area is reserved for administrators only. Use your admin credentials to proceed.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-cyan-600 transition-all shadow-xl"
        >
          Return Home
        </button>
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
            Track and process all user orders in real-time. Manage deliveries and store performance.
          </p>
        </div>
        
        <div className="px-8 py-6 bg-gray-900 rounded-[2.5rem] text-white flex items-center gap-8 shadow-2xl shadow-gray-200">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-1">Total Orders</p>
            <p className="text-3xl font-black leading-none">{orders.length}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <ShoppingBag className="w-8 h-8 text-cyan-500" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
            activeTab === 'pending' ? "bg-white text-cyan-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
          )}
        >
          Active Orders ({orders.filter(o => o.status === 'ordered').length})
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
            activeTab === 'delivered' ? "bg-white text-cyan-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
          )}
        >
          Success Delivery ({orders.filter(o => o.status === 'delivered').length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
            activeTab === 'inventory' ? "bg-white text-cyan-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
          )}
        >
          Inventory ({gadgets.length})
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="mb-8">
           <button 
             onClick={() => navigate('/', { state: { openAddModal: true } })}
             className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-cyan-600 transition-all shadow-lg"
           >
             <Plus className="w-4 h-4" />
             List New Gadget
           </button>
        </div>
      )}

      {activeTab === 'inventory' ? (
        gadgets.length === 0 ? (
          <div className="p-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl text-gray-300">
              <Cpu className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Inventory is empty</h3>
            <p className="text-gray-500 font-medium tracking-tight">You haven't listed any gadgets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gadgets.map((gadget, i) => (
              <motion.div
                key={gadget.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                  <img 
                    src={gadget.image} 
                    alt={gadget.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-cyan-600 text-[8px] font-black uppercase tracking-widest shadow-sm">
                      {gadget.category}
                    </span>
                  </div>
                  
                  {/* ADMIN ACTIONS - VISIBLE ON MOBILE */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleEditGadget(gadget)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all shadow-lg border border-white/20"
                      title="Edit Gadget"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGadget(gadget.id)}
                      disabled={actionLoading === gadget.id}
                      className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-lg border border-white/20"
                      title="Delete Gadget"
                    >
                      {actionLoading === gadget.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none line-clamp-1">{gadget.name}</h3>
                    <p className="text-lg font-black text-cyan-600">₦{gadget.price.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                    {gadget.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(gadget.created_at?.toDate()).toLocaleDateString()}
                    </span>
                    <Link to={`/gadget/${gadget.id}`} className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-cyan-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : filteredOrders.length === 0 ? (
        <div className="p-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No {activeTab} orders</h3>
          <p className="text-gray-500 font-medium">Any orders matching this status will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, i) => (
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
                       <span className={cn(
                         "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                         order.status === 'delivered' ? "bg-green-50 text-green-600 border-green-100" : "bg-cyan-50 text-cyan-600 border-cyan-100"
                       )}>
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
                  {order.status === 'ordered' && (
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
                  )}
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    disabled={!!actionLoading}
                    className={cn(
                      "w-14 lg:w-full h-14 lg:h-auto flex items-center justify-center gap-3 px-0 lg:px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border",
                      order.status === 'ordered' ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white" : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span className="hidden lg:inline">{order.status === 'ordered' ? 'Cancel Order' : 'Delete Log'}</span>
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

