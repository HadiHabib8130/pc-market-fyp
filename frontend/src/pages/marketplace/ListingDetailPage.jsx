import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, MapPin, Phone, UserCircle, AlertCircle } from 'lucide-react'; // Or your preferred icon library

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/market/listing/${id}/`);
        setListing(response.data);
        
        // Set the first image as active, or fallback to the master product stock image
        if (response.data.images && response.data.images.length > 0) {
          setActiveImage(response.data.images[0].image);
        } else {
          setActiveImage(response.data.stock_image);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      }
    };
    fetchListing();
  }, [id]);

  if (!listing) return <div className="text-white text-center mt-20 animate-pulse">Loading Listing Data...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="text-blue-400 hover:text-blue-300 text-sm mb-6 flex items-center gap-2">
        ← Back to Market
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= LEFT COLUMN: IMAGE GALLERY ================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Image Viewer */}
          <div className="bg-white rounded-2xl h-[500px] flex items-center justify-center p-8 border border-slate-800">
            <img src={activeImage} alt={listing.product_name} className="max-w-full max-h-full object-contain" />
          </div>

          {/* Thumbnail Strip */}
          {listing.images && listing.images.length > 0 && (
            <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
              {listing.images.map((img) => (
                <button 
                  key={img.id} 
                  onClick={() => setActiveImage(img.image)}
                  className={`h-20 w-20 flex-shrink-0 bg-white rounded-lg p-2 border-2 transition-all ${activeImage === img.image ? 'border-blue-500' : 'border-transparent hover:border-slate-400'}`}
                >
                  <img src={img.image} className="w-full h-full object-cover rounded" alt="thumbnail" />
                </button>
              ))}
            </div>
          )}
        </div>


        {/* ================= RIGHT COLUMN: INFO & SELLER ================= */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Listing Details Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{listing.brand}</span>
            <h1 className="text-2xl font-bold text-slate-200 mt-1 mb-4 leading-tight">{listing.product_name}</h1>
            
            <div className="flex justify-between items-end border-b border-slate-800 pb-6 mb-6">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Asking Price</p>
                <p className="text-4xl font-mono font-black text-green-400">
                  Rs {Math.floor(listing.price).toLocaleString()}
                </p>
              </div>
              <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                listing.condition === 'NEW' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {listing.condition} Condition
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
                  <ShieldCheck size={16} className={listing.has_warranty ? "text-emerald-500" : "text-slate-600"}/> 
                  Warranty Details
                </h3>
                <p className="text-sm text-slate-400">
                  {listing.has_warranty ? `${listing.warranty_months} Months - ${listing.warranty_info}` : "No active warranty provided."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-1">Item Description</h3>
                <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Seller Trust Card */}
          {listing.seller_details && (
            <div className="bg-slate-900/80 border border-slate-700 shadow-xl shadow-slate-900/50 rounded-2xl p-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Seller Information</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                  <UserCircle size={24} className="text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-200">{listing.seller_details.nickname}</h3>
                    {listing.seller_details.is_verified && (
                      <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{listing.seller_details.tier} Seller {listing.seller_details.business_name ? `• ${listing.seller_details.business_name}` : ''}</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold mb-0.5">Contact Number</p>
                    <p className="text-sm font-mono text-slate-200">{listing.seller_details.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-bold mb-0.5">Location</p>
                    <p className="text-sm text-slate-300">{listing.seller_details.city}, {listing.seller_details.province}</p>
                    <p className="text-xs text-slate-500 mt-1">{listing.seller_details.shop_address}</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors">
                Contact Seller Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;