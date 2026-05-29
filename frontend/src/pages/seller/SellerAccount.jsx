import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, UserCircle, ShieldCheck, MapPin, Building, Phone, Store } from 'lucide-react';

const SellerAccount = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Holds text inputs
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    business_name: '',
    city: '',
    shop_address: ''
  });
  
  // Holds existing photos and tier details for displaying in UI
  const [profileDetails, setProfileDetails] = useState(null);
  
  // Holds newly uploaded shop photo file
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchSellerProfile();
  }, []);

  const fetchSellerProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get('http://127.0.0.1:8000/api/users/account/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profile = response.data.profile || {};
      setProfileDetails(profile);
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        business_name: profile.business_name || '',
        city: profile.city || '',
        shop_address: profile.shop_address || ''
      });
    } catch (err) {
      console.error("Failed to load seller profile:", err);
      setErrorMsg("Failed to load account information. Ensure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const submitData = new FormData();
    // Append text fields
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    // Append new shop photo if uploaded
    if (selectedPhoto) {
      submitData.append('shop_photo', selectedPhoto);
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      await axios.patch('http://127.0.0.1:8000/api/users/account/me/', submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccessMsg("Account profile updated successfully!");
      // Reload profile
      fetchSellerProfile();
      setSelectedPhoto(null);
      setPhotoPreview(null);
    } catch (err) {
      console.error("Update failed:", err.response?.data);
      setErrorMsg("Failed to save changes. Please ensure phone CNIC limits are valid.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 text-slate-400">
        <div className="animate-spin text-blue-500 text-3xl font-black inline-block">⚙️</div>
        <p className="text-xs uppercase tracking-wider font-bold">Querying Account Profile Metadata...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- HEADER BANNER --- */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <UserCircle className="text-blue-500" /> Seller Account Information
          </h1>
          <p className="text-slate-400 text-xs mt-1">Review and update your public trade name, store location, and business contact information.</p>
        </div>

        {/* --- PROFILE TIER BADGE AND STORE METRICS --- */}
        {profileDetails && (
          <div className="bg-slate-900/20 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center font-black">
                {profileDetails.tier?.substring(0, 2).toUpperCase() || 'T1'}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-200">
                  {profileDetails.business_name || 'My Trading Desk'}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  Verification status: 
                  {profileDetails.is_verified ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <ShieldCheck size={12} /> Verified Seller
                    </span>
                  ) : (
                    <span className="text-amber-500 font-bold">Pending Review</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4 text-xs font-bold">
              <div className="bg-slate-950 border border-slate-900 px-4 py-2 rounded-lg">
                Seller Tier: <span className="text-blue-400 font-black ml-1 uppercase">{profileDetails.tier || 'Tier 1'}</span>
              </div>
              <div className="bg-slate-950 border border-slate-900 px-4 py-2 rounded-lg">
                CNIC logged: <span className="text-blue-400 font-black ml-1">{profileDetails.cnic_number || '---'}</span>
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN FORM CONTAINER --- */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Shop Photo Preview & Photo Changer */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl text-center space-y-6 flex flex-col justify-between h-fit">
            <div className="space-y-4">
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider text-left">
                Shop Storefront Photo
              </label>
              
              <div className="aspect-video w-full bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden flex items-center justify-center relative group">
                {photoPreview ? (
                  <img src={photoPreview} className="w-full h-full object-cover" alt="New Upload Preview" />
                ) : profileDetails?.shop_photo ? (
                  <img src={`http://127.0.0.1:8000${profileDetails.shop_photo}`} className="w-full h-full object-cover" alt="Current Shop" />
                ) : (
                  <div className="text-slate-600 flex flex-col items-center">
                    <Store size={40} className="mb-2" />
                    <span className="text-[10px]">No photo uploaded</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange} 
                className="hidden" 
                id="shop-photo-upload" 
              />
              <label 
                htmlFor="shop-photo-upload" 
                className="w-full py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                📸 Choose New Photo
              </label>
              <p className="text-[9px] text-slate-500 italic">Accepts PNG, JPG, or JPEG storefront profiles.</p>
            </div>
          </div>

          {/* Right Panel: Account Information Fields */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl space-y-6">
            
            {/* Feedback notifications */}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2 animate-in fade-in">
                <ShieldCheck size={16} /> {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs font-bold text-red-400 flex items-center gap-2 animate-in fade-in">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              
              {/* Business Name */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building size={13} className="text-slate-500" /> Business Trade Name
                </label>
                <input 
                  type="text" 
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Bilal Computers Lahore"
                  className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl outline-none focus:border-blue-600 text-xs text-white"
                  required
                />
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <UserCircle size={13} className="text-slate-500" /> Proprietor Full Name
                  </label>
                  <input 
                    type="text" 
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="proprietor name"
                    className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl outline-none focus:border-blue-600 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-500" /> Contact Phone
                  </label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 03001234567"
                    className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl outline-none focus:border-blue-600 text-xs text-white"
                    required
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-500" /> City
                </label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl outline-none focus:border-blue-600 text-xs text-white"
                  required
                />
              </div>

              {/* Shop Address */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                  Shop / Business Street Address
                </label>
                <textarea 
                  name="shop_address"
                  value={formData.shop_address}
                  onChange={handleInputChange}
                  placeholder="Complete market shop, plaza, floor, and street address..."
                  className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl outline-none focus:border-blue-600 h-28 text-xs text-slate-200 resize-none"
                  required
                />
              </div>

            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5 active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
              >
                {saving ? 'Saving Updates...' : <><Save size={15} /> Save Changes</>}
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default SellerAccount;
