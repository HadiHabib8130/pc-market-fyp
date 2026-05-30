import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    // 1. Actually call your Django SimpleJWT endpoint
    // Note: Django usually expects 'username' and 'password'. 
    // If you use email, ensure your backend is configured for it.
    const response = await axios.post('https://hadi8130.pythonanywhere.com/api/users/seller-login/', {
      email: email, // or email, depending on your backend setup
      password: password
    });
    // Save all the amazing data the backend just sent you!
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('user_role', response.data.role);
    localStorage.setItem('business_name', response.data.business_name);

    // 2. Check if we got the access token
    if (response.data.access) {
      // 3. SAVE the token to localStorage so AddProduct can find it
      // We use the key 'token' to match what your AddProduct.jsx expects
      localStorage.setItem('token', response.data.access);
      
      // Optional: Save refresh token if you plan to use it later
      localStorage.setItem('refresh_token', response.data.refresh);

      alert("Login Successful! Welcome to the Hub.");
      navigate('/seller-hub/portal/dashboard');
    }
  } catch (err) {
    console.error("Login Error:", err.response?.data);
    alert("Invalid credentials or server error. Check the console.");
  }
};

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Seller Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all">
            Enter Hub
          </button>
        </form>
        <p className="text-slate-500 text-center mt-6 text-sm">
          New here? <Link to="/seller-hub/register" className="text-blue-500 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;