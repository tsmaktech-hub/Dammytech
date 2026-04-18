import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  Cpu,
  ShieldCheck,
  Zap,
  Smartphone,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'verify' | 'success'>('verify');
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Verify identity via email and phone number in Firestore
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('email', '==', formData.email.toLowerCase()),
        where('phone_number', '==', formData.phoneNumber)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Identity verification failed. Please ensure the email and phone number match your account.');
      }

      // Step 2: On successful verification, trigger the secure Firebase reset
      await sendPasswordResetEmail(auth, formData.email);
      setStep('success');
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || 'Failed to verify identity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-12">
      <div className="max-w-xl w-full">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors mb-8 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-cyan-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back to Sign In</span>
        </Link>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 p-8 sm:p-12">
          <AnimatePresence mode="wait">
            {step === 'verify' ? (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-10 text-center">
                  <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="w-8 h-8 text-cyan-500" />
                  </div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Account Recovery</h1>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed px-4">
                    Verify your identity by providing the email and phone number used during registration.
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700 text-xs sm:text-sm font-bold"
                  >
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input
                        type="email"
                        required
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white outline-none transition-all font-semibold"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input
                        type="tel"
                        required
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white outline-none transition-all font-semibold"
                        placeholder="+1 234 567 890"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify Identity
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4 leading-tight">Identity Confirmed!</h1>
                <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10 px-4">
                  We've verified your account details. A <span className="text-cyan-600 font-bold underline decoration-cyan-200 underline-offset-4">secure password reset link</span> has been sent to your email address.
                </p>
                
                <div className="space-y-4 max-w-sm mx-auto">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200"
                  >
                    Sign In Now
                  </button>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] pt-4">
                    Check your inbox and follow the instructions
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 py-3 px-6 bg-gray-50 rounded-full border border-gray-100">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Recovery System Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
