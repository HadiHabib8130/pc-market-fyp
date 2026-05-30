import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  Check, 
  ArrowLeft,
  ExternalLink 
} from 'lucide-react';

const MyBuyOrders = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Modal States ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  // --- Edit Form States ---
  const [editFormData, setEditFormData] = useState({
    bid_price: '',
    condition: 'used',
    requires_warranty: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("You are not logged in. Please sign in to manage your active buy orders.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'https://hadi8130.pythonanywhere.com/api/market/bids/my-bids/',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setBid(response.data || response.data);
    } catch (err) {
      console.error("Failed to fetch bids:", err);
      setError("Unable to retrieve buy orders. Please check your network connection and backend status.");
    } finally {
      setLoading(false);
    }
  };

  // --- Open Edit Modal ---
  const handleOpenEdit = (bid) => {
    setSelectedBid(bid);
    setEditFormData({
      bid_price: bid.bid_price,
      condition: bid.condition,
      requires_warranty: bid.requires_warranty
    });
    setEditModalOpen(true);
  };

  // --- Submit Update (PATCH) ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const patchData = {
        bid_price: editFormData.bid_price,
        condition: editFormData.condition,
        requires_warranty: editFormData.requires_warranty
      };

      const response = await axios.patch(
        `https://hadi8130.pythonanywhere.com/api/market/bids/${selectedBid.id}/`,
        patchData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Reactive update in state
      setBids((prevBids) =>
        prevBids.map((item) =>
          item.id === selectedBid.id ? { ...item, ...response.data } : item
        )
      );

      setEditModalOpen(false);
    } catch (err) {
      console.error("Update failed:", err.response?.data);
      alert("Error updating buy order. Please check inputs.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Open Delete Modal ---
  const handleOpenDelete = (bid) => {
    setSelectedBid(bid);
    setDeleteModalOpen(true);
  };

  // --- Submit Cancel (DELETE) ---
  const handleDelete = async () => {
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `https://hadi8130.pythonanywhere.com/api/market/bids/${selectedBid.id}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Reactively filter deleted order
      setBids((prevBids) =>
        prevBids.filter((item) => item.id !== selectedBid.id)
      );
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert("Error canceling buy order. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatPrice = (val) => {
    return Number(val).toLocaleString('en-US');
  };

  // Local filtering logic
  const filteredBids = bids.filter((item) => {
    const query = searchQuery.toLowerCase();
    const brand = item.brand?.toLowerCase() || '';
    const model = item.product_name?.toLowerCase() || '';
    const status = item.status?.toLowerCase() || '';
    return brand.includes(query) || model.includes(query) || status.includes(query);
  });

  const getConditionStyle = (cond) => {
    switch (cond?.toLowerCase()) {
      case 'new':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'box_pack':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    }
  };

  const getConditionLabel = (cond) => {
    switch (cond?.toLowerCase()) {
      case 'new': return 'Brand New';
      case 'box_pack': return 'Box Pack (Sealed)';
      default: return 'Used';
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'accepted':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      default:
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80 border border-slate-900 p-6 rounded-2xl">
          <div className="space-y-1">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-wider mb-2 font-bold"
            >
              <ArrowLeft size={13} /> Back to Marketplace
            </button>
            <h1 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <ShoppingBag className="text-blue-500" /> My Active Buy Orders
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Manage, edit, or withdraw your buying bids on catalog PC hardware elements.</p>
          </div>
        </div>

        {/* --- CONTROLS BAR --- */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/10 border border-slate-900 p-4 rounded-xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search your bids by brand, model, or status..."
              className="w-full bg-slate-950 border border-slate-900 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-blue-600/80 transition-colors text-xs text-slate-200 placeholder-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 text-[10px] font-bold text-slate-400 select-none">
            <div className="bg-slate-950 border border-slate-900 px-4 py-2.5 rounded-lg">
              Total Bids: <span className="text-blue-400 font-black ml-1">{bids.length}</span>
            </div>
            <div className="bg-slate-950 border border-slate-900 px-4 py-2.5 rounded-lg">
              Filtered: <span className="text-blue-400 font-black ml-1">{filteredBids.length}</span>
            </div>
          </div>
        </div>

        {/* --- ERROR MESSAGE --- */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto">
            <AlertTriangle className="text-red-400 mx-auto" size={36} />
            <h3 className="text-lg font-bold text-red-400">Authentication Error</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <button 
              onClick={() => navigate('/login-buyer')} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition uppercase tracking-wider"
            >
              Sign In Now
            </button>
          </div>
        )}

        {/* --- LOADING SPINNER --- */}
        {loading && !error && (
          <div className="py-20 text-center space-y-4">
            <div className="animate-spin text-blue-500 text-3xl font-black inline-block">⚙️</div>
            <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Fetching your buy orders...</p>
          </div>
        )}

        {/* --- BUY ORDERS GRID --- */}
        {!loading && !error && (
          filteredBids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBids.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500" />
                  
                  <div className="space-y-4 z-10">
                    {/* Catalog item header info */}
                    <div className="flex gap-4 items-start">
                      <div className="w-16 h-16 bg-white rounded-xl p-1 flex-shrink-0 flex items-center justify-center border border-slate-900">
                        <img 
                          src={item.stock_image} 
                          className="w-full h-full object-contain" 
                          alt="Product" 
                        />
                      </div>
                      
                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${getStatusStyle(item.status)}`}>
                            {item.status}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="font-extrabold text-sm text-slate-100 leading-tight">
                          {item.brand}
                        </h3>
                        <p className="text-slate-300 text-xs font-semibold">
                          {item.product_name}
                        </p>
                      </div>
                    </div>

                    {/* Price and parameters */}
                    <div className="flex items-center justify-between border-y border-slate-900 py-3 text-xs">
                      <div>
                        <p className="text-slate-500 font-bold mb-0.5">My Buying Price</p>
                        <p className="font-mono font-black text-sm text-blue-400">
                          Rs. {formatPrice(item.bid_price)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getConditionStyle(item.condition)}`}>
                          {getConditionLabel(item.condition)}
                        </span>
                        
                        {item.requires_warranty ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                            <ShieldCheck size={11} /> Warranty Required
                          </span>
                        ) : (
                          <span className="bg-slate-900 text-slate-500 text-[10px] px-2 py-0.5 rounded border border-slate-800/60">
                            No Warranty Limit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Only editable when still pending) */}
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-900 z-10">
                    {item.status?.toLowerCase() === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 py-2.5 rounded-xl text-xs font-bold transition active:scale-[0.98] border border-slate-800"
                        >
                          <Edit3 size={14} /> Update Bid
                        </button>
                        
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="bg-red-950/30 hover:bg-red-900/20 text-red-400 p-2.5 rounded-xl transition border border-red-500/10 active:scale-[0.98]"
                          title="Withdraw Bid"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate(`/market/${item.master_product}`)}
                        className="w-full flex items-center justify-center gap-1.5 bg-slate-900 text-slate-400 py-2.5 rounded-xl text-xs font-bold border border-slate-800 hover:text-white transition"
                      >
                        Trade Filled! Go to Room <ExternalLink size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-950/30 border border-dashed border-slate-900 rounded-3xl space-y-6">
              <div className="w-14 h-14 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
                <ShoppingBag size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">No Active Buy Orders</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">You have not submitted any active purchasing bids on graphics cards, RAM, or other catalog products.</p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg active:scale-95"
              >
                Find Hardware to Buy
              </button>
            </div>
          )
        )}
      </div>

      {/* ========================================================
          EDIT BID MODAL
          ======================================================== */}
      {editModalOpen && selectedBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-850 bg-slate-900/90">
              <div>
                <span className="text-[9px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-0.5 rounded-full">
                  Edit Buy Bid
                </span>
                <h2 className="text-sm font-black text-white mt-1">
                  {selectedBid.brand} {selectedBid.product_name}
                </h2>
              </div>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-850 p-1.5 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              
              {/* Bid price */}
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  My Buying Bid Price (PKR)
                </label>
                <input 
                  type="number" 
                  required 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-600 text-xs text-white" 
                  value={editFormData.bid_price}
                  onChange={(e) => setEditFormData({...editFormData, bid_price: e.target.value})}
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  Requested Condition
                </label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-600 text-xs text-white"
                  value={editFormData.condition}
                  onChange={(e) => setEditFormData({...editFormData, condition: e.target.value})}
                >
                  <option value="used">Used</option>
                  <option value="box_pack">Box Pack (Sealed)</option>
                  <option value="new">Brand New</option>
                </select>
              </div>

              {/* Warranty Requirement Toggle */}
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  Warranty Requirement
                </label>
                <div className="flex h-10 border border-slate-850 rounded-xl overflow-hidden bg-slate-950">
                  <button 
                    type="button" 
                    onClick={() => setEditFormData({...editFormData, requires_warranty: true})} 
                    className={`flex-1 text-xs font-bold transition ${editFormData.requires_warranty ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Must have Warranty
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditFormData({...editFormData, requires_warranty: false})} 
                    className={`flex-1 text-xs font-bold transition ${!editFormData.requires_warranty ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    No Warranty Needed
                  </button>
                </div>
              </div>

              {/* Submission Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-850 font-bold rounded-xl text-xs transition text-slate-400"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-1"
                >
                  {submitLoading ? 'Saving...' : <><Check size={14} /> Update Bid</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE MODAL
          ======================================================== */}
      {deleteModalOpen && selectedBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xs w-full overflow-hidden shadow-2xl p-5 text-center animate-in zoom-in-95 duration-200 space-y-4">
            
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={20} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Withdraw Buy Order?</h3>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Are you sure you want to cancel your buying bid for <span className="font-bold text-slate-200">{selectedBid.brand} {selectedBid.product_name}</span>? 
                This bid will be permanently removed from the exchange matching lists.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold transition"
              >
                No, Keep It
              </button>
              <button
                onClick={handleDelete}
                disabled={submitLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition"
              >
                {submitLoading ? 'Cancelling...' : 'Yes, Cancel Bid'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyBuyOrders;
