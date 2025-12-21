// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
import React, { useEffect, useState } from 'react';
import API from './api';
import { Monitor, TrendingUp, AlertCircle } from 'lucide-react';

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('products/')
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error(err);
        setError("Could not connect to Django. Check if the server is running on port 8000.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-black text-blue-500 mb-8">TECH-MARKET</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4">
              <div className="aspect-video bg-black rounded-xl mb-4 overflow-hidden">
                <img src={product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`} 
  alt={product.name}
  className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-xl">{product.name}</h3>
              <div className="flex justify-between mt-4">
                <span className="text-green-400 font-mono">${product.highest_buy || '---'}</span>
                <span className="text-red-400 font-mono">${product.lowest_sell || '---'}</span>
              </div>
            </div>
          ))
        ) : !error && (
          <p className="text-slate-500">Loading products from Django...</p>
        )}
      </div>
    </div>
  );
}

export default App;