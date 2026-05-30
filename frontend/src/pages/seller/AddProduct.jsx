import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProduct = () => {
  // --- Navigation & Loading State ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Search & Selection State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);

  // --- Image Handling State ---
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // --- Form Data State ---
  const [listingData, setListingData] = useState({
    price: '',
    condition: 'USED',
    description: '',
    has_warranty: false,
    warranty_months: '',
    warranty_info: '',
    category: ''
  });

  const categories = [
    { id: 'CPU', name: 'Processor', icon: '💻' },
    { id: 'GPU', name: 'Graphics Card', icon: '🎮' },
    { id: 'RAM', name: 'Memory', icon: '⚡' },
    { id: 'SSD', name: 'Solid State', icon: '🚀' },
    { id: 'HDD', name: 'Hard Drive', icon: '💿' },
    { id: 'MOBO', name: 'Motherboard', icon: '🔌' },
    { id: 'PSU', name: 'Power Supply', icon: '🔋' },
    { id: 'CASE', name: 'PC Case', icon: '🖥️' },
    { id: 'COOLER', name: 'CPU Cooler', icon: '❄️' },
  ];

  // --- Search Logic (Debounced) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) fetchMasterProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchMasterProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://hadi8130.pythonanywhere.com/api/products/master-search/`,
        { params: { q: searchQuery, category: listingData.category } }
      );
      setSearchResults(response.data.results);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Image Upload Logic (Append Mode) ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Append to existing images
    setSelectedImages((prevImages) => [...prevImages, ...files]);

    // Append to existing previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const clearPhotos = () => {
    setSelectedImages([]);
    setPreviews([]);
  };

  // --- Final Submission (POST) ---
  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('master_product', selectedMaster.id);
    data.append('price', listingData.price);
    data.append('condition', listingData.condition);
    data.append('description', listingData.description);
    data.append('has_warranty', listingData.has_warranty);
    
    if (listingData.has_warranty) {
      data.append('warranty_months', listingData.warranty_months);
      data.append('warranty_info', listingData.warranty_info);
    }

    selectedImages.forEach((image) => {
      data.append('uploaded_images', image);
    });

    try {
      const token = localStorage.getItem('token'); 
      await axios.post('https://hadi8130.pythonanywhere.com/api/products/listings/create/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      alert("Listing Posted Successfully!");
      setStep(1); 
      clearPhotos();
    } catch (err) {
      console.error("Upload failed", err.response?.data);
      alert("Error posting listing. Ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 text-white font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="bg-slate-800/80 p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">Add New Listing</h1>
            <p className="text-slate-400 text-sm">Step {step} of 3: {step === 1 ? 'Select Category' : step === 2 ? 'Find Product' : 'Listing Details'}</p>
          </div>
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
            >
              ← Go Back
            </button>
          )}
        </div>

        <div className="p-8">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setListingData({ ...listingData, category: cat.id }); setStep(2); }}
                  className="flex flex-col items-center justify-center p-6 bg-slate-800/40 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-slate-800/80 transition-all group"
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="font-semibold text-base">{cat.name}</span>
                  <span className="text-xs text-slate-500 mt-1">{cat.id}</span>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: HARDWARE SEARCH */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search for your ${listingData.category}...`}
                  className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {loading && <div className="absolute right-4 top-4 animate-spin text-blue-500">⚙️</div>}
              </div>

              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { setSelectedMaster(item); setStep(3); }}
                      className="flex items-center p-4 bg-slate-800/30 border border-slate-700 rounded-xl hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <img src={item.stock_image_url} className="w-16 h-16 object-contain bg-white rounded-lg p-1 mr-4" alt="Stock" />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{item.brand}</h4>
                        <p className="text-slate-300">{item.model_name}</p>
                      </div>
                      <span className="text-blue-400 text-sm font-bold">Select →</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-10 italic">Type to search the reference database...</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: LISTING DETAILS & IMAGES */}
          {step === 3 && selectedMaster && (
            <form onSubmit={handlePost} className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
              
              {/* Left Column: Product Preview & Images */}
              <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-700 text-center">
                  <img src={selectedMaster.stock_image_url} className="w-48 h-48 mx-auto object-contain mb-4" alt="Selected" />
                  <h2 className="text-xl font-bold text-blue-400">{selectedMaster.brand}</h2>
                  <p className="text-slate-400 text-sm">{selectedMaster.model_name}</p>
                </div>

                {/* IMAGE UPLOAD SECTION */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-slate-400 text-sm">
                      Actual Photos of Item 
                      <span className="ml-2 text-blue-400 font-bold">({selectedImages.length} added)</span>
                    </label>
                    {selectedImages.length > 0 && (
                      <button type="button" onClick={clearPhotos} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
                    )}
                  </div>

                  <div className={`border-2 border-dashed rounded-xl p-4 transition-all bg-slate-950/50 ${selectedImages.length >= 3 ? 'border-green-500/50' : 'border-slate-700 hover:border-blue-500'}`}>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center py-2">
                      <span className="text-2xl mb-1">📸</span>
                      <span className="text-blue-400 text-sm font-medium">Click to add more photos</span>
                    </label>

                    {previews.length > 0 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                        {previews.map((url, i) => (
                          <div key={i} className="relative flex-shrink-0">
                            <img src={url} className="w-20 h-20 object-cover rounded-lg border border-slate-700" alt="Preview" />
                            <div className="absolute top-1 right-1 bg-blue-600 text-[10px] px-1 rounded shadow-lg">{i + 1}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Seller Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Price (PKR)</label>
                  <input type="number" required className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500" placeholder="e.g. 45000" onChange={(e) => setListingData({...listingData, price: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Condition</label>
                    <select className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg outline-none" onChange={(e) => setListingData({...listingData, condition: e.target.value})}>
                      <option value="USED">Used</option>
                      <option value="OPEN">Open Box</option>
                      <option value="NEW">New</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Warranty</label>
                    <div className="flex h-[50px] border border-slate-700 rounded-lg overflow-hidden">
                      <button type="button" onClick={() => setListingData({...listingData, has_warranty: true})} className={`flex-1 ${listingData.has_warranty ? 'bg-blue-600' : 'bg-slate-950'}`}>Yes</button>
                      <button type="button" onClick={() => setListingData({...listingData, has_warranty: false})} className={`flex-1 ${!listingData.has_warranty ? 'bg-blue-600' : 'bg-slate-950'}`}>No</button>
                    </div>
                  </div>
                </div>

                {listingData.has_warranty && (
                  <div className="p-3 bg-slate-800/40 rounded-xl space-y-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
                    <input type="number" placeholder="Months remaining" className="w-full bg-slate-950 border border-slate-700 p-2 rounded-lg" onChange={(e) => setListingData({...listingData, warranty_months: e.target.value})} />
                    <textarea placeholder="Shop name or warranty details..." className="w-full bg-slate-950 border border-slate-700 p-2 rounded-lg h-16" onChange={(e) => setListingData({...listingData, warranty_info: e.target.value})} />
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 text-sm mb-1">Description</label>
                  <textarea required className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg h-28 outline-none focus:border-blue-500" placeholder="Usage history, faults, or included accessories..." onChange={(e) => setListingData({...listingData, description: e.target.value})} />
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]">
                  {loading ? 'Processing...' : 'Confirm & Post Listing'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;