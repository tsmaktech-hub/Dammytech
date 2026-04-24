import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth, checkActionCode, applyActionCode } from '../lib/firebase';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Loader2,
  Cpu,
  Mail
} from 'lucide-react';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'confirming' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (mode === 'verifyEmail' && oobCode) {
      handleCheckCode();
    } else {
      setStatus('error');
      setError('Invalid or expired verification link.');
    }
  }, [mode, oobCode]);

  const handleCheckCode = async () => {
    try {
      const info = await checkActionCode(auth, oobCode!);
      setEmail(info.data.email || '');
      setStatus('confirming');
    } catch (err: any) {
      console.error("Check action code error:", err);
      setStatus('error');
      setError(err.message || 'The verification link is invalid or has already been used.');
    }
  };

  const handleConfirm = async () => {
    setStatus('loading');
    try {
      await applyActionCode(auth, oobCode!);
      setStatus('success');
      // Optional: Auto-redirect after some time
    } catch (err: any) {
      console.error("Apply action code error:", err);
      setStatus('error');
      setError(err.message || 'Failed to verify email. Please try again.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-950 p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-6">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">Email Verification</h1>
        </div>

        <div className="p-8 sm:p-12">
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Processing request...</p>
            </div>
          )}

          {status === 'confirming' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Ready to Verify?</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Click the button below to confirm that <span className="text-cyan-600 font-bold">{email}</span> belongs to you.
              </p>
              <button
                onClick={handleConfirm}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 group"
              >
                Confirm Verification
                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Verified Successfully</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Your account is now active. You can proceed to log in and start your journey.
              </p>
              <Link
                to="/login"
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 group"
              >
                Continue to Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Verification Failed</h2>
              <p className="text-red-500 text-sm font-medium mb-8 leading-relaxed">
                {error}
              </p>
              <Link
                to="/signup"
                className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
              >
                Back to Signup
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
