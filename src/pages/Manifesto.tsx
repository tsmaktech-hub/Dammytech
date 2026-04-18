import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Eye, Heart, Shield, Cpu, ArrowLeft, Zap, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Manifesto = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000" 
            alt="Space Background" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-white" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-black uppercase tracking-[0.3em] mb-8"
          >
            <Rocket className="w-4 h-4 fill-cyan-400" />
            The Declaration
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-7xl font-black text-white tracking-tighter mb-6 leading-none"
          >
            DAMMYTECH <br /> <span className="text-cyan-500">MANIFESTO</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-200 text-lg sm:text-xl max-w-2xl mx-auto font-medium"
          >
            A roadmap to the digital frontier. Our commitment to innovation, excellence, and the evolution of technology in Nigeria.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 sm:px-8 lg:px-20 py-20 sm:py-32 -mt-20 relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 sm:gap-20">
            {/* Sidebar info */}
            <div className="lg:col-span-1 space-y-12">
              <div className="sticky top-32">
                <Link to="/" className="inline-flex items-center gap-2 text-cyan-600 font-black uppercase tracking-widest text-xs mb-12 hover:gap-4 transition-all group">
                  <ArrowLeft className="w-4 h-4" />
                  Return Home
                </Link>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Established</h4>
                    <p className="text-xl font-black text-gray-900 border-l-4 border-cyan-500 pl-4">2016 AD</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Location</h4>
                    <p className="text-xl font-black text-gray-900 border-l-4 border-cyan-500 pl-4">Lagos, Nigeria</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Mission Status</h4>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Operational
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Manifesto Text */}
            <div className="lg:col-span-2 space-y-24">
              {/* Point 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                    <Eye className="w-8 h-8 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 tracking-tight">The Vision of Convergence</h3>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                      At Dammytech, we don't see technology as just tools. we see it as the bridge between current reality and human potential. Our vision is to converge futuristic possibility with Nigerian innovation, ensuring that every citizen has a gateway to high-end, global technology.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Point 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                    <Shield className="w-8 h-8 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 tracking-tight">The Quality Invariant</h3>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                      Engineering excellence is not an option; it is our baseline. Every gadget listed under the Dammytech seal must pass our "Future-Ready" certification. We prioritize authentic circuitry over cheap imitations because we know that progress cannot be built on replicas.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Point 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                    <Target className="w-8 h-8 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 tracking-tight">Radical Accessibility</h3>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                      High-end tech should not be reserved for the few. Our commitment is to democratize access to the latest gadgets through fair pricing, nationwide delivery, and constant technical support. We are bringing 2030 to Lagos, Abuja, Port Harcourt, and every corner of this nation.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Point 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                    <Heart className="w-8 h-8 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6 tracking-tight">Built by Humans, for Humans</h3>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                      Behind every processor and screen is a person with a dream. Our store is designed to fuel those dreams. Whether you are a student coding the next big app or a business owner scaling your operations, Dammytech is your partner in evolution.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Manifesto Quote Box */}
              <div className="p-12 sm:p-20 bg-gray-950 rounded-[3rem] text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.15),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <Cpu className="w-12 h-12 text-cyan-500 mx-auto mb-10 animate-pulse" />
                <h2 className="text-2xl sm:text-5xl font-black text-white mb-8 tracking-tighter leading-tight italic">
                  "WE BELIEVE THAT THE LIMITS <br className="hidden sm:block" /> OF YOUR TOOLS SHOULD NOT <br className="hidden sm:block" /> LIMIT YOUR IMAGINATION."
                </h2>
                <div className="inline-flex items-center gap-3 text-cyan-500 font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs">
                  <div className="w-8 h-[2px] bg-cyan-500" />
                  Busari Ismail, Founder
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-gray-50 py-20 sm:py-32">
        <div className="px-4 sm:px-8 lg:px-20 grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-20">
          {[
            { label: 'Innovation Velocity', val: '98%', icon: Zap },
            { label: 'Network Reach', val: '200K+', icon: Users },
            { label: 'Uptime Reliability', val: '99.9%', icon: Shield },
            { label: 'Tech Curators', val: '150+', icon: Cpu },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 text-cyan-500 mx-auto mb-6" />
              <div className="text-3xl sm:text-5xl font-black text-gray-900 mb-2">{stat.val}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Manifesto;
