import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Zap, LogOut, Package, Home, Grid, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/products?category=pendant', label: 'Pendants' },
    { to: '/products?category=wall', label: 'Wall Lights' },
    { to: '/products?category=smart', label: 'Smart' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) { navigate(`/products?search=${encodeURIComponent(searchQ)}`); setSearchOpen(false); }
  };

  const isActive = (to) => location.pathname === to.split('?')[0];

  return (
    <>
      {/* ── TOP NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-[#EBEBEB]' : 'bg-white/90 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#7a5200,#C9A227)'}}>
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-black text-xl tracking-widest gradient-text" style={{fontFamily:'Nunito'}}>LUMINA</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className={`text-sm font-700 transition-colors relative group ${isActive(l.to) ? 'text-[#B8860B] font-bold' : 'text-[#6B6B6B] hover:text-[#B8860B]'}`}
                  style={{fontWeight: isActive(l.to) ? 800 : 600}}>
                  {l.label}
                  <span className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full transition-all duration-300 ${isActive(l.to) ? 'w-full bg-[#C9A227]' : 'w-0 group-hover:w-full bg-[#C9A227]'}`} />
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(s => !s)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B6B] hover:bg-[#F7F5F0] hover:text-[#B8860B] transition-all">
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B6B] hover:bg-[#F7F5F0] hover:text-[#B8860B] transition-all">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] text-white font-bold flex items-center justify-center" style={{background:'linear-gradient(135deg,#7a5200,#C9A227)'}}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="relative group">
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{background:'linear-gradient(135deg,#7a5200,#C9A227)'}}>
                    {user.name?.charAt(0).toUpperCase()}
                  </button>
                  <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-[#EBEBEB] py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 border-b border-[#F0EDE6]">
                      <p className="font-bold text-sm text-[#1C1C1C] truncate">{user.name}</p>
                      <p className="text-xs text-[#ABABAB] truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B6B6B] hover:text-[#B8860B] hover:bg-[#FFF8E1]"><Grid className="w-4 h-4"/>Admin Panel</Link>}
                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B6B6B] hover:text-[#B8860B] hover:bg-[#FFF8E1]"><Package className="w-4 h-4"/>My Orders</Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B6B6B] hover:text-[#B8860B] hover:bg-[#FFF8E1]"><User className="w-4 h-4"/>Profile</Link>
                    <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4"/>Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn-gold px-4 py-2 rounded-xl text-sm hidden sm:inline-flex">Sign In</Link>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B6B] hover:bg-[#F7F5F0] transition-all">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-3 animate-fade-in">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ABABAB]" />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search lights, lamps, pendants…"
                  className="inp pl-10 pr-4 py-3 w-full"
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-[#EBEBEB] animate-fade-in">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`block px-6 py-3.5 text-sm font-semibold border-b border-[#F7F5F0] transition-colors ${isActive(l.to) ? 'text-[#B8860B] bg-[#FFF8E1]' : 'text-[#6B6B6B]'}`}>
                {l.label}
              </Link>
            ))}
            {!user && <Link to="/login" className="block px-6 py-4"><span className="btn-gold w-full py-3 rounded-xl block text-center">Sign In</span></Link>}
          </div>
        )}
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="bottom-nav lg:hidden">
        {[
          { to: '/', icon: Home, label: 'Home' },
          { to: '/products', icon: Grid, label: 'Shop' },
          { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
          { to: user ? '/orders' : '/login', icon: Package, label: 'Orders' },
          { to: user ? '/profile' : '/login', icon: User, label: user ? user.name?.split(' ')[0] : 'Sign In' },
        ].map(({ to, icon: Icon, label, badge }) => {
          const active = location.pathname === to.split('?')[0];
          return (
            <Link key={to} to={to} className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative">
              <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-[#FFF8E1]' : ''}`}>
                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-[#B8860B]' : 'text-[#ABABAB]'}`} />
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] text-white font-bold flex items-center justify-center" style={{background:'linear-gradient(135deg,#7a5200,#C9A227)'}}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors truncate max-w-[52px] text-center ${active ? 'text-[#B8860B]' : 'text-[#ABABAB]'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
