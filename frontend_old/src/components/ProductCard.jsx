import React from 'react';
import { TrendingUp } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl hover:border-blue-500 transition-all">
      {/* 16:9 Widescreen Image */}
      <div className="aspect-video w-full bg-slate-900 overflow-hidden">
        <img 
          src={product.image || 'https://via.placeholder.com/1600x900'} 
          alt={product.name}
          className="w-full h-full object-cover opacity-90"
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold">{product.name}</h3>
        
        {/* Market Data (Price-Time Priority logic display) */}
        <div className="flex gap-2 my-4">
          <div className="flex-1 bg-slate-950 p-2 rounded border border-green-500/20 text-center">
            <span className="text-[10px] text-slate-500 block uppercase">Buy Order</span>
            <span className="text-green-400 font-mono font-bold">${product.highest_buy || '0.00'}</span>
          </div>
          <div className="flex-1 bg-slate-950 p-2 rounded border border-red-500/20 text-center">
            <span className="text-[10px] text-slate-500 block uppercase">Sell Order</span>
            <span className="text-red-400 font-mono font-bold">${product.lowest_sell || '0.00'}</span>
          </div>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold flex items-center justify-center gap-2">
          <TrendingUp size={20} />
          View Live Market
        </button>
      </div>
    </div>
  );
};

export default ProductCard;