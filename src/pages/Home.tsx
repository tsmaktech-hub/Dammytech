import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { db, auth, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Gadget, UserProfile } from '../types';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Tag, 
  Image as ImageIcon, 
  X, 
  AlertCircle, 
  ArrowRight,
  Filter,
  ChevronRight,
  Star,
  Zap,
  ShieldCheck,
  Truck,
  Headphones,
  RefreshCcw,
  Search,
  Edit2,
  Link as LinkIcon,
  Upload,
  LogIn
} from 'lucide-react';
import { cn } from '../lib/utils';

const AnimatedCounter = ({ 
  value, 
  suffix = '', 
  duration = 2,
  incrementPerSecond = 0
}: { 
  value: number; 
  suffix?: string; 
  duration?: number;
  incrementPerSecond?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = (totalMiliseconds / end) > 10 ? (totalMiliseconds / end) : 10;
    
    let timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
        
        // Start slow incrementing if requested
        if (incrementPerSecond > 0) {
          const slowTimer = setInterval(() => {
            setDisplayValue(prev => prev + 1);
          }, 1000 / incrementPerSecond);
          return () => clearInterval(slowTimer);
        }
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration, incrementPerSecond]);

  return (
    <span>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

const AddGadgetModal = ({ 
  isOpen, 
  onClose, 
  gadget = null 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  gadget?: Gadget | null;
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'phones',
    imageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gadget) {
      setFormData({
        name: gadget.name,
        description: gadget.description,
        price: gadget.price.toString(),
        category: gadget.category,
        imageUrl: gadget.image,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'phones',
        imageUrl: '',
      });
    }
  }, [gadget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.imageUrl && !selectedFile) return setError('Please provide an image link or upload a file');
    setError('');
    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Handle file upload if a file is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const storageRef = ref(storage, `gadgets/${fileName}`);
        
        const snapshot = await uploadBytes(storageRef, selectedFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const gadgetRef = collection(db, 'gadgets');
      
      if (gadget) {
        const docRef = doc(db, 'gadgets', gadget.id);
        await updateDoc(docRef, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: finalImageUrl,
          updated_at: serverTimestamp(),
        });
      } else {
        await addDoc(gadgetRef, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: finalImageUrl,
          author: user.uid,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
      }

      onClose();
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Error saving gadget:", err);
      setError(err.message || 'Failed to save gadget');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 my-auto"
      >
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-200">
              {gadget ? <Edit2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            </div>
            {gadget ? 'Edit Gadget' : 'List New Gadget'}
          </h2>
          <button onClick={onClose} className="p-2 sm:p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 sm:space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-center gap-3 font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Gadget Name</label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold"
                placeholder="e.g. iPhone 15 Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Category</label>
              <select
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="phones">Phones</option>
                <option value="laptops">Laptops</option>
                <option value="watches">Watches</option>
                <option value="audio">Audio</option>
                <option value="components">Components</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Price (₦)</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                required
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold"
                placeholder="50,000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Gadget Image</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setFormData({ ...formData, imageUrl: '' }); // Clear URL if file is selected
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                      selectedFile 
                        ? "border-cyan-500 bg-cyan-50 text-cyan-600" 
                        : "border-gray-200 bg-gray-50 text-gray-400 hover:border-cyan-500 hover:bg-cyan-50/50 hover:text-cyan-500"
                    )}
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {selectedFile ? selectedFile.name : 'Upload Image'}
                    </span>
                  </label>
                </div>

                {/* URL Input */}
                <div className="relative group">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type="url"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold text-sm h-full"
                    placeholder="Or paste image link"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setSelectedFile(null); // Clear file if URL is entered
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {(formData.imageUrl || selectedFile || gadget?.image) && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                <img 
                  src={selectedFile ? URL.createObjectURL(selectedFile) : (formData.imageUrl || gadget?.image || '')} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Image Preview</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all resize-none font-semibold"
              placeholder="Describe the features and condition..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-2xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                gadget ? 'Update Gadget' : 'Publish Listing'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function Home({ 
  searchQuery = '', 
  setSearchQuery = () => {} 
}: { 
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin } = useAuth();
  const { category } = useParams();
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGadget, setEditingGadget] = useState<Gadget | null>(null);
  const [userTestimonials, setUserTestimonials] = useState<any[]>([]);
  const [isTestimonialSubmitting, setIsTestimonialSubmitting] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ text: '', rating: 5 });

  const isAuthorizedSeller = profile?.username?.toLowerCase() === 'dammy' || 
                             profile?.email === 'ibusari127@gmail.com';

  const scrollToCollection = () => {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleListGadget = () => {
    if (user) {
      if (!isAuthorizedSeller) {
        alert("Only authorized sellers can list gadgets.");
        return;
      }
      setIsModalOpen(true);
    } else {
      navigate('/auth');
    }
  };

  const filteredGadgets = gadgets.filter(gadget => 
    gadget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gadget.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Handle state passed from navigation (e.g., from Dashboard)
    if (location.state) {
      const { openAddModal, editingGadget: stateGadget } = location.state as any;
      if (openAddModal) {
        setIsModalOpen(true);
      }
      if (stateGadget) {
        setEditingGadget(stateGadget);
        setIsModalOpen(true);
      }
      // Clear state after handling
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    setLoading(true);
    
    let q = query(collection(db, 'gadgets'), orderBy('created_at', 'desc'));
    
    if (category) {
      q = query(collection(db, 'gadgets'), where('category', '==', category), orderBy('created_at', 'desc'));
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const gadgetList: any[] = [];
      
      for (const docSnap of snapshot.docs) {
        const gadget = { id: docSnap.id, ...docSnap.data() } as any;
        
        // Fetch author profile
        try {
          const authorRef = doc(db, 'users', gadget.author);
          const authorSnap = await getDoc(authorRef);
          if (authorSnap.exists()) {
            gadget.expand = { author: authorSnap.data() as UserProfile };
          }
        } catch (e) {
          console.warn("Could not fetch author profile for gadget:", gadget.id);
        }
        
        gadgetList.push(gadget);
      }
      
      // Limit for guests
      let finalGadgets = gadgetList;
      if (!user) {
        if (category) {
          finalGadgets = gadgetList.slice(0, 3);
        } else {
          // 3 for EACH category when viewing "All"
          const cats = ['phones', 'laptops', 'watches', 'audio', 'components'];
          const grouped: any[] = [];
          cats.forEach(c => {
            const items = gadgetList.filter(g => g.category === c).slice(0, 3);
            grouped.push(...items);
          });
          // Sort back by date
          finalGadgets = grouped.sort((a, b) => b.created_at?.toMillis?.() - a.created_at?.toMillis?.());
          
          // If no categories matched or it was empty, just take first 10 as fallback if they exist
          if (finalGadgets.length === 0 && gadgetList.length > 0) {
            finalGadgets = gadgetList.slice(0, 5);
          }
        }
      }
      
      setGadgets(finalGadgets);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gadgets');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [category, user]);

  useEffect(() => {
    const tQuery = query(collection(db, 'testimonials'), orderBy('created_at', 'desc'));
    const unsubscribeT = onSnapshot(tQuery, (snapshot) => {
      const tList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setUserTestimonials(tList);
    });
    return () => unsubscribeT();
  }, []);

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newTestimonial.text.trim()) return;

    setIsTestimonialSubmitting(true);
    try {
      await addDoc(collection(db, 'testimonials'), {
        user_id: user.uid,
        name: profile?.full_name || profile?.username || 'Valued Customer',
        text: newTestimonial.text,
        rating: newTestimonial.rating,
        avatar: (profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U').toUpperCase(),
        role: profile?.role === 'admin' ? 'Premium Member' : 'Tech Enthusiast',
        created_at: serverTimestamp(),
      });
      setNewTestimonial({ text: '', rating: 5 });
      alert("Thank you for your feedback! Your voice has been added to the future.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'testimonials');
    } finally {
      setIsTestimonialSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this gadget?')) return;
    try {
      const docRef = doc(db, 'gadgets', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gadgets/${id}`);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-[400px] sm:min-h-[600px] rounded-2xl sm:rounded-[3rem] overflow-hidden bg-gray-950 flex items-center px-4 sm:px-20 py-12 sm:py-0">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
        </div>
        
        <div className="relative z-10 w-full text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[8px] sm:text-xs font-black uppercase tracking-[0.2em] mb-4 sm:mb-8"
          >
            <Zap className="w-2.5 h-2.5 sm:w-4 sm:h-4 fill-cyan-400" />
            Next Gen Tech Store
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-8xl font-black text-white leading-[1.1] sm:leading-[0.9] tracking-tighter mb-4 sm:mb-8"
          >
            UPGRADE YOUR <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              DIGITAL LIFE
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto sm:mx-0 leading-relaxed font-medium"
          >
            The most advanced marketplace for futuristic gadgets. From neural-link headsets to quantum laptops.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-6"
          >
            <button 
              onClick={scrollToCollection}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-10 sm:py-5 bg-cyan-500 text-white rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-cyan-400 transition-all shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-2 sm:gap-3 group"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {isAuthorizedSeller && (
                <button 
                  onClick={handleListGadget}
                  className="w-full sm:w-auto px-6 py-3.5 sm:px-10 sm:py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2 sm:gap-3"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  List a Gadget
                </button>
              )}
              {isAdmin && (
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all user data and gadgets? This action cannot be undone.')) {
                      alert('Please use the Firebase Console to manage your data.');
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 sm:px-10 sm:py-5 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-400 rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 sm:gap-3"
                >
                  <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  Reset App Data
                </button>
              )}
            </div>
          </motion.div>

          {/* Mobile Stats */}
          <div className="grid grid-cols-2 gap-2 mt-8 sm:hidden">
            {[
              { label: 'Users', val: 2123, suffix: '+', icon: Star, inc: 0.05 },
              { label: 'Sold', val: 6345, suffix: '+', icon: ShoppingCart, inc: 0.1 },
              { label: 'Countries', val: 12, suffix: '+', icon: ShieldCheck, inc: 0 },
              { label: 'Delivery', val: 24, suffix: 'H', icon: Truck, inc: 0 },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl flex items-center gap-3"
              >
                <stat.icon className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] font-black text-white leading-none mb-0.5">
                    <AnimatedCounter value={stat.val} suffix={stat.suffix} incrementPerSecond={stat.inc} />
                  </div>
                  <div className="text-[7px] font-bold text-gray-500 uppercase tracking-widest leading-none">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Stats Desktop */}
        <div className="absolute right-20 bottom-20 hidden xl:grid grid-cols-2 gap-6">
          {[
            { label: 'Active Users', val: 2123, suffix: '+', icon: Star, inc: 0.05 },
            { label: 'Gadgets Sold', val: 6345, suffix: '+', icon: ShoppingCart, inc: 0.1 },
            { label: 'Countries', val: 12, suffix: '+', icon: ShieldCheck, inc: 0 },
            { label: 'Fast Delivery', val: 24, suffix: 'H', icon: Truck, inc: 0 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] min-w-[180px]"
            >
              <stat.icon className="w-6 h-6 text-cyan-400 mb-4" />
              <div className="text-2xl font-black text-white mb-1">
                <AnimatedCounter value={stat.val} suffix={stat.suffix} incrementPerSecond={stat.inc} />
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section id="collection">
        {/* Search Bar in Gadgets Section */}
        <div className="mb-8 sm:mb-12 max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              placeholder="Search gadgets by name or description..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white transition-all text-sm font-semibold shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 sm:gap-8 mb-8 sm:mb-16">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-cyan-600 font-black uppercase tracking-widest text-[8px] sm:text-xs mb-2 sm:mb-3">
              <div className="w-4 sm:w-8 h-[2px] bg-cyan-600" />
              Our Inventory
            </div>
            <h2 className="text-xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection` : 'All Gadgets'}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gray-50 rounded-lg sm:rounded-2xl text-[8px] sm:text-sm font-bold text-gray-500 border border-gray-100">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              Sort: Newest
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-cyan-50 rounded-lg sm:rounded-2xl text-[8px] sm:text-sm font-bold text-cyan-600 border border-cyan-100">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              {gadgets.length} Items
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse space-y-3 sm:space-y-6">
                <div className="aspect-[4/5] bg-gray-100 rounded-2xl sm:rounded-[2.5rem]" />
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-4 sm:h-6 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 sm:h-4 bg-gray-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : gadgets.length === 0 ? (
          <div className="text-center py-12 sm:py-32 bg-gray-50 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-gray-200 px-4 sm:px-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-gray-200/50">
              <ShoppingCart className="w-6 h-6 sm:w-10 sm:h-10 text-gray-300" />
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3">No gadgets found</h3>
            <p className="text-xs sm:text-gray-500 font-medium max-w-xs mx-auto mb-6 sm:mb-10">
              We couldn't find any gadgets in this category. {isAuthorizedSeller ? 'Be the first to list one!' : 'Check back later for new arrivals, or check your internet connection.'}
            </p>
            {isAuthorizedSeller && (
              <button 
                onClick={handleListGadget}
                className="w-full sm:w-auto px-8 py-3 sm:px-10 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-cyan-600 transition-all shadow-2xl shadow-gray-200"
              >
                Start Selling
              </button>
            )}
          </div>
        ) : filteredGadgets.length === 0 ? (
          <div className="text-center py-12 sm:py-32 bg-gray-50 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-gray-200 px-4 sm:px-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-gray-200/50">
              <Search className="w-6 h-6 sm:w-10 sm:h-10 text-gray-300" />
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3">No matches found</h3>
            <p className="text-xs sm:text-gray-500 font-medium max-w-xs mx-auto mb-6 sm:mb-10">
              We couldn't find any gadgets matching "{searchQuery}". Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-10">
            <AnimatePresence mode="popLayout">
              {filteredGadgets.map((gadget) => (
                <motion.div
                  key={gadget.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white rounded-2xl sm:rounded-[2.5rem] p-2 sm:p-4 border border-gray-100 hover:border-cyan-500/20 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all duration-500"
                >
                  <div className="relative aspect-[4/5] rounded-xl sm:rounded-[2rem] overflow-hidden bg-gray-50 mb-3 sm:mb-6 group/img">
                    <Link 
                      to={`/gadget/${gadget.id}`}
                      className="block w-full h-full"
                    >
                      <img
                        src={gadget.image}
                        alt={gadget.name}
                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                    </Link>
                    
                    {/* Overlay Actions (Desktop) - Outside Link */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center gap-3 pointer-events-none">
                      <Link 
                        to={`/gadget/${gadget.id}`}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:bg-cyan-500 hover:text-white transition-all shadow-xl pointer-events-auto cursor-pointer"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </Link>
                      {(user?.uid === gadget.author || isAdmin) && (
                        <div className="flex gap-3 pointer-events-auto">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingGadget(gadget);
                              setIsModalOpen(true);
                            }}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all shadow-xl"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(gadget.id);
                            }}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Mobile Actions (Always visible or easily accessible) - Outside Link */}
                    <div className="absolute bottom-2 right-2 flex sm:hidden gap-1.5 z-10">
                      {(user?.uid === gadget.author || isAdmin) && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingGadget(gadget);
                              setIsModalOpen(true);
                            }}
                            className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center text-cyan-600 shadow-lg border border-white/20"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(gadget.id);
                            }}
                            className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center text-red-500 shadow-lg border border-white/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <Link 
                        to={`/gadget/${gadget.id}`}
                        className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-lg cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 pointer-events-none">
                      <span className="px-2 sm:px-4 py-1 sm:py-2 bg-white/90 backdrop-blur-md text-gray-900 text-[8px] sm:text-xs font-black uppercase tracking-widest rounded-md sm:rounded-xl shadow-lg border border-white/20">
                        {gadget.category}
                      </span>
                    </div>
                  </div>

                  <div className="px-1 sm:px-2 pb-1 sm:pb-2">
                    <Link to={`/gadget/${gadget.id}`} className="flex justify-between items-start mb-1 sm:mb-3">
                      <h3 className="text-sm sm:text-xl font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-cyan-600 transition-colors">
                        {gadget.name}
                      </h3>
                      <span className="text-sm sm:text-xl font-black text-cyan-600">
                        ₦{gadget.price.toLocaleString()}
                      </span>
                    </Link>
                    <p className="text-gray-500 text-[10px] sm:text-sm font-medium line-clamp-2 mb-3 sm:mb-6 leading-relaxed">
                      {gadget.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-5 h-5 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center text-[6px] sm:text-[10px] font-black text-gray-400">
                          {gadget.expand?.author?.role === 'admin' ? 'BI' : (gadget.expand?.author?.full_name?.charAt(0) || 'U')}
                        </div>
                        <span className="text-[6px] sm:text-[10px] font-bold text-cyan-600 uppercase tracking-widest">
                          {gadget.expand?.author?.role === 'admin' ? 'Admin' : (gadget.expand?.author?.username || 'Anonymous')}
                        </span>
                      </div>
                      <Link to={`/gadget/${gadget.id}`} className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-cyan-600 flex items-center gap-0.5 sm:gap-1 group/btn">
                        Details
                        <ChevronRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* View More for Guests */}
        {!user && gadgets.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-20 p-8 sm:p-16 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-gray-900 to-gray-800 text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.15),transparent)] pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-cyan-400 text-[8px] sm:text-xs font-black uppercase tracking-widest">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-cyan-400" />
                Exclusive Collection Locked
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white mb-4 sm:mb-6 tracking-tight">
                Want to see all {category ? category : 'our'} gadgets?
              </h3>
              <p className="text-gray-400 font-medium text-sm sm:text-lg mb-8 sm:mb-12 max-w-xl mx-auto leading-relaxed">
                We're hiding our full inventory from guests. Sign in to your account to unlock all premium gadgets and start ordering.
              </p>
              <Link 
                to="/auth" 
                className="inline-flex items-center gap-3 px-8 py-4 sm:px-12 sm:py-6 bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 group"
              >
                Sign In to Unlock Everything
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}
      </section>

      <AddGadgetModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingGadget(null);
        }} 
        gadget={editingGadget}
      />

      {/* Why Choose Us Section */}
      <section className="py-20 sm:py-32 bg-gray-50 rounded-[2rem] sm:rounded-[4rem] px-6 sm:px-20">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 text-cyan-600 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-4">
            <div className="w-8 h-[2px] bg-cyan-600" />
            The Dammytech Edge
          </div>
          <h2 className="text-3xl sm:text-6xl font-black text-gray-900 tracking-tighter mb-6">
            WHY THE FUTURE <br /> CHOOSES US
          </h2>
          <p className="text-gray-500 font-medium text-sm sm:text-lg leading-relaxed">
            We don't just sell gadgets; we curate the building blocks of tomorrow. Join thousands of tech enthusiasts who trust us for their digital evolution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          {[
            {
              title: "CURATED EXCELLENCE",
              desc: "Every gadget in our store undergoes rigorous testing for performance, durability, and 'wow' factor.",
              icon: ShieldCheck,
              color: "bg-blue-500"
            },
            {
              title: "LIGHTSPEED DELIVERY",
              desc: "Our global logistics network ensures your tech reaches you faster than a fiber-optic pulse.",
              icon: Zap,
              color: "bg-cyan-500"
            },
            {
              title: "FUTURE-PROOF SUPPORT",
              desc: "24/7 technical assistance from experts who live and breathe high-end technology.",
              icon: Headphones,
              color: "bg-indigo-500"
            }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-8 sm:p-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-all duration-500 group",
                i === 2 && "sm:col-span-2 lg:col-span-1"
              )}
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform", item.color)}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">{item.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-24 items-center">
        <div className="relative aspect-square sm:aspect-video lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200" 
            alt="About Us" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/40 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
            <div className="text-4xl font-black text-white mb-2">10+</div>
            <div className="text-xs font-bold text-cyan-100 uppercase tracking-widest">Years of Innovation</div>
          </div>
        </div>

        <div className="space-y-8 sm:space-y-12">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-600 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-4">
              <div className="w-8 h-[2px] bg-cyan-600" />
              Our Story
            </div>
            <h2 className="text-3xl sm:text-6xl font-black text-gray-900 tracking-tighter mb-6 leading-[1.1]">
              WE ARE THE <br /> ARCHITECTS OF <br /> <span className="text-cyan-600">DIGITAL DREAMS</span>
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-lg leading-relaxed">
              Founded in 2016, Dammytech began with a simple mission: to bridge the gap between today's reality and tomorrow's possibilities. We believe that technology should be an extension of human potential.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-2xl font-black text-gray-900 mb-1">
                <AnimatedCounter value={6345} suffix="+" incrementPerSecond={0.1} />
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gadgets Delivered</div>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 mb-1">99.9%</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Satisfaction</div>
            </div>
          </div>

          <Link to="/manifesto" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-cyan-600 group">
            Read Full Manifesto
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 sm:py-32">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8 mb-16 sm:mb-24">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-cyan-600 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-4">
              <div className="w-8 h-[2px] bg-cyan-600" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-6xl font-black text-gray-900 tracking-tighter">
              VOICES FROM <br /> THE FUTURE
            </h2>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          {[
            ...[
              {
                name: "Chidi Okafor",
                role: "Tech Reviewer",
                text: "The neural-link headset I bought from Dammytech changed my workflow forever. This store is literally the future of tech in Nigeria.",
                avatar: "CO",
                rating: 5
              },
              {
                name: "Oluwaseun Ajayi",
                role: "Software Architect",
                text: "Fastest shipping I've ever experienced in Lagos. The quantum laptop arrived in perfect condition and performs like a beast.",
                avatar: "OA",
                rating: 5
              },
              {
                name: "Amaka Nwachukwu",
                role: "Digital Artist",
                text: "Customer support is top-tier. They helped me calibrate my holographic display at 3 AM. Unbeatable service and very reliable.",
                avatar: "AN",
                rating: 5
              },
              {
                name: "Babatunde Lawal",
                role: "Business Owner",
                text: "I was skeptical at first, but Dammytech delivered exactly what I ordered. Their gadgets are authentic and the delivery is super fast.",
                avatar: "BL",
                rating: 5
              },
              {
                name: "Zainab Ibrahim",
                role: "Computer Engineer",
                text: "Finding high-quality components in Nigeria used to be hard until I found this store. Their customer service is exceptional!",
                avatar: "ZI",
                rating: 5
              },
              {
                name: "Emeka Nwosu",
                role: "Mobile Developer",
                text: "Bought my latest smartphone here and the experience was seamless. Legit gadgets and very professional handling. Highly recommended!",
                avatar: "EN",
                rating: 5
              }
            ],
            ...userTestimonials
          ].map((review, i) => (
            <motion.div
              key={review.id || review.name + i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 sm:p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 relative"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-black">
                  {review.avatar}
                </div>
                <div>
                  <div className="font-black text-gray-900">{review.name}</div>
                  <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">{review.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed italic">"{review.text}"</p>
              <div className="absolute top-8 right-10 opacity-10">
                <ShoppingCart className="w-12 h-12 text-cyan-600" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comment Form */}
        <div className="mt-16 sm:mt-24 max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 bg-gray-900 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Share Your Voice</h3>
              <p className="text-gray-400 font-medium text-sm">Tell the community about your experience with Dammytech.</p>
            </div>

            <form onSubmit={handleTestimonialSubmit} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewTestimonial({ ...newTestimonial, rating: star })}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        className={cn(
                          "w-8 h-8",
                          star <= newTestimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
                        )} 
                      />
                    </button>
                  ))}
                </div>
                
                <textarea
                  required
                  rows={3}
                  value={newTestimonial.text}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                  placeholder={user ? "Write your testimonial here..." : "Please sign in to leave a testimonial"}
                  disabled={!user || isTestimonialSubmitting}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all resize-none font-medium text-sm sm:text-base"
                />
              </div>

              {!user ? (
                <Link 
                  to="/auth"
                  className="w-full py-4 sm:py-5 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-3 hover:bg-cyan-500 hover:text-white transition-all group"
                >
                  <LogIn className="w-5 h-5 text-gray-900 group-hover:text-white" />
                  Sign In to Comment
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={isTestimonialSubmitting || !newTestimonial.text.trim()}
                  className="w-full py-4 sm:py-5 bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 group"
                >
                  {isTestimonialSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Post My Voice
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Delivery & FAQ Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-24">
        {/* Delivery Info */}
        <div className="p-8 sm:p-16 bg-gray-900 rounded-[3rem] text-white">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-8">
            <div className="w-8 h-[2px] bg-cyan-400" />
            Logistics
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter mb-12">
            GLOBAL REACH, <br /> LOCAL SPEED
          </h2>
          
          <div className="space-y-10">
            {[
              { title: "Free Global Shipping", desc: "On all orders over ₦500,000. Fully insured and tracked.", icon: Truck },
              { title: "30-Day Returns", desc: "Not satisfied? Return it within 30 days for a full refund, no questions asked.", icon: RefreshCcw },
              { title: "24H Dispatch", desc: "Orders placed before 2 PM are dispatched the same business day.", icon: Zap }
            ].map((item) => (
              <div key={item.title} className="flex gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="py-8 sm:py-12">
          <div className="inline-flex items-center gap-2 text-cyan-600 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-4">
            <div className="w-8 h-[2px] bg-cyan-600" />
            Support
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter mb-12">
            FREQUENTLY <br /> ASKED QUESTIONS
          </h2>

          <div className="space-y-4">
            {[
              { q: "Do you ship internationally?", a: "Yes, we ship to over 150 countries worldwide with premium express carriers." },
              { q: "What is your warranty policy?", a: "All gadgets come with a minimum 2-year international manufacturer warranty." },
              { q: "Can I cancel my order?", a: "Orders can be cancelled within 2 hours of placement for a full immediate refund." },
              { q: "Are the gadgets authentic?", a: "We are authorized retailers for every brand we carry. 100% authenticity guaranteed." }
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-gray-900">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-cyan-600 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed font-medium">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
