import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SellerLayout from './layouts/SellerLayout';
import SellerHubLanding from './pages/seller/SellerHubLanding';
import Registration from './pages/seller/Registration';
import Home from './pages/marketplace/MarketplaceMain';
import MarketTradingRoom from './pages/marketplace/MarketTradingRoom';
// You'll need a Login page - we'll make a placeholder below
import Login from './pages/seller/Login'; 
import AddProduct from './pages/seller/AddProduct';
import MyProducts from './pages/seller/MyProducts';
import Dashboard from './pages/seller/Dashboard';
import SellerAccount from './pages/seller/SellerAccount';
import MarketplaceMain from './pages/marketplace/MarketplaceMain';
import BuyerRegister from './pages/marketplace/BuyerRegister';
import BuyerLogin from './pages/marketplace/BuyerLogin';
import ListingDetailPage from './pages/marketplace/ListingDetailPage';
import BuyOrderDetailPage from './pages/marketplace/BuyOrderDetailPage';
import AccountInformation from './pages/marketplace/AccountInformation';
import EditInformation from './pages/marketplace/EditInformation';
import MyBuyOrders from './pages/marketplace/MyBuyOrders';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. BUYER SIDE */}
        <Route path="/" element={<MarketplaceMain />} />
        <Route path="/market/:id" element={<MarketTradingRoom />} />
        <Route path="/register-buyer" element={<BuyerRegister />} />
        <Route path="/login-buyer" element={<BuyerLogin />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/bid/:id" element={<BuyOrderDetailPage />} />
        <Route path="/account/info" element={<AccountInformation />} />
        <Route path="/account/edit" element={<EditInformation />} />
        <Route path="/buyer/bids" element={<MyBuyOrders />} />

        {/* 2. SELLER HUB - PUBLIC (No Sidebar) */}
        <Route path="/seller-hub" element={<SellerHubLanding />} />
        <Route path="/seller-hub/register" element={<Registration />} />
        <Route path="/seller-hub/login" element={<Login />} />

        {/* 3. SELLER HUB - PRIVATE (Has Sidebar) */}
        {/* We move the dashboard under a /portal path or similar */}
        <Route path="/seller-hub/portal" element={<SellerLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<MyProducts />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="account" element={<SellerAccount />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;