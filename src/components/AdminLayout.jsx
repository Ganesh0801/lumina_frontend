import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  BarChart3, Zap, LogOut, Menu, X, ChevronRight, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to:'/admin',            label:'Dashboard', icon:LayoutDashboard },
  { to:'/admin/orders',     label:'Orders',    icon:ShoppingBag     },
  { to:'/admin/products',   label:'Products',  icon:Package         },
  { to:'/admin/users',      label:'Customers', icon:Users           },
  { to:'/admin/financials', label:'Financials',icon:BarChart3       },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (to) => location.pathname === to;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{
        padding:'20px 18px', borderBottom:'1px solid rgba(201,162,39,0.08)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:'linear-gradient(135deg,#7a5200,#C9A227)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 12px rgba(184,134,11,0.3)',
          }}>
            <Zap size={17} color="#fff" fill="#fff" />
          </div>
          <div>
            <p style={{ fontWeight:900, fontSize:15, letterSpacing:3, color:'#C9A227', lineHeight:1 }}>LUMINA</p>
            <p style={{ fontSize:9, color:'#6B5B30', marginTop:2, letterSpacing:1 }}>ADMIN PANEL</p>
          </div>
        </div>
        {/* Close btn — mobile only */}
        <button onClick={() => setOpen(false)}
          style={{ background:'none', border:'none', cursor:'pointer', color:'#6B5B30', padding:4, display:'none' }}
          className="lg:hidden !block">
          <X size={18} />
        </button>
      </div>

      {/* Nav links */}
      <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto', display:'flex', flexDirection:'column', gap:3 }}>
        {NAV.map(({ to, label, icon:Icon }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to}
              style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'11px 13px', borderRadius:11,
                fontSize:13, fontWeight:active?800:600,
                textDecoration:'none', transition:'all 0.2s',
                background: active ? 'linear-gradient(135deg,#7a5200,#C9A227)' : 'transparent',
                color: active ? '#fff' : '#8A7A5A',
                boxShadow: active ? '0 4px 14px rgba(184,134,11,0.28)' : 'none',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(201,162,39,0.08)'; e.currentTarget.style.color='#C9A227'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8A7A5A'; }}}>
              <Icon size={17} style={{ flexShrink:0 }} />
              <span style={{ flex:1 }}>{label}</span>
              {active && <ChevronRight size={13} style={{ opacity:0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding:'10px', borderTop:'1px solid rgba(201,162,39,0.08)' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:9, padding:'9px 11px',
          background:'rgba(201,162,39,0.06)', borderRadius:11, marginBottom:6,
        }}>
          <div style={{
            width:32, height:32, borderRadius:9, flexShrink:0,
            background:'linear-gradient(135deg,#7a5200,#C9A227)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontWeight:900, fontSize:13,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#E8D8A0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize:10, color:'#6B5B30', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }}
          style={{
            display:'flex', alignItems:'center', gap:8, width:'100%',
            padding:'9px 12px', borderRadius:9, border:'none',
            background:'transparent', color:'#EF4444', fontSize:13, fontWeight:700,
            cursor:'pointer', transition:'background 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display:'flex', height:'100vh', background:'#111008', overflow:'hidden' }}>

      {/* ── SIDEBAR (desktop: fixed, mobile: drawer) ── */}
      {/* Desktop sidebar */}
      <aside style={{
        width:230, background:'#171410',
        borderRight:'1px solid rgba(201,162,39,0.09)',
        display:'flex', flexDirection:'column', flexShrink:0,
        position:'fixed', top:0, left:0, bottom:0, zIndex:60,
      }} className="hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:70, backdropFilter:'blur(2px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside style={{
        width:240, background:'#171410',
        borderRight:'1px solid rgba(201,162,39,0.09)',
        display:'flex', flexDirection:'column',
        position:'fixed', top:0, left:0, bottom:0, zIndex:80,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }} className="lg:hidden">
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
        marginLeft:0,
      }} className="lg:ml-[230px]">

        {/* Top bar */}
        <header style={{
          height:56, background:'#171410',
          borderBottom:'1px solid rgba(201,162,39,0.08)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 16px', flexShrink:0, gap:12,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Hamburger — mobile only */}
            <button onClick={() => setOpen(true)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#C9A227', padding:4, borderRadius:8, display:'none' }}
              className="lg:hidden !flex">
              <Menu size={22} />
            </button>
            <h1 style={{ fontWeight:800, fontSize:16, color:'#E8D8A0', letterSpacing:0.2 }}>{title}</h1>
          </div>
          <Link to="/"
            style={{
              display:'flex', alignItems:'center', gap:5,
              fontSize:11, fontWeight:700, color:'#8A7A5A',
              textDecoration:'none', padding:'5px 11px',
              border:'1px solid rgba(201,162,39,0.14)', borderRadius:8,
              transition:'all 0.2s', whiteSpace:'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.color='#C9A227'; e.currentTarget.style.borderColor='rgba(201,162,39,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='#8A7A5A'; e.currentTarget.style.borderColor='rgba(201,162,39,0.14)'; }}>
            <ExternalLink size={12} /> View Store
          </Link>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto', padding:'20px 16px', background:'#111008' }}
          className="lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
