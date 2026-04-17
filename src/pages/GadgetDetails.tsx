import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Gadget, Order } from '../types';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ShoppingCart, 
  MessageSquare, 
  Tag, 
  Cpu, 
  AlertCircle,
  Package,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function GadgetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [gadget, setGadget] = useState<Gadget | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    const fetchGadget = async () => {
      try {
        const docRef = doc(db, 'gadgets', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setGadget({ id: docSnap.id, ...docSnap.data() } as Gadget);
        } else {
          setError('Gadget not found');
        }
      } catch (err) {
        console.error("Error fetching gadget:", err);
        setError('Failed to load gadget details');
      } finally {
        setLoading(false);
      }
    };

    fetchGadget();

    // Listen to user's orders for this gadget
    let unsubscribeOrders = () => {};
    if (user) {
      const q = query(
        collection(db, 'orders'), 
        where('gadget_id', '==', id),
        where('user_id', '==', user.uid),
        where('status', '==', 'ordered')
      );
      
      unsubscribeOrders = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setOrder({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order);
        } else {
          setOrder(null);
        }
      }, (err) => {
        console.error("Error listening to orders:", err);
      });
    }

    return () => unsubscribeOrders();
  }, [id, user]);

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!gadget) return;

    if (!window.confirm(`Are you sure you want to order ${gadget.name}?`)) return;

    setActionLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        gadget_id: gadget.id,
        user_id: user.uid,
        user_name: profile?.full_name || profile?.username || 'Customer',
        gadget_name: gadget.name,
        gadget_image: gadget.image,
        status: 'ordered',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnorder = async () => {
    if (!order) return;

    if (!window.confirm('Are you sure you want to unorder this product?')) return;

    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'orders', order.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${order.id}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageDelivery = () => {
    alert("Messaging delivery personnel feature coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
          />
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-500" />
        </div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Details...</p>
      </div>
    );
  }

  if (error || !gadget) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Oops! {error}</h2>
        <p className="text-gray-500 mb-8 max-w-sm">We couldn't find the gadget you were looking for. It might have been removed or the link is broken.</p>
        <Link to="/" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-xl">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 lg:py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold uppercase tracking-widest text-[10px] mb-6 group transition-colors px-4"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 px-4">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative group lg:sticky lg:top-32 h-fit lg:col-span-5"
        >
          <div className="aspect-square rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-xl shadow-gray-200/50">
            <img 
              src={gadget.image} 
              alt={gadget.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
              }}
            />
          </div>
          
          <div className="absolute top-6 left-6">
            <span className="px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-xl text-cyan-600 text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/50">
              {gadget.category}
            </span>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8 lg:col-span-7"
        >
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-gray-900 leading-tight">
              {gadget.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 bg-cyan-50 rounded-lg flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-cyan-700 font-black text-[10px] uppercase tracking-wider">Certified Luxury</span>
              </div>
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200" />
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-white bg-cyan-500 flex items-center justify-center text-[8px] text-white font-black">
                  +12
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Cpu className="w-20 h-20 text-gray-900" />
            </div>
            
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600 mb-1">Price Estimate</p>
              <div className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">
                ₦{gadget.price.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-gray-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Product Details</h3>
            </div>
            <p className="text-gray-600 text-base leading-relaxed font-medium">
              {gadget.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Warranty</p>
                <p className="text-xs font-bold text-gray-900">12 Months Official</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Shipping</p>
                <p className="text-xs font-bold text-gray-900">Fast Nationwide</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {order ? (
              <button
                onClick={handleUnorder}
                disabled={actionLoading}
                className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-all flex items-center justify-center gap-3 border border-red-200"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Unorder Product
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleOrder}
                disabled={actionLoading}
                className="flex-1 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Order Now
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleMessageDelivery}
              className="flex-1 py-5 bg-white text-gray-900 border border-gray-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <MessageSquare className="w-4 h-4" />
              Message Delivery
            </button>
          </div>

          <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-center gap-4">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">Delivers in 24-48 hours</p>
              <p className="text-[10px] text-blue-700/60 font-medium">Orders placed before 2PM processed same day.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
