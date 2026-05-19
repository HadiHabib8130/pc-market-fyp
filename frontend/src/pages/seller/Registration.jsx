import React, { useState } from 'react';
import axios from 'axios';
import { 
  User, Briefcase, ArrowRight, ArrowLeft, Camera, 
  ShieldCheck, Lock, CheckCircle2, MapPin, Mail, 
  Phone, UserCircle, CreditCard, Home as HomeIcon 
} from 'lucide-react';

const Registration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState({});
  
  const [formData, setFormData] = useState({
    tier: 'INDIVIDUAL',
    full_name: '',
    father_name: '',
    email: '',
    phone: '',
    nickname: '',
    cnic_number: '',
    province: '',
    city: '',
    address: '', 
    password: '',
  });

  const [files, setFiles] = useState({
    cnic_front: null,
    cnic_back: null,
    face_photo: null,
    shop_photo: null,
  });

  // Modern Input Styling Class
  const inputClass = "w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 shadow-inner";

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [e.target.name]: file });
      setPreviews({ ...previews, [e.target.name]: URL.createObjectURL(file) });
    }
  };

  const isStepValid = () => {
    if (step === 2) return formData.full_name && formData.father_name && formData.email && formData.phone && formData.nickname && formData.cnic_number;
    if (step === 3) return formData.province && formData.city && formData.address;
    if (step === 4) return files.cnic_front && files.cnic_back && files.face_photo;
    return true;
  };

  const finalizeRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    Object.keys(files).forEach(key => { if (files[key]) data.append(key, files[key]); });

