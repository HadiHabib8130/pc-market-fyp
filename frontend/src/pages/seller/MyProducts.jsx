import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Trash2,
  Edit3,
  ShieldCheck,
  Package,
  X,
  AlertTriangle,
  PlusCircle,
  Check,
  Info,
  ExternalLink
} from 'lucide-react';

const MyProducts = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Modal States ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // --- Form States for Editing ---
  const [editFormData, setEditFormData] = useState({
    price: '',
    condition: 'USED',
    description: '',
    has_warranty: false,
    warranty_months: '',
    warranty_info: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- Fetch Seller Listings on Mount ---
  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError("You are not logged in. Please log in to view your inventory.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'https://hadi8130.pythonanywhere.com/api/products/listings/my-listings/',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setListings(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError("Unable to load listings. Please ensure the backend server is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Open Edit Modal ---
  const handleOpenEdit = (listing) => {
    setSelectedListing(listing);
    setEditFormData({
      price: listing.price,
      condition: listing.condition,
      description: listing.description,
      has_warranty: listing.has_warranty,
      warranty_months: listing.warranty_months || '',
      warranty_info: listing.warranty_info || ''
    });
    setEditModalOpen(true);
  };

  // --- Submit Update (PATCH) ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const patchData = {
        price: editFormData.price,
        condition: editFormData.condition,
        description: editFormData.description,
        has_warranty: editFormData.has_warranty,
        warranty_months: editFormData.has_warranty ? editFormData.warranty_months : null,
        warranty_info: editFormData.has_warranty ? editFormData.warranty_info : ''
      };

      const response = await axios.patch(
        `https://hadi8130.pythonanywhere.com/api/products/listings/${selectedListing.id}/`,
        patchData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Instant state update for reactive UX
      setListings((prevListings) =>
        prevListings.map((item) =>
          item.id === selectedListing.id ? { ...item, ...response.data } : item
        )
      );

      setEditModalOpen(false);
      // Small feedback alert inside the UI would be cleaner, but simple alert works perfectly too
    } catch (err) {
      console.error("Update failed:", err.response?.data);
      alert("Error updating listing. Please check the inputs.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Open Delete Modal ---
  const handleOpenDelete = (listing) => {
    setSelectedListing(listing);
    setDeleteModalOpen(true);
  };

  // --- Submit Delete (DELETE) ---
  const handleDelete = async () => {
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      await axios.delete(
        `https://hadi8130.pythonanywhere.com/api/products/listings/${selectedListing.id}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Filter out deleted product instantly from list
      setListings((prevListings) =>
        prevListings.filter((item) => item.id !== selectedListing.id)
      );
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting listing. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Local Search Filter ---
  const filteredListings = listings.filter((item) => {
    const query = searchQuery.toLowerCase();
    const brand = item.master_product_details?.brand?.toLowerCase() || '';
    const model = item.master_product_details?.model_name?.toLowerCase() || '';
    const desc = item.description?.toLowerCase() || '';
    const cat = item.master_product_details?.category?.toLowerCase() || '';
    return brand.includes(query) || model.includes(query) || desc.includes(query) || cat.includes(query);
  });

  // Helpers
  const formatPrice = (val) => {
    return Number(val).toLocaleString('en-US');
  };

  const getConditionStyle = (cond) => {
    switch (cond) {
      case 'NEW':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'OPEN':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    }
  };

  const getConditionLabel = (cond) => {
    switch (cond) {
      case 'NEW': return 'Brand New';
      case 'OPEN': return 'Open Box';
      default: return 'Used';
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER AND QUICK STATS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Package className="text-blue-500" /> My Active Listings
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage and track your listed components in Pakistan's premium trading environment.</p>
          </div>

          <button
            onClick={() => navigate('/seller-hub/portal/add-product')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-900/30 self-start md:self-auto active:scale-[0.98]"
          >
            <PlusCircle size={18} /> Add a Product
          </button>
        </div>

        {/* SEARCH BAR & ANALYTICS PREVIEW */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-900/20 border border-slate-800/80 p-4 rounded-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search listings by name, brand, spec, or category..."
              className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-blue-600/80 transition-colors text-sm text-slate-200 placeholder-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-4 text-xs font-semibold px-2 py-1 text-slate-400">
            <div className="bg-slate-900 px-4 py-2 border border-slate-800 rounded-lg">
              Total Listed: <span className="text-blue-400 ml-1 font-bold">{listings.length}</span>
            </div>
            <div className="bg-slate-900 px-4 py-2 border border-slate-800 rounded-lg">
              Filtered: <span className="text-blue-400 ml-1 font-bold">{filteredListings.length}</span>
            </div>
          </div>
        </div>

        {/* --- ERROR MESSAGE --- */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center space-y-3">
            <AlertTriangle className="text-red-400 mx-auto" size={40} />
            <h3 className="text-lg font-bold text-red-400">Authentication Required</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => navigate('/seller-hub/login')}
              className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl text-sm transition"
            >
              Sign In to Hub
            </button>
          </div>
        )}

        {/* --- LOADING SPINNER --- */}
        {loading && !error && (
          <div className="py-20 text-center space-y-4">
            <div className="animate-spin text-blue-500 text-3xl font-black inline-block">⚙️</div>
            <p className="text-slate-400 text-sm">Querying secure market database...</p>
          </div>
        )}

        {/* --- INVENTORY LISTING GRID --- */}
        {!loading && !error && (
          filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Subtle Background Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500" />

                  <div className="space-y-4 z-10">
                    {/* Upper row: stock image, category badge, and title */}
                    <div className="flex gap-4 items-start">
                      <div className="w-20 h-20 bg-white rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center border border-slate-800">
                        <img 
                          src={item.master_product_details?.stock_image_url} 
                          className="w-full h-full object-contain" 
                          alt="Stock" 
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                            {item.master_product_details?.category || 'Hardware'}
                          </span>
                          <span className="text-slate-500 text-xs">
                            Posted: {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-lg text-white leading-tight">
                          {item.master_product_details?.brand}
                        </h3>
                        <p className="text-slate-300 text-sm font-medium">
                          {item.master_product_details?.model_name}
                        </p>
                      </div>
                    </div>

                    {/* Middle Row: Price and condition indicators */}
                    <div className="flex items-center justify-between border-y border-slate-800/80 py-3 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Price</p>
                        <p className="font-black text-xl text-blue-400">
                          Rs. {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <span className={`text-xs px-3 py-1 rounded-lg font-bold ${getConditionStyle(item.condition)}`}>
                          {getConditionLabel(item.condition)}
                        </span>

                        {item.has_warranty ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                            <ShieldCheck size={12} /> {item.warranty_months} Mo.
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-500 text-xs px-3 py-1 rounded-lg border border-slate-700/50">
                            No Warranty
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description Paragraph */}
                    <div>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Lower Row: Action Buttons */}
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800/50 z-10">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-sm font-bold transition active:scale-[0.98] border border-slate-700/60"
                    >
                      <Edit3 size={15} /> Edit Details
                    </button>

                    <button
                      onClick={() => handleOpenDelete(item)}
                      className="bg-red-950/40 hover:bg-red-900/30 text-red-400 p-2.5 rounded-xl transition border border-red-500/20 active:scale-[0.98]"
                      title="Delete Listing"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl space-y-6">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                <Package size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Your Inventory is Empty</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">You haven't listed any graphics cards, processors, or hardware components for sale yet.</p>
              </div>
              <button
                onClick={() => navigate('/seller-hub/portal/add-product')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg active:scale-95"
              >
                <PlusCircle size={18} /> Create Your First Listing
              </button>
            </div>
          )
        )}
      </div>

      {/* ========================================================
          EDIT LISTING MODAL (Glassmorphic Slide-In / Backdrop)
          ======================================================== */}
      {editModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/90">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-0.5 rounded-full">
                  Edit Listing
                </span>
                <h2 className="text-lg font-black text-white mt-1">
                  {selectedListing.master_product_details?.brand} {selectedListing.master_product_details?.model_name}
                </h2>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-850 p-1.5 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">

              {/* Price Field */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Price (PKR)
                </label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-600 text-sm text-white"
                  placeholder="e.g. 45000"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                />
              </div>

              {/* Condition Selector */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Condition
                </label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-600 text-sm text-white"
                  value={editFormData.condition}
                  onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                >
                  <option value="USED">Used (Normal wear / box optional)</option>
                  <option value="OPEN">Open Box (Like new, original packaging)</option>
                  <option value="NEW">Brand New (Sealed pack, untouched)</option>
                </select>
              </div>

              {/* Warranty Configurations */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Warranty Status
                </label>
                <div className="flex h-11 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, has_warranty: true })}
                    className={`flex-1 text-sm font-bold transition-all ${editFormData.has_warranty ? 'bg-blue-600 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
                  >
                    Includes Warranty
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, has_warranty: false })}
                    className={`flex-1 text-sm font-bold transition-all ${!editFormData.has_warranty ? 'bg-blue-600 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
                  >
                    No Warranty
                  </button>
                </div>
              </div>

              {/* Conditional Warranty Fields */}
              {editFormData.has_warranty && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-3 duration-250">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold mb-1">
                      Warranty Months Remaining
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 6"
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-sm text-white focus:border-blue-600 outline-none"
                      value={editFormData.warranty_months}
                      onChange={(e) => setEditFormData({ ...editFormData, warranty_months: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold mb-1">
                      Warranty Coverage / Details
                    </label>
                    <textarea
                      placeholder="Specify shop name, local or international warranty details..."
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg h-20 text-sm text-white focus:border-blue-600 outline-none resize-none"
                      value={editFormData.warranty_info}
                      onChange={(e) => setEditFormData({ ...editFormData, warranty_info: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Description Paragraph */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Item Description / Notes
                </label>
                <textarea
                  required
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl h-28 outline-none focus:border-blue-600 text-sm text-slate-200 resize-none"
                  placeholder="Tell buyers about usage faults, overclocking history, or benchmark temperatures..."
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-3 border border-slate-800 hover:bg-slate-850 font-bold rounded-xl text-sm transition text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-sm transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-1.5"
                >
                  {submitLoading ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
          ======================================================== */}
      {deleteModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200 space-y-5">

            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">Remove Listing?</h3>
              <p className="text-slate-400 text-xs leading-relaxed px-2">
                Are you sure you want to delete the listing for <span className="font-bold text-slate-200">{selectedListing.master_product_details?.brand} {selectedListing.master_product_details?.model_name}</span>?
                This will permanently remove it from the marketplace index.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-sm font-bold transition"
              >
                No, Keep It
              </button>
              <button
                onClick={handleDelete}
                disabled={submitLoading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-red-900/30 flex items-center justify-center"
              >
                {submitLoading ? 'Removing...' : 'Yes, Delete'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyProducts;
