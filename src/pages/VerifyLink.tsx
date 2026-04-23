import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function VerifyLink() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleVerification = async () => {
      // Check if the link is a sign-in link
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        
        // If email is missing, ask the user (standard Firebase behavior)
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }

        if (!email) {
          setStatus('error');
          setError('Email is required to complete sign in.');
          return;
        }

        try {
          // Complete the sign in
          const result = await signInWithEmailLink(auth, email, window.location.href);
          const user = result.user;

          // Check if we have pending registration data
          const pendingDataStr = window.localStorage.getItem('pending_signup');
          
          if (pendingDataStr) {
            const pendingData = JSON.parse(pendingDataStr);
            
            // Re-verify the email matches (extra security)
            if (pendingData.email.toLowerCase() === email.toLowerCase()) {
              // Check if profile already exists (maybe they just logged in)
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              
              if (!userDoc.empty && userDoc.exists()) {
                console.log("User profile already exists, skipping creation");
              } else {
                // Create user profile in Firestore
                const isAdmin = pendingData.username.toLowerCase() === 'dammy';
                await setDoc(doc(db, 'users', user.uid), {
                  id: user.uid,
                  username: pendingData.username.toLowerCase(),
                  email: pendingData.email.toLowerCase(),
                  full_name: pendingData.fullName,
                  phone_number: pendingData.phoneNumber,
                  role: isAdmin ? 'admin' : 'user',
                  avatar_url: '',
                  created_at: serverTimestamp(),
                  updated_at: serverTimestamp()
                });
              }
            }
          }

          // Cleanup
          window.localStorage.removeItem('emailForSignIn');
          window.localStorage.removeItem('pending_signup');

          setStatus('success');
          // Navigate after a short delay to show success state
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } catch (err: any) {
          console.error("Verification error:", err);
          setStatus('error');
          setError(err.message || 'Failed to verify link. It may have expired.');
        }
      } else {
        setStatus('error');
        setError('Invalid or expired verification link.');
      }
    };

    handleVerification();
  }, [navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-gray-100 text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-20 h-20 bg-gray-950 rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl">
              <Cpu className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
        </div>

        {status === 'verifying' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Verifying Link</h2>
              <p className="text-gray-500 text-sm font-medium">Please wait while we secure your connection...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Verified!</h2>
              <p className="text-gray-500 text-sm font-medium">Welcome to DammyTech. Redirecting you now...</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Oops!</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">{error}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all"
              >
                Try Signing Up Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-white text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-gray-100 hover:bg-gray-50 transition-all"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-center gap-2 text-gray-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">End-to-End Secure Auth</span>
        </div>
      </motion.div>
    </div>
  );
}
