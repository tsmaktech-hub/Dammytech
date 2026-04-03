import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pb, getFileUrl } from '../lib/pocketbase';
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
  Truck
} from 'lucide-react';
import { cn } from '../lib/utils';

const AddGadgetModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'phones',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!imageFile) return setError('Please select an image');
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('image', imageFile);
      data.append('author', user.id);

      await pb.collection('gadgets').create(data);
      onClose();
      setFormData({ name: '', description: '', price: '', category: 'phones' });
      setImageFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add gadget');
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
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            List New Gadget
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Price ($)</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold"
                  placeholder="999.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Gadget Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="gadget-image"
                />
                <label
                  htmlFor="gadget-image"
                  className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all font-semibold text-gray-500 truncate"
                >
                  <ImageIcon className="w-5 h-5 flex-shrink-0 text-cyan-500" />
                  {imageFile ? imageFile.name : 'Choose image...'}
                </label>
              </div>
            </div>
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
                'Publish Listing'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const { user, isAdmin } = useAuth();
  const { category } = useParams();
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchGadgets = async () => {
      setLoading(true);
      try {
        const filter = category ? `category = "${category}"` : '';
        const records = await pb.collection('gadgets').getList(1, 50, {
          sort: '-created',
          filter: filter,
          expand: 'author',
          requestKey: null,
        });
        setGadgets(records.items as unknown as Gadget[]);
      } catch (error) {
        console.error('Error fetching gadgets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGadgets();
    
    // Real-time subscription
    const unsubscribe = pb.collection('gadgets').subscribe('*', (e) => {
      fetchGadgets();
    });

    return () => {
      pb.collection('gadgets').unsubscribe();
    };
  }, [category]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this gadget?')) return;
    try {
      await pb.collection('gadgets').delete(id);
    } catch (error) {
      console.error('Error deleting gadget:', error);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-[500px] sm:min-h-[600px] rounded-3xl sm:rounded-[3rem] overflow-hidden bg-gray-950 flex items-center px-6 sm:px-20 py-20 sm:py-0">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-6 sm:mb-8"
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-cyan-400" />
            Next Gen Tech Store
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-8xl font-black text-white leading-[1] sm:leading-[0.9] tracking-tighter mb-6 sm:mb-8"
          >
            UPGRADE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              DIGITAL LIFE
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 mb-10 sm:mb-12 max-w-2xl mx-auto sm:mx-0 leading-relaxed font-medium"
          >
            The most advanced marketplace for futuristic gadgets. From neural-link headsets to quantum laptops.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-6"
          >
            <button className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-cyan-500 text-white rounded-2xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-2xl shadow-cyan-500/20 flex items-center justify-center gap-3 group">
              Explore Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {user && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                List a Gadget
              </button>
            )}
          </motion.div>
        </div>

        {/* Floating Stats */}
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
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8 mb-12 sm:mb-16">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-cyan-600 font-black uppercase tracking-widest text-[10px] sm:text-xs mb-3">
              <div className="w-6 sm:w-8 h-[2px] bg-cyan-600" />
              Our Inventory
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection` : 'All Gadgets'}
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-bold text-gray-500 border border-gray-100">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Sort: Newest
            </div>
            <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-50 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-bold text-cyan-600 border border-cyan-100">
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {gadgets.length} Items
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse space-y-6">
                <div className="aspect-[4/5] bg-gray-100 rounded-3xl sm:rounded-[2.5rem]" />
                <div className="space-y-3">
                  <div className="h-6 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : gadgets.length === 0 ? (
          <div className="text-center py-20 sm:py-32 bg-gray-50 rounded-3xl sm:rounded-[3rem] border-2 border-dashed border-gray-200 px-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
              <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">No gadgets found</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto mb-8 sm:mb-10">
              We couldn't find any gadgets in this category. Be the first to list one!
            </p>
            {user && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-2xl shadow-gray-200"
              >
                Start Selling
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
            <AnimatePresence mode="popLayout">
              {gadgets.map((gadget) => (
                <motion.div
                  key={gadget.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white rounded-3xl sm:rounded-[2.5rem] p-3 sm:p-4 border border-gray-100 hover:border-cyan-500/20 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all duration-500"
                >
                  <div className="relative aspect-[4/5] rounded-2xl sm:rounded-[2rem] overflow-hidden bg-gray-50 mb-4 sm:mb-6">
                    <img
                      src={getFileUrl('gadgets', gadget.id, gadget.image)}
                      alt={gadget.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-900 hover:bg-cyan-500 hover:text-white transition-all shadow-xl">
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {(user?.id === gadget.author || isAdmin) && (
                        <button
                          onClick={() => handleDelete(gadget.id)}
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>

                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg sm:rounded-xl shadow-lg border border-white/20">
                        {gadget.category}
                      </span>
                    </div>
                  </div>

                  <div className="px-1 sm:px-2 pb-1 sm:pb-2">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-cyan-600 transition-colors">
                        {gadget.name}
                      </h3>
                      <span className="text-lg sm:text-xl font-black text-cyan-600">
                        ${gadget.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium line-clamp-2 mb-4 sm:mb-6 leading-relaxed">
                      {gadget.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-black text-gray-400">
                          {gadget.expand?.author?.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {gadget.expand?.author?.username || 'Anonymous'}
                        </span>
                      </div>
                      <button className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-600 flex items-center gap-1 group/btn">
                        Details
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <AddGadgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
