import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../App';

export default function AuthChoice() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 sm:mb-20"
      >
        <Logo className="scale-110 sm:scale-150" />
      </motion.div>
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Login Option */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="group relative bg-white rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
          
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 transition-transform">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            Access your account to manage your listings, track orders, and explore the latest tech.
          </p>
          
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-xl shadow-gray-200 group/btn"
          >
            Login to Account
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        {/* Signup Option */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="group relative bg-gray-900 rounded-[2.5rem] p-8 sm:p-12 border border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
          
          <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:-rotate-6 transition-transform">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">New Explorer?</h2>
          <p className="text-gray-400 font-medium mb-10 leading-relaxed">
            Join the elite community of tech enthusiasts. Explore and buy futuristic gadgets today.
          </p>
          
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 group/btn"
          >
            Create Account
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
