import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase, getFileUrl, isMockMode } from '../lib/supabase';
import { mockStorage } from '../lib/mockStorage';
import { Gadget } from '../types';
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
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

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
    if (!formData.imageUrl) return setError('Please provide an image link');
    setError('');
    setLoading(true);

    try {
      if (isMockMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const finalImageUrl = formData.imageUrl;

        const updatedGadget: any = {
          id: gadget?.id || crypto.randomUUID(),
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: finalImageUrl,
          author: gadget?.author || user.id,
          created_at: gadget?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          expand: gadget?.expand || {
            author: {
              full_name: user.full_name || (user.username?.toLowerCase() === 'dammy' ? 'Busari Ismail' : 'User'),
              username: user.username || 'user'
            }
          }
        };
        
        mockStorage.saveGadget(updatedGadget);
        window.dispatchEvent(new Event('mock-gadgets-updated'));
        
        onClose();
        return;
      }

      // Supabase mode
      // Get the current Supabase user to ensure we have the correct UID for RLS
      const { data: { user: sbUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !sbUser) {
        throw new Error('You must be logged in to your account to list gadgets. Please log out and log back in.');
      }

      if (gadget) {
        const response = await fetch(`/api/gadgets/${gadget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            image: formData.imageUrl,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update gadget');
        }
      } else {
        const response = await fetch('/api/gadgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            image: formData.imageUrl,
            author: sbUser.id
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create gadget');
        }
      }

      onClose();
      // Trigger a refresh of the gadgets list
      window.dispatchEvent(new Event('gadgets-updated'));
    } catch (err: any) {
      let msg = err.message || 'Failed to save gadget';
      if (msg.includes('row-level security policy')) {
        msg = 'Permission denied. Please try logging out and logging back in to refresh your session.';
      }
      setError(msg);
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
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Gadget Image Link</label>
              <div className="relative group">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="url"
                  required
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold text-sm"
                  placeholder="Paste direct image link here (e.g. https://example.com/image.jpg)"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Image Preview */}
            {(formData.imageUrl || gadget?.image) && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                <img 
                  src={formData.imageUrl || (gadget ? getFileUrl('gadgets', gadget.image) : '')} 
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

  const isAuthorizedSeller = profile?.username?.toLowerCase() === 'dammy' || 
                            (profile?.email === 'tsmaktech@gmail.com' && 
                             profile?.username === 'Dammy' && 
                             profile?.full_name === 'Busari Ismail' &&
                             profile?.phone_number === '09071498194');

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
    const fetchGadgets = async () => {
      setLoading(true);
      
      if (isMockMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const allGadgets = mockStorage.getGadgets();
        const filtered = category 
          ? allGadgets.filter(g => g.category === category)
          : allGadgets;
        setGadgets(filtered);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/gadgets${category ? `?category=${category}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch gadgets');
        const data = await response.json();

        // Map API data to our Gadget type
        let mappedData = data.map((item: any) => ({
          ...item,
          expand: {
            author: item.author
          }
        }));

        // Client-side filtering if needed (though backend could do it)
        if (category) {
          mappedData = mappedData.filter((g: any) => g.category === category);
        }

        // Limit gadgets for guests
        if (!user) {
          mappedData = mappedData.slice(0, 4);
        }

        setGadgets(mappedData);
      } catch (error) {
        console.error('Error fetching gadgets:', error);
        // Fallback to mock data on error
        const allGadgets = mockStorage.getGadgets();
        let filtered = category 
          ? allGadgets.filter(g => g.category === category)
          : allGadgets;
        
        // Limit gadgets for guests
        if (!user) {
          filtered = filtered.slice(0, 4);
        }
        
        setGadgets(filtered);
      } finally {
        setLoading(false);
      }
    };

    fetchGadgets();
    
    // Scroll to collection if category is selected
    if (category) {
      const element = document.getElementById('collection');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    const handleUpdate = () => fetchGadgets();
    window.addEventListener('mock-gadgets-updated', handleUpdate);
    window.addEventListener('gadgets-updated', handleUpdate);
    
    // Real-time subscription
    let subscription: any;
    if (!isMockMode) {
      subscription = supabase
        .channel('gadgets-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gadgets' }, () => {
          fetchGadgets();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('mock-gadgets-updated', handleUpdate);
      window.removeEventListener('gadgets-updated', handleUpdate);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [category]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this gadget?')) return;
    try {
      if (isMockMode) {
        mockStorage.deleteGadget(id);
        window.dispatchEvent(new Event('mock-gadgets-updated'));
        return;
      }
      
      const response = await fetch(`/api/gadgets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete gadget');
      }
      
      setGadgets(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting gadget:', error);
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
              {profile?.username === 'Dammy' && (
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all user data and gadgets? Only the owner account will be kept.')) {
                      mockStorage.resetDatabase();
                      alert('Database reset successfully. Please refresh the page if changes don\'t appear immediately.');
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
              { label: 'Users', value: '50K+', icon: Star },
              { label: 'Sold', value: '120K+', icon: ShoppingCart },
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
                  <div className="text-sm font-black text-white">{stat.value}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Stats Desktop */}
        <div className="absolute right-20 bottom-20 hidden xl:grid grid-cols-2 gap-6">
          {[
            { label: 'Active Users', value: '50K+', icon: Star },
            { label: 'Gadgets Sold', value: '120K+', icon: ShoppingCart },
            { label: 'Countries', value: '45+', icon: ShieldCheck },
            { label: 'Fast Delivery', value: '24H', icon: Truck },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] min-w-[180px]"
            >
              <stat.icon className="w-6 h-6 text-cyan-400 mb-4" />
              <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
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
              We couldn't find any gadgets in this category. {isAuthorizedSeller ? 'Be the first to list one!' : 'Check back later for new arrivals.'}
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
                  <div className="relative aspect-[4/5] rounded-xl sm:rounded-[2rem] overflow-hidden bg-gray-50 mb-3 sm:mb-6">
                    <img
                      src={getFileUrl('gadgets', gadget.image)}
                      alt={gadget.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    
                    {/* Overlay Actions (Desktop) */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center gap-3">
                      <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:bg-cyan-500 hover:text-white transition-all shadow-xl">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                      {(user?.id === gadget.author || isAdmin) && (
                        <>
                          <button
                            onClick={() => {
                              setEditingGadget(gadget);
                              setIsModalOpen(true);
                            }}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all shadow-xl"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(gadget.id)}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Mobile Actions (Always visible or easily accessible) */}
                    <div className="absolute bottom-2 right-2 flex sm:hidden gap-1.5">
                      {(user?.id === gadget.author || isAdmin) && (
                        <button
                          onClick={() => {
                            setEditingGadget(gadget);
                            setIsModalOpen(true);
                          }}
                          className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center text-cyan-600 shadow-lg border border-white/20"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <span className="px-2 sm:px-4 py-1 sm:py-2 bg-white/90 backdrop-blur-md text-gray-900 text-[8px] sm:text-xs font-black uppercase tracking-widest rounded-md sm:rounded-xl shadow-lg border border-white/20">
                        {gadget.category}
                      </span>
                    </div>
                  </div>

                  <div className="px-1 sm:px-2 pb-1 sm:pb-2">
                    <div className="flex justify-between items-start mb-1 sm:mb-3">
                      <h3 className="text-sm sm:text-xl font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-cyan-600 transition-colors">
                        {gadget.name}
                      </h3>
                      <span className="text-sm sm:text-xl font-black text-cyan-600">
                        ₦{gadget.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[10px] sm:text-sm font-medium line-clamp-2 mb-3 sm:mb-6 leading-relaxed">
                      {gadget.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-5 h-5 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center text-[6px] sm:text-[10px] font-black text-gray-400">
                          {gadget.expand?.author?.username?.toLowerCase() === 'dammy' ? 'BI' : (gadget.expand?.author?.full_name?.charAt(0) || 'U')}
                        </div>
                        <span className="text-[6px] sm:text-[10px] font-bold text-cyan-600 uppercase tracking-widest">
                          {gadget.expand?.author?.username?.toLowerCase() === 'dammy' ? 'Admin' : (gadget.expand?.author?.username || 'Anonymous')}
                        </span>
                      </div>
                      <button className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-cyan-600 flex items-center gap-0.5 sm:gap-1 group/btn">
                        Details
                        <ChevronRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
              <div className="text-2xl font-black text-gray-900 mb-1">500K+</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gadgets Delivered</div>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 mb-1">99.9%</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Satisfaction</div>
            </div>
          </div>

          <button className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-cyan-600 group">
            Read Full Manifesto
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
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
            {
              name: "Alex Rivera",
              role: "Tech Reviewer",
              text: "The neural-link headset I bought here changed my workflow forever. Dammytech is literally living in 2030.",
              avatar: "AR"
            },
            {
              name: "Sarah Chen",
              role: "Software Architect",
              text: "Fastest shipping I've ever experienced. The quantum laptop arrived in perfect condition and performs like a beast.",
              avatar: "SC"
            },
            {
              name: "Marcus Thorne",
              role: "Digital Artist",
              text: "Customer support is top-tier. They helped me calibrate my holographic display at 3 AM. Unbeatable service.",
              avatar: "MT"
            }
          ].map((review, i) => (
            <motion.div
              key={review.name}
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
              </div>
              <p className="text-gray-500 font-medium leading-relaxed italic">"{review.text}"</p>
              <div className="absolute top-8 right-10 opacity-10">
                <ShoppingCart className="w-12 h-12 text-cyan-600" />
              </div>
            </motion.div>
          ))}
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
