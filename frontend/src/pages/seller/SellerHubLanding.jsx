import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck, Zap } from 'lucide-react';

const SellerHubLanding = () => {
  return (
    /* Added pt-20 (padding-top) to give it space from the browser search bar */
    <div className="min-h-screen bg-slate-950 px-6 pt-20 pb-20 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section (16:9 Aspect Ratio) */}
        <div className="aspect-video w-full bg-gradient-to-br from-blue-900/20 to-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Zap size={200} className="text-blue-500" />
          </div>
          
          <h1 className="text-6xl font-black tracking-tighter mb-6">
            Welcome to <span className="text-blue-500 font-black">Seller Hub</span>
          </h1>
          <p className="text-slate-400 max-w-xl mb-10 text-lg leading-relaxed">
            The most advanced platform for PC hardware enthusiasts in Pakistan. 
            Manage inventory, track sales, and connect with buyers in real-time.
          </p>

          <div className="flex gap-6 z-10">
            <Link 
              to="/seller-hub/login" 
              className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all border border-slate-700 active:scale-95"
            >
              <LogIn size={20} /> Login
            </Link>
            <Link 
              to="/seller-hub/register" 
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95"
            >
              <UserPlus size={20} /> Sign Up
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="group bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-start gap-6 hover:border-blue-500/30 transition-all">
            <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 text-white">Verified Trading</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Our tier-based verification ensures only legitimate sellers enter the market, protecting your business reputation.</p>
            </div>
          </div>
          
          <div className="group bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-start gap-6 hover:border-green-500/30 transition-all">
            <div className="bg-green-500/10 p-4 rounded-2xl text-green-400 group-hover:scale-110 transition-transform">
                <Zap size={28} />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 text-white">Instant Analytics</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Track your 7-day revenue, monitor price spreads, and find profit opportunities with our custom toolkit.</p>
            </div>
          </div>
        </div>

        {/* Back to Market Link */}
        <div className="mt-12 text-center">
            <Link to="/" className="text-slate-600 hover:text-blue-500 text-sm font-bold uppercase tracking-[0.2em] transition-colors">
               ← Exit to Marketplace
            </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerHubLanding;