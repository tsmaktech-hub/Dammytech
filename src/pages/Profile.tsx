import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, doc, updateDoc, deleteDoc } from '../lib/firebase';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  User as UserIcon, 
  UserCircle, 
  Mail, 
  Phone, 
  Edit2, 
  X, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Trash2,
  ChevronLeft,
  Calendar,
  Shield,
  Cpu
} from 'lucide-react';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(profile?.phone_number || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) setNewPhone(profile.phone_number);
  }, [profile]);

  if (!profile) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
        <UserCircle className="w-10 h-10 text-gray-300" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Profile Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-sm font-medium">Please sign in to view and manage your profile details.</p>
      <Link 
        to="/login" 
        className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200"
      >
        Sign In Now
      </Link>
    </div>
  );

  const handleUpdatePhone = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', profile.id);
      await updateDoc(userRef, { phone_number: newPhone });
      await refreshProfile();
      setIsEditingPhone(false);
      setSuccess('Phone number updated!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, profile.email);
      setSuccess('Password reset link sent to email!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const authUser = auth.currentUser;
      if (!authUser) throw new Error('No user logged in');
      
      await deleteDoc(doc(db, 'users', profile.id));
      await deleteUser(authUser);
      
      navigate('/auth');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError('Please log out and log in again to delete your account.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-gray-100">
          <div className="space-y-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors group mb-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-cyan-50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Store</span>
            </Link>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-2xl shadow-cyan-200 border-4 border-white shrink-0">
                {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                  {profile.full_name}
                </h1>
                <div className="flex items-center gap-2 text-cyan-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    {profile.role === 'admin' ? 'Elite Admin' : 'Premium Member'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Joined {new Date(profile.created_at).toLocaleDateString()}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 sm:p-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-500">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Account Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <p className="text-sm font-bold text-gray-900">{profile.full_name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Username</label>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <UserCircle className="w-5 h-5 text-gray-400" />
                    <p className="text-sm font-bold text-gray-900">@{profile.username}</p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <p className="text-sm font-bold text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all focus-within:border-cyan-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-cyan-500/5">
                      <Phone className="w-5 h-5 text-gray-400" />
                      {isEditingPhone ? (
                        <div className="flex items-center gap-3 w-full">
                          <input 
                            type="tel"
                            className="bg-transparent text-sm font-bold text-gray-900 outline-none w-full"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={handleUpdatePhone}
                              disabled={loading}
                              className="p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setIsEditingPhone(false)}
                              className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <p className="text-sm font-bold text-gray-900">{profile.phone_number}</p>
                          <button 
                            onClick={() => setIsEditingPhone(true)}
                            className="p-2 hover:bg-cyan-100 text-cyan-600 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 text-xs font-bold"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Side Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest pl-1">Security & Data</h3>
              
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-5 bg-gray-50 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all border border-gray-100 flex items-center justify-center gap-3 group"
              >
                <ShieldCheck className="w-5 h-5 text-cyan-500 group-hover:rotate-12 transition-transform" />
                Change Password
              </button>

              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                disabled={loading}
                className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center gap-3 group"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Delete Account
              </button>

              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-6 bg-red-600 rounded-3xl text-white space-y-4 shadow-xl shadow-red-200"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-white animate-pulse" />
                      <h4 className="font-black uppercase tracking-widest text-xs">Confirm Deletion</h4>
                    </div>
                    <p className="text-[10px] font-bold leading-relaxed opacity-90">
                      This action is final. You will lose access to all orders and personalized settings.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="py-3 bg-white/20 hover:bg-white/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="py-3 bg-white text-red-600 hover:bg-red-50 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
                      >
                        {loading ? '...' : 'I am sure'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] text-white shadow-xl shadow-gray-200">
               <Cpu className="w-8 h-8 text-cyan-400 mb-4" />
               <h4 className="text-lg font-black uppercase tracking-tight mb-2">Member Since 2026</h4>
               <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                  Verified account member of the DammyTech Digital Frontier.
               </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
