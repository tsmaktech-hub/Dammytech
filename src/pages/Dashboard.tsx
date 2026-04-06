import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, getFileUrl, isMockMode } from '../lib/supabase';
import { mockStorage } from '../lib/mockStorage';
import { Gadget } from '../types';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ShoppingBag, 
  Tag, 
  ArrowRight,
  UserCircle,
  Mail,
  Phone,
  Calendar,
  Cpu,
  LayoutDashboard,
  AlertCircle,
  Search,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthorizedSeller = profile?.email === 'tsmaktech@gmail.com' && 
                            profile?.username === 'Dammy' && 
                            profile?.full_name === 'Busari Ismail' &&
                            profile?.phone_number === '09071498194';
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchUserGadgets = async () => {
    if (!user) return;
    setLoading(true);

    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const allGadgets = mockStorage.getGadgets();
      const userGadgets = allGadgets.filter(g => g.author === user.id);
      setGadgets(userGadgets);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gadgets')
        .select('*, profiles!gadgets_author_fkey(*)')
        .eq('author', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = data.map(item => ({
        ...item,
        image: item.image_url,
        expand: {
          author: item.profiles || profile
        }
      }));

      setGadgets(mappedData as any[]);
    } catch (error) {
      console.error('Error fetching user gadgets:', error);
      // Fallback to mock
      const allGadgets = mockStorage.getGadgets();
      setGadgets(allGadgets.filter(g => g.author === user.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGadgets();
    
    const handleUpdate = () => fetchUserGadgets();
    window.addEventListener('mock-gadgets-updated', handleUpdate);
    window.addEventListener('gadgets-updated', handleUpdate);

    return () => {
      window.removeEventListener('mock-gadgets-updated', handleUpdate);
      window.removeEventListener('gadgets-updated', handleUpdate);
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this gadget?')) return;
    try {
      if (isMockMode) {
        mockStorage.deleteGadget(id);
        window.dispatchEvent(new Event('mock-gadgets-updated'));
        return;
      }
      const { error } = await supabase
        .from('gadgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setGadgets(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting gadget:', error);
    }
  };

  const filteredGadgets = gadgets.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = gadgets.reduce((sum, g) => sum + g.price, 0);

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-cyan-600 font-black uppercase tracking-widest text-[10px] sm:text-xs">
            <LayoutDashboard className="w-4 h-4" />
            User Control Panel
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            MY <span className="text-cyan-600">DASHBOARD</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-lg">
            Manage your futuristic gadget collection and track your marketplace activity.
          </p>
        </div>

        <div className="flex gap-4 w-full sm:w-auto">
          <Link
            to="/"
            className="flex-1 sm:flex-none px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-gray-100 transition-all border border-gray-100 flex items-center justify-center gap-2"
          >
            Browse Store
          </Link>
          {isAuthorizedSeller && (
            <button
              onClick={() => navigate('/', { state: { openAddModal: true } })}
              className="flex-1 sm:flex-none px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              New Listing
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Listings', value: gadgets.length, icon: ShoppingBag, color: 'cyan' },
          { label: 'Collection Value', value: `₦${totalValue.toLocaleString()}`, icon: Tag, color: 'blue' },
          { label: 'Account Status', value: profile?.role?.toUpperCase() || 'USER', icon: ShieldCheck, color: 'green' },
          { label: 'Member Since', value: new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Calendar, color: 'purple' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
            </div>
            <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-cyan-200 border-4 border-white mb-6">
                {profile?.full_name?.charAt(0) || user.email?.[0].toUpperCase()}
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{profile?.full_name}</h3>
              <p className="text-cyan-600 font-bold uppercase tracking-widest text-xs">@{profile?.username}</p>
            </div>

            <div className="space-y-4 pt-8 border-t border-gray-50">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</div>
                  <div className="text-sm font-bold text-gray-900">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</div>
                  <div className="text-sm font-bold text-gray-900">{profile?.phone_number || 'Not provided'}</div>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Main Content Area - My Gadgets */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-cyan-500" />
              My Listings
            </h2>
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="text"
                placeholder="Search my gadgets..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all text-xs font-semibold shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse bg-gray-50 rounded-[2rem] h-64" />
              ))}
            </div>
          ) : gadgets.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 px-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
                <Plus className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 font-medium max-w-xs mx-auto mb-8">
                You haven't listed any gadgets for sale yet. Start your journey today!
              </p>
              <button 
                onClick={() => navigate('/', { state: { openAddModal: true } })}
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredGadgets.map((gadget) => (
                  <motion.div
                    key={gadget.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white rounded-[2rem] p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-50 mb-4">
                      <img
                        src={getFileUrl('gadgets', gadget.image)}
                        alt={gadget.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-gray-900 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg border border-white/20">
                          {gadget.category}
                        </span>
                      </div>
                    </div>

                    <div className="px-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-cyan-600 transition-colors">
                          {gadget.name}
                        </h3>
                        <span className="text-lg font-black text-cyan-600">
                          ₦{gadget.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                        <button
                          onClick={() => navigate('/', { state: { editingGadget: gadget, openAddModal: true } })}
                          className="flex-1 py-3 bg-gray-50 text-cyan-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-cyan-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(gadget.id)}
                          className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
