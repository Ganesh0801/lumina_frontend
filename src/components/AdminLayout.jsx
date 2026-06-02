import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  BarChart3, Zap, LogOut, Menu, X, ChevronRight, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin',             label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders',      label: 'Orders',    icon: ShoppingBag     },
  { to: '/admin/products',    label: 'Products',  icon: Package         },
  { to: '/admin/users',       label: 'Customers', icon: Users           },
  { to: '/admin/financials',  label: 'Financials', icon: BarChart3      },
];

function SidebarNav({ user, logout, navigate, location, onClose }) {
  const isActive = (to) =>
    to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        padding: '18px 16px',
        borderBottom: '1px solid rgba(201,162,39,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#7a5200,#C9A227)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(184,134,11,0.3)',
          }}>
            <Zap size={17} color="#fff" fill="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 15, letterSpacing: 3, color: '#C9A227', lineHeight: 1 }}>LUMINA</p>
            <p style={{ fontSize: 9, color: '#6B5B30', marginTop: 2, letterSpacing: 1 }}>ADMIN PANEL</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.15)',
              borderRadius: 8, cursor: 'pointer', color: '#C9A227', padding: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '11px 13px', borderRadius: 11,
                fontSize: 13, fontWeight: active ? 800 : 600,
                textDecoration: 'none', transition: 'all 0.2s',
                background: active ? 'linear-gradient(135deg,#7a5200,#C9A227)' : 'transparent',
                color: active ? '#fff' : '#8A7A5A',
                boxShadow: active ? '0 4px 14px rgba(184,134,11,0.28)' : 'none',
              }}>
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && <ChevronRight size={13} style={{ opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(201,162,39,0.08)', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px',
          background: 'rgba(201,162,39,0.06)', borderRadius: 11, marginBottom: 6,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg,#7a5200,#C9A227)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 13,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#E8D8A0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: 10, color: '#6B5B30', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '9px 12px', borderRadius: 9, border: 'none',
            background: 'transparent', color: '#EF4444', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}

const SIDEBAR_W = 230;

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111008' }}>

      {/* ── DESKTOP SIDEBAR (always visible ≥ 1024px) ── */}
      <aside style={{
        width: SIDEBAR_W,
        background: '#171410',
        borderRight: '1px solid rgba(201,162,39,0.09)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 60,
        display: 'none',          // overridden by media query below
      }} className="admin-sidebar-desktop">
        <SidebarNav user={user} logout={logout} navigate={navigate} location={location} onClose={null} />
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div
          role="button"
          aria-label="Close menu"
          tabIndex={0}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 70, backdropFilter: 'blur(2px)' }}
          onClick={() => setDrawerOpen(false)}
          onKeyDown={e => e.key === 'Enter' && setDrawerOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <aside style={{
        width: 260,
        background: '#171410',
        borderRight: '1px solid rgba(201,162,39,0.09)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 80,
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <SidebarNav user={user} logout={logout} navigate={navigate} location={location} onClose={() => setDrawerOpen(false)} />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        className="admin-main-content">

        {/* Top bar */}
        <header style={{
          height: 56,
          background: '#171410',
          borderBottom: '1px solid rgba(201,162,39,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', flexShrink: 0, gap: 12,
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger — only shown on mobile via class */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#C9A227', padding: 4, borderRadius: 8,
              }}
              className="admin-hamburger">
              <Menu size={22} />
            </button>
            <h1 style={{ fontWeight: 800, fontSize: 16, color: '#E8D8A0', letterSpacing: 0.2 }}>{title}</h1>
          </div>
          <Link to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 700, color: '#8A7A5A',
              textDecoration: 'none', padding: '5px 11px',
              border: '1px solid rgba(201,162,39,0.14)', borderRadius: 8,
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A227'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8A7A5A'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.14)'; }}>
            <ExternalLink size={12} /> View Store
          </Link>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', background: '#111008' }}
          className="admin-main-scroll">
          {children}
        </main>
      </div>

      {/* Responsive CSS injected here */}
      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar-desktop { display: flex !important; flex-direction: column; }
          .admin-main-content { margin-left: ${SIDEBAR_W}px !important; }
          .admin-hamburger { display: none !important; }
        }
        @media (max-width: 1023px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-main-content { margin-left: 0 !important; }
          .admin-hamburger { display: flex !important; }
        }
        .admin-main-scroll {
          padding: 20px 16px;
        }
        @media (min-width: 1024px) {
          .admin-main-scroll {
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
