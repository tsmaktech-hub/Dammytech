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
    if (!gadget) return;
    
    const fullName = profile?.full_name || profile?.username || "Customer";
    
    // Professional and energetic pre-filled message
    const message = `*DAMMY TECH - DELIVERY INQUIRY* 🚀\n\n` +
      `*Customer Name:* ${fullName}\n` +
      `*Interested In:* ${gadget.name}\n\n` +
      `Hello! I'm really excited about this ${gadget.name} and I'd like to inquire about the delivery process. ` +
      `Can you please confirm the shipping time to my location? \n\n` +
      `Ready to join the revolution! ⚡📦`;

    const encodedMessage = encodeURIComponent(message);
    
    // Opening via WhatsApp API for better compatibility
    window.open(`https://wa.me/qr/4ZDPYBJ4QGWZM1?text=${encodedMessage}`, '_blank');
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
    <div className="max-w-5xl mx-auto py-4 lg:py-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-cyan-600 font-bold uppercase tracking-widest text-[8px] mb-4 group transition-colors px-4"
      >
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        Back to shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative group lg:sticky lg:top-32 h-fit lg:col-span-5"
        >
          <div className="aspect-[4/5] rounded-[1.25rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-lg shadow-gray-200/30">
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
          
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-cyan-600 text-[8px] font-black uppercase tracking-widest shadow-md border border-white/50">
              {gadget.category}
            </span>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5 lg:col-span-7"
        >
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 leading-tight">
              {gadget.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-cyan-50 rounded-md flex items-center gap-1.5">
                <Tag className="w-2.5 h-2.5 text-cyan-500" />
                <span className="text-cyan-700 font-black text-[8px] uppercase tracking-wider">Verified</span>
              </div>
              <div className="flex -space-x-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-4 h-4 rounded-full border border-white bg-gray-200" />
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Cpu className="w-12 h-12 text-gray-900" />
            </div>
            
            <div className="relative">
              <p className="text-[8px] font-black uppercase tracking-widest text-cyan-600 mb-0.5">Price Estimate</p>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter">
                ₦{gadget.price.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-3 h-3 text-gray-400" />
              <h3 className="text-[8px] font-black uppercase tracking-widest text-gray-900">Details</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              {gadget.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 py-4 border-y border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <div>
                <p className="text-[6px] font-black uppercase tracking-widest text-gray-400 leading-none">Warranty</p>
                <p className="text-[10px] font-bold text-gray-900">12 Months</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                <Truck className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <div>
                <p className="text-[6px] font-black uppercase tracking-widest text-gray-400 leading-none">Shipping</p>
                <p className="text-[10px] font-bold text-gray-900">Nationwide</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {order ? (
              <button
                onClick={handleUnorder}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-50 text-red-600 rounded-lg font-black uppercase tracking-widest text-[8px] hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100"
              >
                {actionLoading ? (
                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <X className="w-3 h-3" />
                    Unorder Product
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleOrder}
                disabled={actionLoading}
                className="flex-1 py-3.5 bg-gray-900 text-white rounded-lg font-black uppercase tracking-widest text-[8px] hover:bg-cyan-600 transition-all shadow-md shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3" />
                    Order Now
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleMessageDelivery}
              className="flex-1 py-3.5 bg-white text-gray-900 border border-gray-200 rounded-lg font-black uppercase tracking-widest text-[8px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3 h-3" />
              Message Delivery
            </button>
          </div>

          <div className="p-3.5 bg-blue-50/40 rounded-lg border border-blue-100/40 flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
              <Clock className="w-3 h-3" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-900 leading-tight">Delivers 24-48hrs</p>
              <p className="text-[8px] text-blue-700/60 font-medium whitespace-nowrap">Processed same day before 2PM.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
