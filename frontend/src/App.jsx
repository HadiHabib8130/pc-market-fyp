import React, { useEffect, useState } from 'react';
import API from './api';
import axios from 'axios';
// Update this line at the top of your file
import { Monitor, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react';

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get('products/')
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error(err);
        setError("Could not connect to Django. Check if the server is running on port 8000.");
      });
  }, []);

 // Fetch Orders only for the clicked product
// inside App.jsx
useEffect(() => {
  if (selectedProduct) {
    // Make sure 'product' here matches the query_params.get('product') in Django
    API.get(`orders/?product=${selectedProduct.id}`)
      .then(res => {
        setOrders(res.data);
      })
      .catch(err => console.error("Error fetching orders:", err));
  }
}, [selectedProduct]);



 return (
  <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
    {/* Minimalist Navbar */}
    <Navbar onHome={() => setSelectedProduct(null)} products={products} />

    <main className="max-w-7xl mx-auto p-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-400 mb-8">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Main Content Switch */}
      {!selectedProduct ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {products.map(product => (
            <div 
              key={product.id} 
              onClick={() => setSelectedProduct(product)}
              className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden cursor-pointer hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className="aspect-video bg-black overflow-hidden relative">
                <img 
                  src={product.image?.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-xl group-hover:text-blue-400 transition-colors">{product.name}</h3>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Highest Buy</span>
                    <span className="text-green-400 font-mono font-bold text-lg">{product.highest_buy ? `Rs.${product.highest_buy}` : 'No Bids'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Lowest Sell</span>
                    <span className="text-red-400 font-mono font-bold text-lg">{product.lowest_sell ? `Rs.${product.lowest_sell}` : 'No Asks'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <OrderBook 
          product={selectedProduct} 
          orders={orders} 
          onBack={() => setSelectedProduct(null)} 
        />
      )}
    </main>
  </div>
);
}

const Navbar = ({ onHome, products }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Extract unique categories from your product list
  const categories = [...new Set(products.map(p => p.category || 'Uncategorized'))];

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div 
        onClick={onHome}
        className="text-2xl font-black tracking-tighter text-blue-500 cursor-pointer hover:opacity-80 transition-opacity"
      >
        TECH-MARKET
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <button onClick={onHome} className="hover:text-white transition-colors">Marketplace</button>
        <button className="hover:text-white transition-colors">Active Bids</button>
        
        {/* Categories Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            Categories <TrendingUp size={14} className={isDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
              {categories.map((cat, index) => (
                <button 
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white transition-colors text-xs"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search hardware..." 
            className="bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 w-64 transition-all"
          />
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/10 cursor-pointer"></div>
      </div>
    </nav>
  );
};

const OrderBook = ({ product, orders, onBack }) => {
  // Safety check: If product is somehow missing, show a loading message
  if (!product) return <div className="text-white p-10">Loading product details...</div>;

  const sellOrders = orders.filter(o => o.order_type === 'SELL' && o.status === 'OPEN');
  const buyOrders = orders.filter(o => o.order_type === 'BUY' && o.status === 'OPEN');

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      <button onClick={onBack} className="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-2">
        <ArrowLeft size={18} /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Info Card */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 h-fit">
          <div className="aspect-video bg-black rounded-xl mb-4 overflow-hidden border border-slate-700">
             <img 
                src={product.image?.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`} 
                className="w-full h-full object-cover" 
                alt={product.name} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/1600x900?text=Hardware+Image'; }}
              />
          </div>
          <h2 className="text-3xl font-bold text-white">{product.name}</h2>
          <p className="text-slate-400 mt-4 leading-relaxed italic border-l-2 border-blue-500 pl-4">
             "{product.description || "High-performance PC hardware listing."}"
          </p>
        </div>

        {/* Sell Orders Column */}
        <div className="bg-slate-900/50 rounded-3xl p-6 border border-red-500/20 shadow-lg shadow-red-900/5">
          <h3 className="text-red-400 font-bold mb-6 uppercase tracking-widest text-sm flex justify-between items-center">
            SELL ORDERS 
            <span className="bg-red-500/10 px-2 py-1 rounded text-[10px] border border-red-500/20">Market Supply</span>
          </h3>
          <div className="space-y-3">
            {sellOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center bg-red-500/5 p-4 rounded-xl border border-red-500/10 hover:bg-red-500/10 transition-colors">
                <span className="text-red-200 font-mono text-lg font-bold">Rs.{order.price}</span>
                <span className="text-slate-500 text-xs font-medium">{order.quantity} Units Available</span>
              </div>
            ))}
            {sellOrders.length === 0 && <p className="text-slate-600 text-sm italic py-4">No active sell orders found.</p>}
          </div>
        </div>

        {/* Buy Orders Column */}
        <div className="bg-slate-900/50 rounded-3xl p-6 border border-green-500/20 shadow-lg shadow-green-900/5">
          <h3 className="text-green-400 font-bold mb-6 uppercase tracking-widest text-sm flex justify-between items-center">
            BUY ORDERS
            <span className="bg-green-500/10 px-2 py-1 rounded text-[10px] border border-green-500/20">Market Demand</span>
          </h3>
          <div className="space-y-3">
            {buyOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center bg-green-500/5 p-4 rounded-xl border border-green-500/10 hover:bg-green-500/10 transition-colors">
                <span className="text-green-200 font-mono text-lg font-bold">Rs.{order.price}</span>
                <span className="text-slate-500 text-xs font-medium">Seeking {order.quantity} Units</span>
              </div>
            ))}
            {buyOrders.length === 0 && <p className="text-slate-600 text-sm italic py-4">No active buy orders (bids) yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;