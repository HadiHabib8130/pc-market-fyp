import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  RefreshCw, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Package, 
  ExternalLink,
  Sparkles,
  Search,
  DollarSign
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scope, setScope] = useState('my'); // 'my' or 'all'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardMatches();
  }, [scope]);

  const fetchDashboardMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError("You are not logged in. Please log in to view the Seller Dashboard.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `https://hadi8130.pythonanywhere.com/api/products/listings/dashboard-bids/`,
        {
          params: { scope },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setMatches(response.data || response.data);
    } catch (err) {
      console.error("Failed to fetch dashboard bids:", err);
      setError("Unable to retrieve spread data. Please make sure the backend Django server is running.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val) => {
    return Number(val).toLocaleString('en-US');
  };

  // Local filtering by search input
  const filteredMatches = matches.filter((item) => {
    const query = searchQuery.toLowerCase();
    const brand = item.master_product?.brand?.toLowerCase() || '';
    const model = item.master_product?.model_name?.toLowerCase() || '';
    const category = item.master_product?.category?.toLowerCase() || '';
    const seller = item.seller_username?.toLowerCase() || '';
    const buyer = item.best_bid?.buyer_username?.toLowerCase() || '';
    return brand.includes(query) || model.includes(query) || category.includes(query) || seller.includes(query) || buyer.includes(query);
  });

  // Spread heat index styling
  const getGapStyling = (gap, price) => {
    const ratio = (gap / price) * 100;
    if (gap <= 0) {
      return {
        badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse',
        label: 'Direct Match! (Negative Gap)',
        container: 'border-emerald-500/30 bg-emerald-500/[0.02]',
        barColor: 'bg-emerald-500'
      };
    } else if (gap < 5000 || ratio < 10) {
      return {
        badge: 'bg-teal-500/10 text-teal-400 border border-teal-500/30',
        label: 'Tight Spread (Highly Liquid)',
        container: 'border-teal-500/20 bg-teal-500/[0.01]',
        barColor: 'bg-teal-400'
      };
    } else if (gap < 15000 || ratio < 25) {
      return {
        badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
        label: 'Fair Spread (Active Bidding)',
        container: 'border-blue-500/10 bg-blue-500/[0.005]',
        barColor: 'bg-blue-400'
      };
    } else {
      return {
        badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
        label: 'Wide Spread (Negotiation Needed)',
        container: 'border-slate-800 bg-transparent',
        barColor: 'bg-purple-500'
      };
    }
  };

  const getConditionStyle = (cond) => {
    switch (cond?.toUpperCase()) {
      case 'NEW':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'OPEN':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* --- HEADER BANNER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <TrendingUp size={240} className="text-blue-500 translate-x-20 -translate-y-10" />
          </div>
          
          <div className="space-y-1.5 z-10">
            <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Sparkles size={11} /> Real-time Matchmaking Engine
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Spread-Matching Dashboard
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Track listings matched with active buyer bids. Ordered by the closest spread (minimum gap) at the top to accelerate your sales turnover.
            </p>
          </div>

          {/* Scope Toggle Switch */}
          <div className="flex bg-slate-950 p-1.5 border border-slate-800 rounded-2xl z-10 self-start md:self-auto h-fit">
            <button
              onClick={() => setScope('my')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${scope === 'my' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              My Listings
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${scope === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              All Matches
            </button>
          </div>
        </div>

        {/* --- CONTROLS AND STATS --- */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/20 border border-slate-800/80 p-4 rounded-2xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search matches by brand, model, buyer, or category..."
              className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-blue-600/80 transition-colors text-sm text-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 text-xs font-bold w-full md:w-auto justify-end">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
              Spreads Computed: <span className="text-blue-400 ml-1">{matches.length}</span>
            </div>
            <button
              onClick={fetchDashboardMatches}
              className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition text-slate-400 hover:text-white"
              title="Refresh order book"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* --- ERROR VIEW --- */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-red-400">Authentication Required</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <button 
              onClick={() => navigate('/seller-hub/login')} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition uppercase tracking-wider"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* --- LOADING VIEW --- */}
        {loading && !error && (
          <div className="py-24 text-center space-y-4">
            <div className="animate-spin text-blue-500 text-3xl font-black inline-block">⚙️</div>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Calculating Spreads & Sorting Order Depth...</p>
          </div>
        )}

        {/* --- ORDERS SPREAD CONTAINER --- */}
        {!loading && !error && (
          filteredMatches.length > 0 ? (
            <div className="space-y-6">
              {filteredMatches.map((item, idx) => {
                const styles = getGapStyling(item.gap, item.price);
                return (
                  <div
                    key={item.id}
                    className={`border rounded-[2rem] p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 flex flex-col lg:flex-row gap-6 items-center justify-between group relative overflow-hidden ${styles.container}`}
                  >
                    {/* Rank Ribbon Accent */}
                    <div className="absolute left-0 top-0 bg-blue-600/10 border-r border-b border-slate-800 text-[10px] px-3.5 py-1.5 rounded-br-2xl font-black text-blue-400">
                      MATCH #{idx + 1}
                    </div>
                    
                    {/* LEFT COLUMN: SELL SIDE (The Listing) */}
                    <div className="w-full lg:w-[35%] space-y-4">
                      <div className="flex gap-4 items-start pt-4 lg:pt-0">
                        <div className="w-16 h-16 bg-white rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center border border-slate-800">
                          <img 
                            src={item.master_product?.stock_image_url} 
                            className="w-full h-full object-contain" 
                            alt="Product" 
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-widest font-extrabold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                            {item.master_product?.category}
                          </span>
                          <h3 className="font-extrabold text-white text-base leading-tight">
                            {item.master_product?.brand}
                          </h3>
                          <p className="text-slate-400 text-xs font-semibold">
                            {item.master_product?.model_name}
                          </p>
                        </div>
                      </div>

                      {/* Sell Details */}
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="text-slate-500 font-bold mb-0.5">Seller (Ask)</p>
                          <p className="text-slate-400 font-medium">@{item.seller_username}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold mr-2 ${getConditionStyle(item.condition)}`}>
                            {item.condition}
                          </span>
                          <span className="font-black text-sm text-slate-100">
                            Rs. {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CENTER COLUMN: THE GAP & DYNAMIC PROGRESS BAR */}
                    <div className="w-full lg:w-[25%] flex flex-col items-center justify-center text-center space-y-2.5 px-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${styles.badge}`}>
                        {styles.label}
                      </span>
                      
                      <div className="space-y-1">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Asking Price Spread</p>
                        <p className="text-2xl font-black text-blue-400 tracking-tight">
                          Rs. {formatPrice(item.gap)}
                        </p>
                      </div>

                      {/* Spread Gap Meter */}
                      <div className="w-full bg-slate-950 border border-slate-900 h-2.5 rounded-full overflow-hidden p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${styles.barColor}`}
                          style={{ 
                            width: `${Math.max(5, Math.min(100, 100 - (item.gap / item.price * 100)))}%` 
                          }}
                        />
                      </div>
                      
                      <span className="text-[10px] font-bold text-slate-400">
                        {((item.gap / item.price) * 100).toFixed(1)}% premium over bid
                      </span>
                    </div>

                    {/* RIGHT COLUMN: BUY SIDE (The best BuyOrder) */}
                    <div className="w-full lg:w-[35%] flex flex-col md:flex-row items-center gap-4 justify-between border-t lg:border-t-0 border-slate-800/50 pt-4 lg:pt-0">
                      
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <User size={13} className="text-slate-500" />
                          <span className="text-slate-400 font-semibold">Buyer Bid</span>
                          <span className="text-blue-400 font-extrabold">@{item.best_bid?.buyer_username}</span>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3.5 flex justify-between items-center text-xs">
                          <div>
                            <p className="text-slate-500 font-bold mb-0.5">Buyer Wants</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getConditionStyle(item.best_bid?.condition)}`}>
                              {item.best_bid?.condition || 'Used'}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">
                              {item.best_bid?.requires_warranty ? 'Wants Warranty' : 'No Warranty'}
                            </p>
                            <span className="font-black text-sm text-blue-400">
                              Rs. {formatPrice(item.best_bid?.bid_price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Trade / Market Action Link */}
                      <button
                        onClick={() => navigate(`/market/${item.master_product?.id}`)}
                        className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-3 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition hover:shadow-lg active:scale-95 whitespace-nowrap"
                      >
                        Trade <ExternalLink size={13} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-900/15 border border-dashed border-slate-800 rounded-3xl space-y-6">
              <div className="w-16 h-16 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
                <Layers size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white">No Spread Matches Found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  {scope === 'my' 
                    ? "None of your active inventory listings currently have pending buyer bids placed on their matching model catalog entries."
                    : "No active marketplace listings match with active pending buyer orders on the catalog."}
                </p>
              </div>
              {scope === 'my' && (
                <button 
                  onClick={() => setScope('all')}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Inspect All Market Matches
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
