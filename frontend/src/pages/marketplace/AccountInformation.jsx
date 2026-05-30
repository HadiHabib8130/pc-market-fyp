import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, MapPin, Phone, Briefcase } from 'lucide-react';

const AccountInformation = () => {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        // CRITICAL: We must send the Auth Token so Django knows who is asking!
        const token = localStorage.getItem('access_token'); // Or however you store your JWT
        
        const response = await axios.get('https://hadi8130.pythonanywhere.com/api/users/account/me/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAccountData(response.data);
      } catch (error) {
        console.error("Failed to fetch account info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, []);

  if (loading) return <div className="text-white text-center mt-20 animate-pulse">Loading Account Information...</div>;
  if (!accountData) return <div className="text-red-400 text-center mt-20">Failed to load account data. Please sign in again.</div>;

  const { role, profile } = accountData;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Account Information</h1>

      {/* CORE USER INFO (Shows for everyone) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 shadow-lg">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Login Credentials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><User size={14}/> Username</p>
            <p className="text-slate-200 font-medium">@{accountData.username}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Mail size={14}/> Email Address</p>
            <p className="text-slate-200 font-medium">{accountData.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Shield size={14}/> Account Role</p>
            <p className="text-blue-400 font-bold uppercase text-sm">{accountData.role}</p>
          </div>
        </div>
      </div>

      {/* PROFILE INFO (Dynamic based on role) */}
      {profile ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
            {role === 'seller' ? 'Seller Identity & Business' : 'Buyer Identity & Shipping'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            
            {/* Fields Shared by Both */}
            <div>
              <p className="text-xs text-slate-500 mb-1">Full Legal Name</p>
              <p className="text-slate-200">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Father's Name</p>
              <p className="text-slate-200">{profile.father_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Phone size={14}/> Phone Number</p>
              <p className="text-slate-200">{profile.phone || profile.phone_no}</p>
            </div>

            {/* SELLER ONLY FIELDS */}
            {role === 'seller' && (
              <>
                <div>
                  <p className="text-xs text-slate-500 mb-1">CNIC Number</p>
                  <p className="text-slate-200 font-mono text-sm">{profile.cnic_number}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Briefcase size={14}/> Business Tier</p>
                  <p className="text-slate-200">{profile.tier}</p>
                </div>
                {profile.business_name && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Business Name</p>
                    <p className="text-slate-200">{profile.business_name}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><MapPin size={14}/> Shop Address</p>
                  <p className="text-slate-200">{profile.shop_address}, {profile.city}, {profile.province}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Verification Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${profile.is_verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {profile.status}
                  </span>
                </div>
              </>
            )}

            {/* BUYER ONLY FIELDS */}
            {role === 'buyer' && (
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><MapPin size={14}/> Default Delivery Address</p>
                <p className="text-slate-200">{profile.address}</p>
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
          <p className="text-amber-400 font-bold mb-2">Profile Incomplete</p>
          <p className="text-slate-400 text-sm">You haven't finished setting up your profile details yet.</p>
        </div>
      )}

    </div>
  );
};

export default AccountInformation;