try {
      await axios.post('http://127.0.0.1:8000/api/users/register-seller/', data);
      setStep(6);
    } catch (err) {
      // THIS WILL SHOW THE EXACT DJANGO ERROR IN THE CONSOLE
      console.error("Backend Error:", err.response?.data); 
      alert(`Error: ${err.response?.data?.error || 'Registration failed'}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white selection:bg-blue-500/30">
      <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        
        {/* Animated Progress Header */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800">
          <div className="h-full bg-blue-500 transition-all duration-700 ease-out" style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        <div className="p-10 md:p-16">
          
          {/* STEP 1: TIER SELECTION */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-4xl font-black mb-2">Become a Seller</h2>
              <p className="text-slate-500 mb-10">Select your account type to get started.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={() => { setFormData({...formData, tier: 'INDIVIDUAL'}); setStep(2); }} className={`group p-10 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] ${formData.tier === 'INDIVIDUAL' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-950'}`}>
                  <UserCircle className={`mb-4 transition-colors ${formData.tier === 'INDIVIDUAL' ? 'text-blue-500' : 'text-slate-600 group-hover:text-blue-400'}`} size={48} />
                  <h3 className="text-2xl font-bold">Individual Seller</h3>
                  <p className="text-slate-500 mt-2 text-sm leading-relaxed">Perfect for personal listings and selling used PC hardware.</p>
                </button>
                <button onClick={() => { setFormData({...formData, tier: 'PROFESSIONAL'}); setStep(2); }} className={`group p-10 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] ${formData.tier === 'PROFESSIONAL' ? 'border-purple-500 bg-purple-500/5' : 'border-slate-800 bg-slate-950'}`}>
                  <Briefcase className={`mb-4 transition-colors ${formData.tier === 'PROFESSIONAL' ? 'text-purple-500' : 'text-slate-600 group-hover:text-purple-400'}`} size={48} />
                  <h3 className="text-2xl font-bold">Professional Shop</h3>
                  <p className="text-slate-500 mt-2 text-sm leading-relaxed">Official account for computer retailers and local shops.</p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: IDENTITY DETAILS */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <User className="text-blue-500" /> Identity Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-2">Full Name</label>
                  <input name="full_name" value={formData.full_name} placeholder="Hadi Hassan" onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-2">Father's Name</label>
                  <input name="father_name" value={formData.father_name} placeholder="Father Name" onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-2">Email Address</label>
                  <input name="email" value={formData.email} type="email" placeholder="hadi@example.com" onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-2">Phone Number</label>
                  <input name="phone" value={formData.phone} placeholder="03XXXXXXXXX" onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-2">Display Handle</label>
                  <input name="nickname" value={formData.nickname} placeholder="TechPro_99" onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-2">CNIC Number</label>
                  <input name="cnic_number" value={formData.cnic_number} placeholder="33100-XXXXXXX-X" onChange={handleInputChange} className={inputClass} />
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                  <ArrowLeft size={16} /> Back to Tiers
                </button>
                <button 
                  onClick={() => isStepValid() && setStep(3)} 
                  disabled={!isStepValid()} 
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 active:scale-95"
                >
                  Continue to Location <ArrowRight size={18}/>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION DETAILS */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <MapPin className="text-blue-500" /> Location Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-2">Province</label>
                  <input name="province" value={formData.province} placeholder="Punjab" onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-2">City</label>
                  <input name="city" value={formData.city} placeholder="Faisalabad" onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-2">
                    {formData.tier === 'PROFESSIONAL' ? "Complete Shop Address" : "Residential Address"}
                  </label>
                  <textarea name="address" value={formData.address} placeholder="Street, Sector, Building No." onChange={handleInputChange} rows="3" className={`${inputClass} resize-none`} />
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                <button onClick={() => setStep(2)} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                  <ArrowLeft size={16} /> Edit Identity
                </button>
                <button 
                  onClick={() => isStepValid() && setStep(4)} 
                  disabled={!isStepValid()} 
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30"
                >
                  Continue to KYC <ArrowRight size={18}/>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: KYC VERIFICATION (16:9 GRID) */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                <ShieldCheck className="text-blue-500" /> KYC Verification
              </h2>
              <p className="text-slate-500 mb-10 text-sm italic">Verification documents are strictly confidential and stored securely.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {['cnic_front', 'cnic_back', 'face_photo', 'shop_photo'].map(field => (
                  (field !== 'shop_photo' || formData.tier === 'PROFESSIONAL') && (
                    <div key={field} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2">
                        {field.replace('_', ' ')} {field === 'shop_photo' && '(Opt)'}
                      </label>
                      <label className="relative aspect-video bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 group overflow-hidden transition-all">
                        {previews[field] ? (
                          <img src={previews[field]} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="text-center group-hover:scale-110 transition-transform duration-300">
                            <Camera className="mx-auto mb-2 text-slate-700 group-hover:text-blue-400" size={24} />
                            <span className="text-[9px] font-black text-slate-600 uppercase">Upload Image</span>
                          </div>
                        )}
                        <input type="file" name={field} onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  )
                ))}
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                <button onClick={() => setStep(3)} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                  <ArrowLeft size={16} /> Edit Location
                </button>
                <button 
                  onClick={() => isStepValid() && setStep(5)} 
                  disabled={!isStepValid()} 
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30"
                >
                  Final Security <ArrowRight size={18}/>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SECURITY & SUBMISSION */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col items-center">
              <h2 className="text-4xl font-black mb-4">Set Your Password</h2>
              <p className="text-slate-500 mb-10 text-center max-w-sm">Create a strong password to protect your store and financial data.</p>
              
              <div className="w-full max-w-md space-y-6">
                <div className="relative group">
                  <Lock className="absolute left-5 top-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input name="password" type="password" placeholder="••••••••••••" onChange={handleInputChange} className={`${inputClass} pl-14`} />
                </div>
                
                <button 
                  onClick={finalizeRegistration} 
                  disabled={loading || !formData.password} 
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/40 active:scale-[0.98]"
                >
                  {loading ? 'Securing Profile...' : 'Complete Registration'}
                </button>
                
                <button onClick={() => setStep(4)} className="w-full text-slate-500 hover:text-white transition-colors text-sm font-medium">
                  Go Back to KYC
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: CELEBRATION */}
          {step === 6 && (
            <div className="text-center animate-in zoom-in duration-700">
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={56} />
              </div>
              <h2 className="text-5xl font-black mb-4 tracking-tighter">Application Sent!</h2>
              <p className="text-slate-400 max-w-sm mx-auto mb-12 leading-relaxed">
                Your profile is now under professional review. We will verify your CNIC and {formData.tier === 'PROFESSIONAL' ? 'Shop' : 'Identity'} details shortly.
              </p>
              <button 
                onClick={() => window.location.href = '/'} 
                className="bg-white text-slate-950 px-14 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl"
              >
                Return to Marketplace
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Registration;