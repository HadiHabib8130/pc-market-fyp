import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Zap, Cpu, LayoutGrid, LogIn, UserPlus, LogOut, 
  User, Settings, ShoppingBag, ChevronDown, ArrowRight, 
  Activity, ShieldCheck, RefreshCw, Layers, HardDrive 
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const MarketplaceMain = () => {
  const navigate = useNavigate();
  
  // Marketplace states
  const [masterProducts, setMasterProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication & Dropdown states
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // RESTORED: Keeping your working short keys exactly as they were!
  const categories = [
    { id: 'All', icon: <LayoutGrid size={15} /> },
    { id: 'GPU', icon: <Zap size={15} /> },   
    { id: 'CPU', icon: <Cpu size={15} /> },       
    { id: 'RAM', icon: <Layers size={15} /> },          
    { id: 'SSD', icon: <HardDrive size={15} /> }, 
    { id: 'HDD', icon: <HardDrive size={15} /> },  
    { id: 'PSU', icon: <Zap size={15} /> },     
    { id: 'MOBO', icon: <Cpu size={15} /> }, // Directly using 'MOBO' so it loads on click!
    { id: 'COOLER', icon: <Activity size={15} /> }, // Directly using 'COOLER' so it loads on click!
    { id: 'CASE', icon: <LayoutGrid size={15} /> },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, [category, searchQuery]);

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // CRITICAL DIAGNOSTIC LOGS
      console.log("---- MARKETPLACE IDENT DATA READ ----");
      console.log("RAW AXIOS DATA:", response.data);
      console.log("-------------------------------------");

      setUser(response.data);
    } catch (err) {
      console.error("Session fetch failed", err);
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setDropdownOpen(false);
    alert("Logged out successfully.");
    navigate('/');
  };

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/products/master-list/', {
        params: { 
          category: category !== 'All' ? category : '',
          q: searchQuery 
        }
      });
      setMasterProducts(response.data);
    } catch (err) {
      console.error("Market fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper filter function
  const filterBySpecificCategory = (catType) => {
    return masterProducts.filter(p => p.category === catType).slice(0, 4);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans">
      
      {/* GLOBAL NAVIGATION HEADER */}
      <nav className="border-b border-slate-900 bg-slate-950/80 px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <Link to="/" className="text-lg font-black tracking-tighter uppercase italic flex-shrink-0">
            THE HARDWARE <span className="text-blue-500">EXCHANGE</span>
          </Link>

          <div className="relative max-w-xl w-full hidden sm:block">
            <input 
              type="text" 
              placeholder="Search components, models, brands..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 text-xs py-2.5 pl-10 pr-4 rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-slate-200 placeholder-slate-500"
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
          </div>

          <div className="flex items-center gap-4 text-xs font-bold flex-shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 pr-3 rounded-xl hover:border-slate-700 transition-all cursor-pointer"
                >
                  {user.profile_picture ? (
                    <img src={user.profile_picture} className="w-7 h-7 rounded-lg object-cover border border-slate-800" alt="avatar" />
                  ) : (
                    <div className="w-7 h-7 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/20">
                      <User size={14} />
                    </div>
                  )}
                  <span className="text-slate-300 font-semibold max-w-[100px] truncate">@{user.display_name}</span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1.5 space-y-0.5 z-50">
                    <Link to="/account/info" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition-colors">
                      <User size={15} className="text-slate-500" /> Account Information
                    </Link>
                    <Link to="/buyer/bids" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition-colors">
                      <ShoppingBag size={15} className="text-slate-500" /> My Buy Orders
                    </Link>
                    <Link to="/account/edit" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition-colors">
                      <Settings size={15} className="text-slate-500" /> Edit Information
                    </Link>
                    <div className="border-t border-slate-900 my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-left transition-colors cursor-pointer">
                      <LogOut size={15} /> Sign Out Session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login-buyer" className="text-slate-400 hover:text-white px-3 py-2 flex items-center gap-1.5 transition-colors">
                  <LogIn size={14} /> Log In
                </Link>
                <Link to="/register-buyer" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/10 transition-all">
                  <UserPlus size={14} /> Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-12">
        
        {/* LOCALIZED PLATFORM MANIFESTO */}
        <section className="bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Market Innovation
            </span>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase italic">
              Pakistan's First <span className="text-blue-500">Order Book</span> For PC Component Hardware.
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Traditional tech markets rely on static, inflated pricing windows dictated entirely by middleman retail loops. **The Hardware Exchange changes the landscape completely.** We introduce the first domestic community ecosystem driven by a raw **Live Bid/Ask Spread Engine**. Buyers set maximum purchase limits, local sellers list real active stock, and trades execute instantly when matching thresholds cross. Zero hidden margins—just transparent, real-time market value discovery across Pakistan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="flex items-start gap-2.5 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                <RefreshCw size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-200">Zero Fixed Retail Markup</h4>
                  <p className="text-slate-500 mt-1">Sellers compete downward live while buyers signal authentic regional market demand levels.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                <Activity size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-200">Live Local Order Book</h4>
                  <p className="text-slate-500 mt-1">Directly analyze lines of supply depths versus active buying capital bids across major hubs.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                <ShieldCheck size={18} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-200">Verified Marketplace Escrow</h4>
                  <p className="text-slate-500 mt-1">Every custom trade profile logs authenticated hardware specs, serial indicators, and warranty terms.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FIXED CATEGORY CHIPS BAR: NO SCROLLBAR + FULL FLEX FLEX-WRAP DISPLAY */}
        <div className="py-2 border-b border-slate-900/40">
          <div className="flex flex-wrap gap-2.5 justify-start sm:justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                  category === cat.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat.icon} {cat.id}
              </button>
            ))}
          </div>
        </div>

        {/* DYNAMIC RENDERING BLOCK SYSTEM */}
        {category === 'All' && searchQuery === '' ? (
          <div className="space-y-12">
            {[
              { key: 'GPU', display: 'Graphics Cards' },
              { key: 'CPU', display: 'Processors' },
              { key: 'RAM', display: 'Memory' },
              { key: 'SSD', display: 'Solid State Drives' },
              { key: 'HDD', display: 'Hard Disk Drives' },
              { key: 'PSU', display: 'Power Supplies' },
              
              // SYNCED MAP KEYS HERE:
              { key: 'MOBO', display: 'Motherboards' },
              { key: 'COOLER', display: 'CPU Coolers' },
              
              { key: 'CASE', display: 'Casings' }
            ].map((cat) => {
              const segmentedProducts = filterBySpecificCategory(cat.key);
              if (segmentedProducts.length === 0) return null;

              return (
                <section key={cat.key} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <h2 className="text-sm font-black tracking-wider uppercase text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-blue-500 rounded-sm" /> Most Popular {cat.display}
                    </h2>
                    <button onClick={() => setCategory(cat.key)} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors cursor-pointer">
                      View Entire Stock <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {segmentedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* IF FILTERED BY CATEGORY OR SEARCHED, DISPLAY STANDARD TARGETED GRID */
          <section className="space-y-6">
            <h2 className="text-sm font-black tracking-wider uppercase text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-blue-500 rounded-sm" />
              {searchQuery ? 'Search Results' : `Filtered Category: ${category}`}
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-900/30 animate-pulse rounded-2xl" />)}
              </div>
            ) : masterProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {masterProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/10 border border-dashed border-slate-800/60 rounded-2xl">
                <p className="text-slate-500 text-xs italic">No matching active database objects found tagged as "{category}".</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

/* INTERNAL REUSABLE ISOLATED PRODUCT CARD COMPONENT */
const ProductCard = ({ product }) => {
  return (
    <Link 
      to={`/market/${product.id}`} 
      className="group bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden hover:bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col"
    >
      <div className="h-40 bg-white p-6 relative overflow-hidden flex items-center justify-center">
        <img src={product.stock_image_url} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" alt={product.model_name} />
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{product.brand}</span>
          <h3 className="text-sm font-bold leading-tight mt-0.5 line-clamp-2 text-slate-200">{product.model_name}</h3>
        </div>

        <div className="pt-3 border-t border-slate-900 grid grid-cols-2 gap-2">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Lowest Ask</p>
            <p className="text-green-400 font-mono font-bold text-xs mt-0.5">
              {product.min_sell ? `Rs ${Math.floor(product.min_sell).toLocaleString()}` : '---'}
            </p>
          </div>
          <div className="border-l border-slate-900 pl-3">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Highest Bid</p>
            <p className="text-blue-400 font-mono font-bold text-xs mt-0.5">
              {product.max_buy ? `Rs ${Math.floor(product.max_buy).toLocaleString()}` : '---'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MarketplaceMain;