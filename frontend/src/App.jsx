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
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-black text-blue-500 mb-8">TECH-MARKET</h1>

      {/* Main Switch Logic */}
      {!selectedProduct ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <div 
              key={product.id} 
              onClick={() => setSelectedProduct(product)} // Trigger detail view
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 cursor-pointer hover:border-blue-500 transition-all"
            >
              <div className="aspect-video bg-black rounded-xl mb-4 overflow-hidden">
                <img 
                  src={product.image?.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              <h3 className="font-bold text-xl">{product.name}</h3>
              <div className="flex justify-between mt-4">
                <span className="text-green-400 font-mono">Buy: ${product.highest_buy || '---'}</span>
                <span className="text-red-400 font-mono">Sell: ${product.lowest_sell || '---'}</span>
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
    </div>
  );
}

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
                <span className="text-red-200 font-mono text-lg font-bold">${order.price}</span>
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
                <span className="text-green-200 font-mono text-lg font-bold">${order.price}</span>
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