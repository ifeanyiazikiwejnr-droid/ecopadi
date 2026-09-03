import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import RequireAdmin from './components/RequireAdmin';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderLookup from './pages/OrderLookup';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import VIP from './pages/VIP';
import FAQ from './pages/FAQ';
import Delivery from './pages/Delivery';
import Legal from './pages/Legal';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminOrders from './pages/Admin/Orders';
import AdminPreorders from './pages/Admin/Preorders';
import AdminSettings from './pages/Admin/Settings';

export default function App() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order-lookup" element={<OrderLookup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/vip" element={<VIP />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/legal/:page" element={<Legal />} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>}>
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="preorders" element={<AdminPreorders />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<div className="wrap section"><h2>Page not found</h2></div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
