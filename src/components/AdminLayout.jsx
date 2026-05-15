import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Users, BarChart3, Zap, LogOut, Menu, X, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin',             label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders',      label: 'Orders',    icon: ShoppingBag     },
  { to: '/admin/products',    label: 'Products',  icon: Package         },
  { to: '/admin/users',       label: 'Customers', icon: Users           },
  { to: '/admin/financials',  label: 'Financials',icon: BarChart3       },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (to) => location.pathname === to;

  return (
    <div style={{ display:'flex', height:'100vh', background:'#111008', overflow:'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240,
        background: '#171410',
        borderRight: '1px solid rgba(201,162,39,0.10)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 60,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease',
      }}
      className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(201,162,39,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#7a5200,#C9A227)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(184,134,11,0.3)',
            }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 16, letterSpacing: 3, color: '#C9A227', lineHeight: 1 }}>LUMINA</p>
              <p style={{ fontSize: 10, color: '#6B5B30', marginTop: 2, letterSpacing: 1 }}>ADMIN PANEL</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 12,
                  fontSize: 14, fontWeight: active ? 800 : 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  background: active ? 'linear-gradient(135deg,#7a5200,#C9A227)' : 'transparent',
                  color: active ? '#fff' : '#8A7A5A',
                  boxShadow: active ? '0 4px 16px rgba(184,134,11,0.30)' : 'none',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(201,162,39,0.08)'; e.currentTarget.style.color = '#C9A227'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8A7A5A'; }}}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{label}</span>
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(201,162,39,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 10, padding: '10px 12px',
            background: 'rgba(201,162,39,0.06)', borderRadius: 12, marginBottom: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg,#7a5200,#C9A227)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 14,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#E8D8A0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ fontSize: 10, color: '#6B5B30', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '9px 12px', borderRadius: 10, border: 'none',
              background: 'transparent', color: '#EF4444', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:50 }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: 240 }}
        className="lg:ml-[240px] ml-0">

        {/* Top bar */}
        <header style={{
          height: 60, background: '#171410',
          borderBottom: '1px solid rgba(201,162,39,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ display:'none', background:'none', border:'none', cursor:'pointer', color:'#8A7A5A', padding: 4 }}
              className="lg:hidden !flex">
              <Menu size={20} />
            </button>
            <h1 style={{ fontWeight: 800, fontSize: 17, color: '#E8D8A0', letterSpacing: 0.3 }}>{title}</h1>
          </div>
          <Link to="/" target="_blank"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 700, color: '#8A7A5A',
              textDecoration: 'none', padding: '6px 12px',
              border: '1px solid rgba(201,162,39,0.15)',
              borderRadius: 8, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A227'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8A7A5A'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.15)'; }}>
            <ExternalLink size={13} /> View Store
          </Link>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#111008' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
