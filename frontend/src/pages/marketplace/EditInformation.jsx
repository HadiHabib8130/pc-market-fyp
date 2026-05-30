import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Save, UserCircle } from 'lucide-react';

const EditInformation = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Holds all our text input values
  const [formData, setFormData] = useState({});
  // Holds any uploaded image files
  const [selectedImage, setSelectedImage] = useState(null);

  // 1. Fetch current data to pre-fill the form
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('https://hadi8130.pythonanywhere.com/api/users/account/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRole(response.data.role);
        setFormData(response.data.profile); // Pre-fill the state with existing data
      } catch (error) {
        console.error("Failed to fetch info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccountData();
  }, []);

  // 2. Handle Text Typing
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle File Selection
  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  // 4. Submit the Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const submitData = new FormData();
    
    // We explicitly tell React to IGNORE these fields when looping through text
    const imageFieldNames = ['profile_picture', 'shop_photo', 'face_photo', 'cnic_front', 'cnic_back'];

    // Append all text fields
    Object.keys(formData).forEach(key => {
      // If the field is NOT an image, and isn't null, append it!
      if (!imageFieldNames.includes(key) && formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });

    // Append the NEW image file ONLY if they actually selected one from their computer
    if (selectedImage) {
      if (role === 'buyer') submitData.append('profile_picture', selectedImage);
      if (role === 'seller') submitData.append('shop_photo', selectedImage);
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.patch('https://hadi8130.pythonanywhere.com/api/users/account/me/', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      // Send them back to the view page on success
      navigate('/account/info');
    } catch (error) {
      console.error("Update failed:", error.response?.data);
      alert("Failed to update profile. Check the console for errors.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-white">Loading Editor...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-slate-900 border border-slate-800 rounded-xl">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Profile Information</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SHARED FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
            <input 
              type="text" name="full_name" value={formData.full_name || ''} onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 focus:border-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
            <input 
              type="text" name={role === 'buyer' ? 'phone_no' : 'phone'} 
              value={role === 'buyer' ? (formData.phone_no || '') : (formData.phone || '')} 
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 focus:border-blue-500 outline-none" 
            />
          </div>
        </div>

        {/* ROLE SPECIFIC FIELDS */}
        {role === 'buyer' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Display Name</label>
              <input type="text" name="display_name" value={formData.display_name || ''} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Delivery Address</label>
              <textarea name="address" value={formData.address || ''} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 h-24" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-blue-500 file:text-white hover:file:bg-blue-600" />
            </div>
          </div>
        )}

        {role === 'seller' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Business Name</label>
                  <input type="text" name="business_name" value={formData.business_name || ''} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">City</label>
                  <input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3" />
               </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Shop/Residential Address</label>
              <textarea name="shop_address" value={formData.shop_address || ''} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 h-24" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Update Shop Photo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-blue-500 file:text-white hover:file:bg-blue-600" />
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button 
          type="submit" 
          disabled={saving}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Saving Updates...' : 'Save Changes'}
        </button>

      </form>
    </div>
  );
};

export default EditInformation;