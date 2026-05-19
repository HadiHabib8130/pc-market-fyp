import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, MapPin, Phone, UserCircle, Target } from 'lucide-react';

const BuyOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bid, setBid] = useState(null);

  useEffect(() => {
    const fetchBid = async () => {
      try {
        // Points to our new Django URL
        const response = await axios.get(`http://127.0.0.1:8000/api/market/bid/${id}/`);
        setBid(response.data);
      } catch (error) {
        console.error("Error fetching bid:", error);
      }
    };
    fetchBid();
  }, [id]);

  if (!bid) return <div className="text-white text-center mt-20 animate-pulse">Loading Bid Data...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="text-blue-400 hover:text-blue-300 text-sm mb-6 flex items-center gap-2">
        ← Back to Market
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= LEFT COLUMN: TARGET PRODUCT ================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-slate-500 font-bold tracking-widest text-xs uppercase mb-6 flex items-center gap-2">
              <Target size={16} className="text-blue-500"/> Target Component
            </h2>
            <img src={bid.stock_image} alt={bid.product_name} className="h-64 object-contain drop-shadow-2xl mb-6" />
            <h1 className="text-2xl font-bold text-slate-200 text-center">{bid.product_name}</h1>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: BID & BUYER INFO ================= */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Bid Requirements Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>

            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Request</span>
            
            <div className="flex justify-between items-end border-b border-slate-800 pb-6 mt-4 mb-6">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Offer Price</p>
                <p className="text-4xl font-mono font-black text-blue-400">
                  Rs {Math.floor(bid.bid_price).toLocaleString()}
                </p>
              </div>
              <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                bid.condition === 'new' || bid.condition === 'box_pack' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {bid.condition.replace('_', ' ')} Only
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
                  <ShieldCheck size={16} className={bid.requires_warranty ? "text-blue-500" : "text-slate-600"}/> 
                  Warranty Requirements
                </h3>
                <p className="text-sm text-slate-400">
                  {bid.requires_warranty ? "Seller MUST provide a valid warranty." : "Non-warranty items are acceptable."}
                </p>
              </div>
            </div>
          </div>

          {/* Buyer Trust Card */}
          {bid.buyer_details ? (
            <div className="bg-slate-900/80 border border-slate-700 shadow-xl shadow-slate-900/50 rounded-2xl p-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Buyer Information</h2>
              
              <div className="flex items-center gap-4 mb-6">
                {bid.buyer_details.profile_picture ? (
                  <img src={bid.buyer_details.profile_picture} alt="Profile" className="h-12 w-12 rounded-full object-cover border border-slate-600" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                    <UserCircle size={24} className="text-blue-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-200">@{bid.buyer_details.display_name}</h3>
                  <p className="text-xs text-slate-400">{bid.buyer_details.full_name}</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold mb-0.5">Contact Number</p>
                    <p className="text-sm font-mono text-slate-200">{bid.buyer_details.phone_no}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold mb-0.5">Delivery Address</p>
                    <p className="text-sm text-slate-300">{bid.buyer_details.address}</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors">
                Sell to this Buyer
              </button>
            </div>
          ) : (
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center text-slate-500">
               Buyer profile details are currently unavailable.
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BuyOrderDetailPage;