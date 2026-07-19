import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db, onAuthStateChanged, doc, getDoc, signOut, User, updateDoc, deleteDoc } from './lib/firebase';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { UserProfile } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  Truck,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Home as HomeIcon,
  UserCircle,
  Settings,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  User as UserIcon
} from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthChoice from './pages/AuthChoice';
import GadgetDetails from './pages/GadgetDetails';
import AdminDashboard from './pages/AdminDashboard';
import UserOrders from './pages/UserOrders';
import Manifesto from './pages/Manifesto';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: (userId?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
  logout: async () => {},
});

export const Logo = ({ className = "", iconClassName = "" }) => (
  <div className={cn("flex items-center gap-2 sm:gap-3 group shrink-0", className)}>
    <div className="relative">
      <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-950 to-gray-800 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/5 shadow-2xl group-hover:rotate-12 transition-all duration-500">
        <Cpu className={cn("w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:text-white transition-colors duration-300", iconClassName)} />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      </div>
    </div>
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <span className="text-base sm:text-xl font-black tracking-tighter text-current leading-none">
          DAMMYTECH
        </span>
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-cyan-500 rounded-full self-end mb-0.5" />
      </div>
      <span className="text-[7px] sm:text-[9px] font-black tracking-[0.4em] text-cyan-500 uppercase opacity-90">
        Premium Gadgets
      </span>
    </div>
  </div>
);

export const useAuth = () => useContext(AuthContext);

const LogoutModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-gray-100 p-8 sm:p-10 z-[10000]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8">
                <LogOut className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Leaving Already?</h3>
              <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed">
                Are you sure you want to log out? We'll miss you! You'll need to sign back in to access your orders and dashboard.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={onClose}
                  className="py-4 bg-gray-50 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all border border-gray-100"
                >
                  Stay Here
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const Navbar = ({ 
  searchQuery, 
  setSearchQuery, 
  isSearchOpen, 
  setIsSearchOpen
}: { 
  searchQuery: string; 
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (o: boolean) => void;
}) => {
  const { user, profile, logout, isAdmin, refreshProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCategoryClick = (path: string) => {
    setIsMenuOpen(false);
    if (location.pathname + location.hash === path) {
      if (path === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const id = path.split('#')[1];
        if (id) {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const categories = [
    { name: 'Home', icon: HomeIcon, path: '/' },
    { name: 'Phones', icon: Smartphone, path: '/category/phones#collection' },
    { name: 'Laptops', icon: Laptop, path: '/category/laptops#collection' },
    { name: 'Watches', icon: Watch, path: '/category/watches#collection' },
    { name: 'Audios', icon: Headphones, path: '/category/audio#collection' },
    { name: 'Components', icon: Cpu, path: '/category/components#collection' },
  ];

  if (isAdmin) {
    categories.push({ name: 'Orders', icon: ShoppingBag, path: '/admin/orders' });
  } else if (user) {
    categories.push({ name: 'My Orders', icon: ShoppingBag, path: '/my-orders' });
  }

  const getInitials = (name?: string, email?: string) => {
    const targetName = name || (isAdmin ? 'Busari Ismail' : 'User');
    
    if (targetName && targetName.trim()) {
      const parts = targetName.trim().split(/\s+/);
      if (parts.length >= 2) {
        // First letter of first name + first letter of last name
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      // If only one name, take the first two letters
      return targetName.trim().slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return '?';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 text-gray-900">
      <div className="px-4 sm:px-8 lg:px-20">
        <div className="flex justify-between h-14 sm:h-20 items-center">
          {/* Logo */}
          <Link to="/">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-6 mr-8">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                onClick={() => handleCategoryClick(cat.path)}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold transition-colors",
                  location.pathname === cat.path.split('#')[0] ? "text-cyan-600" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user && (
              <Link 
                to="/profile"
                className="flex items-center gap-2 sm:gap-3 cursor-pointer group/profile"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-200 border-2 border-white flex-shrink-0 group-hover/profile:scale-110 transition-transform">
                  {getInitials(profile?.full_name, user?.email || undefined)}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover/profile:text-cyan-600 transition-colors">{profile?.full_name || (isAdmin ? 'Busari Ismail' : 'User')}</span>
                  <span className="text-[8px] sm:text-[10px] font-bold text-cyan-600 uppercase tracking-wider">
                    {isAdmin ? 'Admin' : (profile?.role || 'User')}
                  </span>
                </div>
              </Link>
            )}

            {/* Desktop Explore/Logout (Right Side) */}
            <div className="hidden xl:flex items-center gap-4">
              {!user ? (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-white bg-gray-900 rounded-xl hover:bg-cyan-600 transition-all shadow-lg shadow-gray-200 group"
                >
                  <UserCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Explore
                </Link>
              ) : (
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Log Out</span>
                </button>
              )}
            </div>
            
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
                        onClick={() => handleCategoryClick(cat.path)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all group",
                          location.pathname === cat.path.split('#')[0]
                            ? "bg-cyan-500 text-white" 
                            : "bg-gray-50 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-colors",
                            location.pathname === cat.path.split('#')[0] ? "bg-cyan-400" : "bg-white group-hover:bg-cyan-100"
                          )}>
                            <cat.icon className="w-4 h-4" />
                          </div>
                          {cat.name}
                        </div>
                        <ArrowRight className={cn(
                          "w-3.5 h-3.5 transition-all -translate-x-2 group-hover:translate-x-0",
                          location.pathname === cat.path.split('#')[0] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )} />
                      </Link>
                    </motion.div>
                  ))}

                  {/* Explore/Logout in Mobile Menu */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: categories.length * 0.05 }}
                  >
                    {!user ? (
                      <Link
                        to="/auth"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-3 px-6 py-4 text-sm font-black uppercase tracking-widest text-white bg-gray-900 rounded-xl shadow-lg shadow-gray-200 hover:bg-cyan-600 transition-all group"
                      >
                        <UserCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Explore
                      </Link>
                    ) : (
                      <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center justify-center gap-3 p-4 text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogout} 
      />
    </nav>
  );
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  
  return null;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const refreshProfile = async (userId?: string) => {
    const id = userId || user?.uid;
    if (!id) {
      setProfile(null);
      return;
    }

    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        console.warn("No profile found for user:", id);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        refreshProfile(currentUser.uid).finally(() => {
          setLoading(false);
        });
      } else {
        setProfile(null);
        setSearchQuery('');
        setIsSearchOpen(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setSearchQuery('');
      setIsSearchOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isAdmin = profile?.role === 'admin' || 
                  profile?.username?.toLowerCase() === 'dammy' || 
                  profile?.email?.toLowerCase() === 'ibusari127@gmail.com';

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin, 
      refreshProfile,
      logout
    }}>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white font-sans selection:bg-cyan-100 selection:text-cyan-900">
          <Navbar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
          />
          <main className="px-4 sm:px-8 lg:px-20 py-6 sm:py-12">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
                <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthChoice />} />
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/gadget/:id" element={<GadgetDetails />} />
                <Route path="/manifesto" element={<Manifesto />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-orders" element={user ? <UserOrders /> : <Navigate to="/login" />} />
                <Route path="/admin/orders" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/category/:category" element={<Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ErrorBoundary>
          </main>
          
          <footer className="bg-gray-900 text-white py-10 sm:py-20 mt-10 sm:mt-20">
            <div className="px-4 sm:px-8 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="mb-6 sm:mb-8">
                  <Logo />
                </div>
                <p className="text-gray-400 text-sm max-w-sm mb-6 sm:mb-8 leading-relaxed">
                  Yours ultimate destination for high-end gadgets and futuristic technology. We bring the future to your doorstep.
                </p>
                <div className="flex gap-3 sm:gap-4">
                  {[
                    { name: 'X', icon: X },
                    { name: 'Instagram', icon: Instagram },
                    { name: 'Facebook', icon: Facebook },
                    { name: 'LinkedIn', icon: Linkedin }
                  ].map(social => (
                    <a key={social.name} href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-cyan-500 transition-all group">
                      <span className="sr-only">{social.name}</span>
                      <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 uppercase tracking-widest text-[10px] sm:text-xs text-cyan-500">Shop</h4>
                <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-medium text-gray-400">
                  <li><Link to="/category/phones#collection" className="hover:text-white transition-colors">Phones</Link></li>
                  <li><Link to="/category/laptops#collection" className="hover:text-white transition-colors">Laptops</Link></li>
                  <li><Link to="/category/watches#collection" className="hover:text-white transition-colors">Watches</Link></li>
                  <li><Link to="/category/audio#collection" className="hover:text-white transition-colors">Audio</Link></li>
                  <li><Link to="/category/components#collection" className="hover:text-white transition-colors">Components</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 uppercase tracking-widest text-[10px] sm:text-xs text-cyan-500">Contact</h4>
                <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-medium text-gray-400">
                  <li className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-cyan-500" />
                    <a href="tel:08073651596" className="hover:text-white transition-colors">08073651596</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-cyan-500" />
                    <a href="tel:09071498194" className="hover:text-white transition-colors">09071498194</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-cyan-500" />
                    <a href="mailto:Ibusari127@gmail.com" className="hover:text-white transition-colors">Ibusari127@gmail.com</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="px-4 sm:px-8 lg:px-20 pt-10 sm:pt-20 mt-10 sm:mt-20 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                © {new Date().getFullYear()} Dammytech Gadget Store. Engineered for Excellence by Tsmak Tech.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

