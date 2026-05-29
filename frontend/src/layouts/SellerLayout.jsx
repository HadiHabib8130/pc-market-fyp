import React from 'react';
import { Outlet, NavLink } from 'react-router-dom'; // Changed Link to NavLink
import { LayoutDashboard, PackagePlus, PlusCircle, LogOut, User } from 'lucide-react'; // Added PlusCircle, User

const SellerLayout = () => {
  // Helper function to handle active styling
  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-3 text-sm transition-colors ${
      isActive ? 'text-blue-500 font-bold' : 'text-slate-400 hover:text-blue-400'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar - Fixed on the left */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-xl font-black text-blue-500 tracking-tighter">SELLER HUB</h1>
        </div>

        <nav className="flex-1 space-y-6">
          {/* Dashboard Link */}
          <NavLink to="/seller-hub/portal/dashboard" className={navLinkClass}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          {/* My Products / Inventory Link */}
          <NavLink to="/seller-hub/portal/inventory" className={navLinkClass}>
            <PackagePlus size={18} /> My Products
          </NavLink>

          {/* NEW: Add Product Tab */}
          <NavLink to="/seller-hub/portal/add-product" className={navLinkClass}>
            <PlusCircle size={18} /> Add Product
          </NavLink>

          {/* NEW: Edit Account Tab */}
          <NavLink to="/seller-hub/portal/account" className={navLinkClass}>
            <User size={18} /> Edit Account
          </NavLink>
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <NavLink to="/" className="flex items-center gap-3 text-sm text-slate-500 hover:text-white">
            <LogOut size={18} /> Exit to Market
          </NavLink>
        </div>
      </aside>

      {/* Content Area - Changes based on the route */}
      <main className="flex-1 p-10">
        <Outlet /> 
      </main>
    </div>
  );
};

export default SellerLayout;