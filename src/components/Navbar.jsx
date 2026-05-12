import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Zap, LogOut, Package, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/products?category=pendant', label: 'Pendants' },
    { to: '/products?category=wall', label: 'Wall Lights' },
    { to: '/products?category=smart', label: 'Smart Lights' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-900/95 backdrop-blur-xl shadow-2xl border-b border-gold-600/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center group-hover:animate-glow transition-all">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text tracking-widest">LUMINA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-gold-400 relative group ${
                  location.pathname === link.to.split('?')[0] ? 'text-gold-400' : 'text-dark-300'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px bg-gold-gradient w-0 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/products')}
              className="p-2 text-dark-300 hover:text-gold-400 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link to="/cart" className="relative p-2 text-dark-300 hover:text-gold-400 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-gradient rounded-full text-xs text-white flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm text-dark-200">{user.name?.split(' ')[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-xl py-2 animate-fade-in">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-200 hover:text-gold-400 hover:bg-white/5 transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-200 hover:text-gold-400 hover:bg-white/5 transition-colors">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <hr className="border-gold-600/20 my-1" />
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-gold px-5 py-2 rounded-lg text-sm hidden sm:block">
                Sign In
              </Link>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-dark-300">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden glass rounded-xl mb-4 p-4 animate-fade-in">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-3 text-dark-200 hover:text-gold-400 border-b border-white/5 last:border-0 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link to="/login" className="btn-gold block text-center py-3 rounded-lg mt-3">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
