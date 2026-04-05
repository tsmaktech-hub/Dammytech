import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase, isMockMode } from '../lib/supabase';
import { mockStorage } from '../lib/mockStorage';
import { motion } from 'motion/react';
import { 
  LogIn, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Cpu,
  ShieldCheck,
  Zap,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check mock storage first (even if Supabase is active)
    const users = mockStorage.getUsers();
    const mockUser = users.find(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() || 
      u.username.toLowerCase() === formData.email.toLowerCase()
    ) as any;

    if (mockUser) {
      // In mock mode, we accept 'password' OR the specific password set during signup
      const isValidPassword = formData.password === 'password' || 
                             formData.password === mockUser.password ||
                             (mockUser.username.toLowerCase() === 'dammy' && (formData.password === 'Broismail' || formData.password === 'Bro ismail'));
      
      if (isValidPassword) {
        // Simulate network delay for consistency
        await new Promise(resolve => setTimeout(resolve, 800));
        mockStorage.setCurrentUser(mockUser);
        navigate('/');
        setLoading(false);
        return;
      }
    }

    if (isMockMode) {
      // If we are here, it means mockUser was not found or password was wrong
      if (mockUser) {
        setError('Invalid password');
      } else {
        setError('User not found');
      }
      setLoading(false);
      return;
    }

    try {
      let loginEmail = formData.email;

      // If it's not an email format, try to find the email by username
      if (!loginEmail.includes('@')) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', loginEmail.toLowerCase())
          .single();
        
        if (profileData?.email) {
          loginEmail = profileData.email;
        } else if (profileError) {
          // If username lookup fails, we still try to sign in with the original input
          // but it will likely fail with "Invalid login credentials"
          console.error("Username lookup failed:", profileError);
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: formData.password,
      });
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      let errorMessage = err.message || 'Invalid email or password';
      
      // Provide more helpful message for unconfirmed emails
      if (errorMessage.toLowerCase().includes('email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      } else if (errorMessage.toLowerCase().includes('invalid login credentials')) {
        errorMessage = 'Invalid email/username or password. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-white rounded-2xl sm:rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex relative bg-gray-950 p-20 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000" 
              alt="Login Background" 
              className="w-full h-full object-cover opacity-30"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Cpu className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">DAMMY TECH</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              WELCOME BACK <br />
              <span className="text-cyan-400">TO THE FUTURE.</span>
            </h2>
            <p className="text-gray-400 text-base font-medium leading-relaxed max-w-sm">
              Access your personalized gadget dashboard and manage your futuristic collection.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-6">
            {[
              { label: 'Secure Auth', icon: ShieldCheck },
              { label: 'Fast Access', icon: Zap },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 text-white/80">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <item.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-6 sm:p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-6 sm:mb-10">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-3">Sign In</h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">Enter your credentials to access your account</p>
          </div>

          {successMessage && !error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 sm:p-5 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 sm:gap-4 text-green-700 text-xs sm:text-sm font-bold"
            >
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              {successMessage}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 sm:p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 sm:gap-4 text-red-700 text-xs sm:text-sm font-bold"
            >
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Username or Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 sm:pl-12 pr-5 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold text-sm sm:text-base"
                  placeholder="Username or email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500">Password</label>
                <a href="#" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-600 hover:text-cyan-700">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 sm:pl-12 pr-12 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold text-sm sm:text-base"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-medium text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-cyan-600 font-black uppercase tracking-widest text-[10px] sm:text-xs hover:underline ml-2">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
