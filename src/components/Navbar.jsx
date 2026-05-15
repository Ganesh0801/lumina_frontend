import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Zap, LogOut, Package, Home, Grid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQ,     setSearchQ]     = useState('');
  const [userOpen,    setUserOpen]    = useState(false);
  const { user, logout } = useAuth();
  const { cartCount }    = useCart();
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserOpen(false);
  }, [location]);

  // close user dropdown when clicking outside
  useEffect(() => {
    if (!userOpen) return;
    const handler = (e) => {
      if (!e.target.closest('#user-menu')) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userOpen]);

  const navLinks = [
    { to: '/',                          label: 'Home'       },
    { to: '/products',                  label: 'Shop'       },
    { to: '/products?category=pendant', label: 'Pendants'   },
    { to: '/products?category=wall',    label: 'Wall Lights'},
    { to: '/products?category=smart',   label: 'Smart'      },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const isActive = (to) => location.pathname === to.split('?')[0] && (!to.includes('?') || location.search.includes(to.split('?')[1]));

  return (
    <>
      {/* ── TOP NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/98 backdrop-blur-xl shadow-sm border-b border-[#EBEBEB]' : 'bg-white/95 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-black text-xl tracking-widest gradient-text">LUMINA</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className={`text-sm transition-colors relative group ${
                    isActive(l.to) ? 'text-[#B8860B] font-black' : 'text-[#6B6B6B] font-semibold hover:text-[#B8860B]'
                  }`}>
                  {l.label}
                  <span className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full transition-all duration-300 ${
                    isActive(l.to) ? 'w-full bg-[#C9A227]' : 'w-0 group-hover:w-full bg-[#C9A227]'
                  }`} />
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">

              {/* Search */}
              <button onClick={() => setSearchOpen(s => !s)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B6B] hover:bg-[#F7F5F0] hover:text-[#B8860B] transition-all">
                <Search className="w-5 h-5" />
              </button>

              {/* ✅ Cart with badge — always visible */}
              <Link to="/cart"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B6B] hover:bg-[#F7F5F0] hover:text-[#B8860B] transition-all">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] text-white font-black flex items-center justify-center shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* ✅ User icon — always visible, shows initial if logged in */}
              {user ? (
                <div id="user-menu" className="relative">
                  <button
                    onClick={() => setUserOpen(o => !o)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}
                    title={user.name}>
                    {user.name?.charAt(0).toUpperCase()}
                  </button>

                  {/* Dropdown */}
                  {userOpen && (
                    <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-[#EBEBEB] py-2 w-52 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-[#F0EDE6]">
                        <p className="font-black text-sm text-[#1C1C1C] truncate">{user.name}</p>
                        <p className="text-xs text-[#ABABAB] truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B6B6B] hover:text-[#B8860B] hover:bg-[#FFF8E1] transition-colors">
                          <Grid className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <Link to="/orders"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B6B6B] hover:text-[#B8860B] hover:bg-[#FFF8E1] transition-colors">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      <Link to="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B6B6B] hover:text-[#B8860B] hover:bg-[#FFF8E1] transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Guest: show user icon linking to login */}
                  <Link to="/login"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B6B] hover:bg-[#F7F5F0] hover:text-[#B8860B] transition-all"
                    title="Sign In">
                    <User className="w-5 h-5" />
                  </Link>
                  <Link to="/login"
                    className="btn-gold px-4 py-2 rounded-xl text-xs font-bold hidden sm:inline-flex">
                    Sign In
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B6B] hover:bg-[#F7F5F0] transition-all ml-1">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-3 animate-fade-in">
              <form onSubmit={handleSearch}>
                <div className="inp-wrap">
                  <Search className="inp-icon" />
                  <input
                    autoFocus
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search lights, lamps, pendants…"
                    className="inp"
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-[#EBEBEB] animate-fade-in">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`block px-6 py-3.5 text-sm font-semibold border-b border-[#F7F5F0] transition-colors ${
                  isActive(l.to) ? 'text-[#B8860B] bg-[#FFF8E1] font-black' : 'text-[#6B6B6B]'
                }`}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/orders" className="block px-6 py-3.5 text-sm font-semibold border-b border-[#F7F5F0] text-[#6B6B6B]">My Orders</Link>
                <Link to="/profile" className="block px-6 py-3.5 text-sm font-semibold border-b border-[#F7F5F0] text-[#6B6B6B]">Profile</Link>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="block w-full text-left px-6 py-3.5 text-sm font-semibold text-red-500">
                  Logout
                </button>
              </>
            ) : (
              <div className="px-6 py-4">
                <Link to="/login" className="btn-gold w-full py-3 rounded-xl block text-center text-sm">Sign In</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="bottom-nav lg:hidden">
        {[
          { to: '/',                                    icon: Home,         label: 'Home'                         },
          { to: '/products',                            icon: Grid,         label: 'Shop'                         },
          { to: '/cart',                                icon: ShoppingCart, label: 'Cart',   badge: cartCount      },
          { to: user ? '/orders'  : '/login',           icon: Package,      label: 'Orders'                       },
          { to: user ? '/profile' : '/login',           icon: User,         label: user ? user.name?.split(' ')[0] : 'Sign In' },
        ].map(({ to, icon: Icon, label, badge }) => {
          const active = location.pathname === to.split('?')[0];
          return (
            <Link key={to} to={to}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative">
              <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-[#FFF8E1]' : ''}`}>
                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-[#B8860B]' : 'text-[#ABABAB]'}`} />
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] text-white font-black flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold truncate max-w-[56px] text-center transition-colors ${active ? 'text-[#B8860B]' : 'text-[#ABABAB]'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
