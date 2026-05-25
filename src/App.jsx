import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Orders        from './pages/Orders';
import OrderDetail   from './pages/OrderDetail';
import Profile       from './pages/Profile';

// Admin Pages
import AdminDashboard  from './pages/admin/Dashboard';
import AdminOrders     from './pages/admin/Orders';
import AdminProducts   from './pages/admin/Products';
import AdminUsers      from './pages/admin/Users';
import AdminFinancials from './pages/admin/Financials';

// Layout
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen" style={{ background:'#F7F5F0' }}>
      {user?.role !== 'admin' && <Navbar />}
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/products"       element={<Products />} />
        <Route path="/products/:id"   element={<ProductDetail />} />
        <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/cart"           element={<Cart />} />
        <Route path="/checkout"       element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders"         element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:id"     element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/orders"    element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/products"  element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/financials" element={<AdminRoute><AdminFinancials /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background:'#fff', color:'#1C1C1C', border:'1px solid #E8E4DC', borderRadius:12, fontSize:13, fontWeight:600 },
              success: { iconTheme: { primary:'#C9A227', secondary:'#fff' } },
              error:   { iconTheme: { primary:'#EF4444', secondary:'#fff' } },
            }}
          />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
