import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase, isMockMode } from './lib/supabase';
import { mockStorage } from './lib/mockStorage';
import { UserProfile } from './types';
import { ErrorBoundary } from './components/errorboundary';
import { 
  LogOut, 
  LogIn, 
  UserPlus, 
  Search, 
  Menu, 
  X, 
  Smartphone, 
  Laptop, 
  Watch, 
  Headphones, 
  Cpu,
  ShoppingBag,
  ArrowRight,
  Home as HomeIcon,
  UserCircle
} from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthChoice from './pages/AuthChoice';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const Navbar = () => {
  const { user, profile, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const categories = [
    { name: 'Phones', icon: Smartphone, path: '/category/phones' },
    { name: 'Laptops', icon: Laptop, path: '/category/laptops' },
    { name: 'Watches', icon: Watch, path: '/category/watches' },
    { name: 'Audio', icon: Headphones, path: '/category/audio' },
    { name: 'Components', icon: Cpu, path: '/category/components' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="px-4 sm:px-8 lg:px-20">
        <div className="flex justify-between h-14 sm:h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-200 group-hover:rotate-6 transition-all duration-300">
              <Cpu className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black tracking-tighter text-gray-900 leading-none">
                DAMMYTECH
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] text-cyan-600 uppercase">
                Gadget Store
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden xl:flex flex-1 max-w-xs focus-within:max-w-xl mx-8 transition-all duration-500 ease-in-out">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="text"
                placeholder="Search gadgets..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-8 mr-8">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 text-sm font-semibold transition-colors",
                location.pathname === "/" ? "text-cyan-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold transition-colors",
                  location.pathname === cat.path ? "text-cyan-600" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900">{profile?.fullName}</span>
                  <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">
                    {profile?.role}
                  </span>
                </div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="hidden xl:flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase tracking-widest text-white bg-gray-900 rounded-xl hover:bg-cyan-600 transition-all shadow-lg shadow-gray-200 group"
                >
                  <UserCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Explore
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="xl:hidden absolute top-[calc(100%-0.5rem)] right-4 w-[calc(100%-2rem)] max-w-sm bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search gadgets..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-1.5">
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-cyan-500 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-cyan-400 transition-colors">
                        <HomeIcon className="w-4 h-4" />
                      </div>
                      Home
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-1.5">
                  {categories.map((cat, i) => (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={cat.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-cyan-500 hover:text-white transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-cyan-400 transition-colors">
                            <cat.icon className="w-4 h-4" />
                          </div>
                          {cat.name}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {!user ? (
                <div className="pt-1">
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-3 p-4 text-sm font-black uppercase tracking-widest text-white bg-gray-900 rounded-xl shadow-lg shadow-gray-200 hover:bg-cyan-600 transition-all group"
                  >
                    <UserCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Explore
                  </Link>
                </div>
              ) : (
                <div className="pt-1">
                    <button
                    onClick={() => {
                      supabase.auth.signOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) {
      setProfile(null);
      return;
    }

    if (isMockMode) {
      const profile = mockStorage.getUserById(id);
      setProfile(profile || null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
          />
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-500" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: profile?.role === 'admin', refreshProfile }}>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white font-sans selection:bg-cyan-100 selection:text-cyan-900">
          <Navbar />
          <main className="px-4 sm:px-8 lg:px-20 py-6 sm:py-12">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthChoice />} />
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
                <Route path="/category/:category" element={<Home />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ErrorBoundary>
          </main>
          
          <footer className="bg-gray-900 text-white py-10 sm:py-20 mt-10 sm:mt-20">
            <div className="px-4 sm:px-8 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-black tracking-tighter">DAMMYTECH GADGET STORE</span>
                </div>
                <p className="text-gray-400 text-sm max-w-sm mb-6 sm:mb-8 leading-relaxed">
                  Your ultimate destination for high-end gadgets and futuristic technology. We bring the future to your doorstep.
                </p>
                <div className="flex gap-3 sm:gap-4">
                  {['Twitter', 'Instagram', 'Facebook', 'LinkedIn'].map(social => (
                    <a key={social} href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-cyan-500 transition-colors">
                      <span className="sr-only">{social}</span>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white/20 rounded-full" />
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 uppercase tracking-widest text-[10px] sm:text-xs text-cyan-500">Shop</h4>
                <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-medium text-gray-400">
                  <li><Link to="/category/phones" className="hover:text-white transition-colors">Phones</Link></li>
                  <li><Link to="/category/laptops" className="hover:text-white transition-colors">Laptops</Link></li>
                  <li><Link to="/category/watches" className="hover:text-white transition-colors">Watches</Link></li>
                  <li><Link to="/category/audio" className="hover:text-white transition-colors">Audio</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4 sm:mb-6 uppercase tracking-widest text-[10px] sm:text-xs text-cyan-500">Support</h4>
                <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-medium text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
            <div className="px-4 sm:px-8 lg:px-20 pt-10 sm:pt-20 mt-10 sm:mt-20 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                © {new Date().getFullYear()} Dammytech Gadget Store. Engineered for Excellence.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
