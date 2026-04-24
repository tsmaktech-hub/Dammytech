import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  Cpu,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      // Check if username is taken
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', formData.username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Username already taken');
      }

      // Check if email is already used in Firestore
      const emailQ = query(usersRef, where('email', '==', formData.email.toLowerCase()));
      const emailSnapshot = await getDocs(emailQ);
      if (!emailSnapshot.empty) {
        throw new Error('Email already registered');
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const isAdmin = formData.username.toLowerCase() === 'dammy' || 
                      formData.email.toLowerCase() === 'ibusari127@gmail.com';
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        username: formData.username.toLowerCase(),
        email: formData.email.toLowerCase(),
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        role: isAdmin ? 'admin' : 'user',
        avatar_url: '',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      navigate('/');
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || 'Failed to create account');
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
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000" 
              alt="Signup Background" 
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
              JOIN THE <br />
              <span className="text-cyan-400">REVOLUTION.</span>
            </h2>
            <p className="text-gray-400 text-base font-medium leading-relaxed max-w-sm">
              Create your account and secure your access to the future of technology.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-6">
            {[
              { label: 'Secure Auth', icon: ShieldCheck },
              { label: 'Instant Flow', icon: Zap },
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
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6 sm:mb-10">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-3">Create Account</h1>
              <p className="text-gray-500 font-medium text-xs sm:text-sm">Join our futuristic community today</p>
            </div>

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

            <form onSubmit={handleSignupSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 sm:pl-12 pr-5 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold text-sm sm:text-base"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Username</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px] sm:text-xs group-focus-within:text-cyan-500 transition-colors">@</span>
                    <input
                      type="text"
                      required
                      className="w-full pl-8 sm:pl-10 pr-5 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold text-sm sm:text-base"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 sm:pl-12 pr-5 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold text-sm sm:text-base"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input
                      type="tel"
                      required
                      className="w-full pl-10 sm:pl-12 pr-5 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold text-sm sm:text-base"
                      placeholder="+1 234 567 890"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Password</label>
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
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full pl-10 sm:pl-12 pr-12 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-semibold text-sm sm:text-base"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-medium text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-600 font-black uppercase tracking-widest text-[10px] sm:text-xs hover:underline ml-2">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

