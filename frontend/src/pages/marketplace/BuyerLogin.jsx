import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const BuyerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Confirmed: Targets your explicit high-performance high-security custom endpoint
      const response = await axios.post('http://127.0.0.1:8000/api/users/login/', {
        email: email, // Maps the input text field variable to the backend 'email' lookup key
        password: password
      });

      // Save token session metadata fields to storage context handlers
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_id', response.data.id);
      localStorage.setItem('user_email', response.data.email);
      localStorage.setItem('user_role', response.data.role);
      localStorage.setItem('display_name', response.data.display_name || '');
      localStorage.setItem('profile_picture', response.data.profile_picture || '');
      
      alert("Welcome back to the Exchange!");
      navigate('/'); // Route directly back to main marketplace home trading floor
      window.location.reload(); // Hard-triggers navbar lifecycle re-render to ingest new tokens
    } catch (err) {
      console.error("Full Login Error Response Object:", err.response);

      if (err.response && err.response.data) {
        const data = err.response.data;
        
        // 1. Catches direct string responses (like our new secure seller exclusion error)
        if (typeof data.detail === 'string') {
          setError(data.detail);
        } 
        // 2. Extracts standard nested exception arrays
        else if (data.detail && Array.isArray(data.detail)) {
          setError(data.detail[0]);
        }
        else if (data.detail && typeof data.detail === 'object') {
          setError(data.detail.message || JSON.stringify(data.detail));
        }
        // 3. Catches non-field validation structural fallbacks
        else if (data.non_field_errors) {
          setError(data.non_field_errors[0]);
        } else {
          setError("Invalid email or password credentials.");
        }
      } else {
        setError("Network failure. Check if your backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-6">
        
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Marketplace
        </Link>

        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight uppercase italic">
            BUYER <span className="text-blue-500">SIGN-IN</span>
          </h2>
          <p className="text-xs text-slate-500">Access your trading floor dashboard to place bids.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2 shadow-lg shadow-red-500/5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 py-3 pl-11 pr-4 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 placeholder-slate-600"
                placeholder="name@domain.com"
              />
              <Mail className="absolute left-4 top-3.5 text-slate-600" size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 py-3 pl-11 pr-4 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 placeholder-slate-600"
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-3.5 text-slate-600" size={16} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <LogIn size={16} /> {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-900/60 text-xs text-slate-500">
          Need a buyer account?{" "}
          <Link to="/register-buyer" className="text-blue-400 hover:underline font-semibold">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default BuyerLogin;