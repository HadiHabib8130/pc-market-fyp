import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, MapPin, ArrowLeft, PlusCircle, ShoppingCart, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

const MarketTradingRoom = () => {
  const { id } = useParams(); // Grabs the Master Product ID from the URL path
  const navigate = useNavigate();
  
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: Form State variables for our hardware specs
  const [bidPrice, setBidPrice] = useState('');
  const [condition, setCondition] = useState('used');
  const [requiresWarranty, setRequiresWarranty] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTradingRoomData();
  }, [id]);

  const fetchTradingRoomData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/products/market/${id}/`);
      setMarketData(response.data);
    } catch (err) {
      console.error("Failed to fetch trading room depth", err);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle Live Bid Placement
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    // 1. FRONTEND BOUNCER: Check authentication status and gate roles
    if (!token) {
      alert("Authentication Required: Please sign up or log in as a buyer to place a bid.");
      navigate('/login-buyer');
      return;
    }

    if (role !== 'buyer') {
      setFormError("Access Denied: Merchant/Seller accounts cannot place buying orders.");
      return;
    }

    setSubmitting(true);
    try {
      // 2. Execute secure API request to our custom endpoint
      await axios.post(
        'http://127.0.0.1:8000/api/market/place-order/', 
        {
          master_product: id,
          bid_price: bidPrice,
          condition: condition,
          requires_warranty: requiresWarranty
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert("Bid submitted successfully to the order book!");
      
      // Reset form controls cleanly
      setBidPrice('');
      setCondition('used');
      setRequiresWarranty(false);
      
      // 3. RE-FETCH DATA: Updates trading floor automatically without a page reload!
      fetchTradingRoomData();

    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Your session has expired. Please sign in again.");
        navigate('/login-buyer');
      } else {
        setFormError(err.response?.data?.detail || "Failed to broadcast order to market.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 font-mono animate-pulse">Loading Market Depth...</p>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center">
        <p className="text-red-400">Product not found in the exchange market.</p>
      </div>
    );
  }

  const { product, sell_orders, buy_orders } = marketData;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BACK TO MARKET OVERVIEW */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors">
          <ArrowLeft size={16} /> Back to Exchange Overview
        </Link>

        {/* TOP: MASTER PRODUCT BANNER */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-48 h-48 bg-white p-4 rounded-2xl flex-shrink-0">
            <img src={product.stock_image_url} className="w-full h-full object-contain" alt={product.model_name} />
          </div>
          <div className="space-y-3 text-center md:text-left flex-1">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">{product.brand}</span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight mt-1">{product.model_name}</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Trading profile for {product.model_name}. Select an active ask to buy immediately, or set your custom price terms using the bid system below.
            </p>
          </div>
        </div>

        {/* BOTTOM: THE TRADING FLOOR (SPLIT SCREEN) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT SIDE: SELL ORDERS (ASK DEPTH) */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-green-400">Available Sell Orders</h2>
              <span className="text-xs font-mono text-slate-500">{sell_orders.length} Sellers</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
              {sell_orders.length > 0 ? (
                sell_orders.map((order) => (
                  <Link 
                    to={`/listing/${order.id}`}
                    key={order.id} 
                    className="block bg-slate-900/50 border border-slate-800 hover:border-green-500/30 p-4 rounded-xl transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 group-hover:text-green-400 transition-colors">
                            {order.seller_name || "Verified Seller"}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            order.condition === 'New' || order.condition === 'box_pack' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {order.condition === 'box_pack' ? 'Box Pack' : order.condition}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {order.location || "Local"}</span>
                          <span className="flex items-center gap-1">
                            <Shield size={12} /> {order.warranty ? `${order.warranty} Warranty` : "No Warranty"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium">Buy Direct</p>
                        <p className="text-xl font-mono font-black text-green-400">Rs {Math.floor(order.price).toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-600 text-sm italic">No merchants currently matching this spec model listing.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: BUY ORDERS (BID DEPTH + INTERACTIVE PLACEMENT PANEL) */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-blue-400">Active Buy Bids</h2>
              <span className="text-xs font-mono text-slate-500">{buy_orders.length} Bidders</span>
            </div>

            {/* NEW: INTERACTIVE LIVE BID OFFER FORM PANEL */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShoppingCart size={14} className="text-blue-500" /> Open A Custom Market Order
              </h3>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handlePlaceBid} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-sm">Rs</span>
                    <input 
                      type="number" 
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      required
                      placeholder="Offer Price"
                      className="w-full bg-slate-900 border border-slate-800 py-2.5 pl-9 pr-3 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <select 
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 py-2.5 px-3 rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer text-sm font-medium"
                    >
                      <option value="used">Used Item</option>
                      <option value="box_pack">Box Pack (Sealed)</option>
                      <option value="new">Brand New (Open Box)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={requiresWarranty}
                        onChange={(e) => setRequiresWarranty(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 bg-slate-950 border-2 border-slate-700 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
                        <ShieldCheck size={14} className={`text-white transition-transform ${requiresWarranty ? 'scale-100' : 'scale-0'}`} />
                      </div>
                    </div>
                    <span className="text-slate-400 font-medium tracking-wide">Require active warranty</span>
                  </label>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 tracking-wide text-sm"
                  >
                    {submitting ? "Broadcasting..." : "Broadcast Bid"}
                  </button>
                </div>
              </form>
            </div>

            {/* ORDER DEPTH BOOK FEED */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {buy_orders.length > 0 ? (
                buy_orders.map((bid) => (
                  <Link 
                    
                    key={bid.id} 
                    to={`/bid/${bid.id}`} 
                    className="block bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 p-4 rounded-xl transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      
                      {/* LEFT SIDE: Buyer Info, Condition, & Warranty */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                            {bid.buyer_name || "Verified Buyer"}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            bid.condition === 'new' || bid.condition === 'box_pack' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {bid.condition === 'box_pack' ? 'Box Pack' : bid.condition}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Shield size={12} /> 
                            {bid.requires_warranty ? "Requires Valid Warranty" : "Non-Warranty OK"}
                          </span>
                        </div>
                      </div>

                      {/* RIGHT SIDE: Price */}
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium">Offer Price</p>
                        <p className="text-xl font-mono font-black text-blue-400">
                          Rs {Math.floor(bid.bid_price).toLocaleString()}
                        </p>
                      </div>

                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2">
                  <p className="text-slate-600 text-sm italic">No active buying requests currently listing targets.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MarketTradingRoom;