import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';

const BuyerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', password: '', full_name: '', father_name: '', display_name: '', address: '', phone_no: ''
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Use FormData object since we are transmitting a profile picture file
    const data = new FormData();
    
    // Append your form inputs cleanly
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // CRITICAL FALLBACK: Map display_name to the mandatory backend username column field
    data.append('username', formData.display_name);

    if (file) data.append('profile_picture', file);

    try {
      await axios.post('https://hadi8130.pythonanywhere.com/api/users/register/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Registration complete! Welcome to the Exchange.");
      navigate('/login-buyer'); // Redirect to login page
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        alert("Network failure. Check if your backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-6">
        
        <Link to="/login-buyer" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Create <span className="text-blue-500">Buyer</span> Account</h2>
          <p className="text-xs text-slate-500 mt-1">Setup your trading account credentials to participate on the trading floor.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">Display Handle (Unique)</label>
              <input type="text" name="display_name" onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none placeholder-slate-700" placeholder="e.g. hadi123" />
              {errors.display_name && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.display_name[0]}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">Full Name</label>
              <input type="text" name="full_name" onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none" />
              {errors.username && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.username[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">Father's Name</label>
              <input type="text" name="father_name" onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">Phone Number</label>
              <input type="text" name="phone_no" onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none" />
              {errors.phone_no && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.phone_no[0]}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-bold">Email Address</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none placeholder-slate-700" placeholder="name@domain.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-bold">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none" />
            {errors.password && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.password[0]}</p>}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-bold">Shipping/Billing Address</label>
            <textarea name="address" rows="2" onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none resize-none"></textarea>
            {errors.address && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.address[0]}</p>}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-bold">Profile Picture (Optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full text-slate-400 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer" />
            {errors.profile_picture && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.profile_picture[0]}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-xl shadow-lg transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            <UserPlus size={16} /> {loading ? "Registering..." : "Create Profile"}
          </button>
        </form>
        
        <div className="text-center text-xs text-slate-500 border-t border-slate-900/60 pt-4">
          Already have an account? <Link to="/login-buyer" className="text-blue-400 hover:underline font-semibold">Sign In Here</Link>
        </div>

      </div>
    </div>
  );
};

export default BuyerRegister;