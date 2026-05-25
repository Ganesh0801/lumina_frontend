import React, { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, Modal, StatusBadge } from '../../components/UI';

const card = { background:'#1C1910', border:'1px solid rgba(201,162,39,0.10)', borderRadius:16 };

export default function AdminUsers() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [detail,   setDetail]   = useState(null);
  const [modalOpen,setModalOpen]= useState(false);
  const [detLoading,setDetLoading]=useState(false);
  const LIMIT = 15;
  const pages = Math.ceil(total / LIMIT);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/users?page=${page}&limit=${LIMIT}`)
      .then(r => { setUsers(r.data.users||[]); setTotal(r.data.total||0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const openUser = async (u) => {
    setModalOpen(true);
    setDetLoading(true);
    setDetail(null);
    try {
      const { data } = await api.get(`/admin/users/${u._id}`);
      // Normalize: backend returns { user, orders }
      setDetail({
        user:   data.user   || data,
        orders: data.orders || [],
      });
    } catch {
      setDetail({ user: u, orders: [] });
    }
    setDetLoading(false);
  };

  // Helper to safely get location from user object
  const getLocation = (u) => {
    if (!u?.address) return '—';
    const parts = [u.address.city, u.address.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  const PaginationBar = () => pages > 1 ? (
    <div style={{ display:'flex', justifyContent:'center', gap:7, marginTop:16 }}>
      <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
        style={{ width:34, height:34, borderRadius:8, background:'#1C1910', border:'1px solid rgba(201,162,39,0.15)', color:'#C9A227', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===1?0.4:1 }}>
        <ChevronLeft size={15}/>
      </button>
      {Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p=>(
        <button key={p} onClick={()=>setPage(p)}
          style={{ width:34, height:34, borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', border:'none',
            background:page===p?'linear-gradient(135deg,#7a5200,#C9A227)':'#1C1910',
            color:page===p?'#fff':'#8A7A5A',
            outline:page===p?'none':'1px solid rgba(201,162,39,0.15)',
          }}>{p}</button>
      ))}
      <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
        style={{ width:34, height:34, borderRadius:8, background:'#1C1910', border:'1px solid rgba(201,162,39,0.15)', color:'#C9A227', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===pages?0.4:1 }}>
        <ChevronRight size={15}/>
      </button>
    </div>
  ) : null;

  return (
    <AdminLayout title="Customers">

      {/* Count */}
      <p style={{ color:'#6B5B30', fontSize:12, fontWeight:600, marginBottom:14 }}>{total} registered customers</p>

      {loading ? <LoadingSpinner size="lg" text="Loading customers…" /> : users.length === 0 ? (
        <div style={{ ...card, padding:48, textAlign:'center', color:'#6B5B30', fontSize:13 }}>No customers yet</div>
      ) : (
        <>
          {/* ── MOBILE: Card list ── */}
          <div className="lg:hidden space-y-3">
            {users.map(u => (
              <div key={u._id} style={{ ...card, padding:14, display:'flex', alignItems:'center', gap:12 }}>
                {/* Avatar */}
                <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
                  background:'linear-gradient(135deg,#7a5200,#C9A227)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff', fontWeight:900, fontSize:15 }}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:'#E8D8A0', fontSize:13, fontWeight:700, marginBottom:2 }}>{u.name}</p>
                  <p style={{ color:'#6B5B30', fontSize:11, marginBottom:1 }}>{u.email}</p>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {u.phone && <span style={{ color:'#8A7A5A', fontSize:10 }}>📞 {u.phone}</span>}
                    <span style={{ color:'#8A7A5A', fontSize:10 }}>📍 {getLocation(u)}</span>
                    <span style={{ color:'#C9A227', fontSize:10, fontWeight:700 }}>₹{(u.totalSpent||0).toLocaleString()} spent</span>
                  </div>
                </div>
                <button onClick={() => openUser(u)}
                  style={{ width:32, height:32, borderRadius:8, background:'rgba(201,162,39,0.10)', border:'1px solid rgba(201,162,39,0.20)', color:'#C9A227', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <Eye size={14}/>
                </button>
              </div>
            ))}
          </div>

          {/* ── DESKTOP: Table ── */}
          <div className="hidden lg:block" style={{ ...card, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'rgba(201,162,39,0.05)', borderBottom:'1px solid rgba(201,162,39,0.08)' }}>
                    {['Customer','Email','Phone','Location','Orders','Spent','Joined',''].map((h,i) => (
                      <th key={i} style={{ padding:'11px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#6B5B30', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u,i) => (
                    <tr key={u._id} style={{ borderBottom:'1px solid rgba(201,162,39,0.05)', background:i%2===0?'transparent':'rgba(201,162,39,0.02)' }}>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                          <div style={{ width:30, height:30, borderRadius:8, flexShrink:0,
                            background:'linear-gradient(135deg,#7a5200,#C9A227)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            color:'#fff', fontWeight:900, fontSize:12 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color:'#E8D8A0', fontSize:13, fontWeight:700 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 14px', fontSize:12, color:'#8A7A5A' }}>{u.email}</td>
                      <td style={{ padding:'12px 14px', fontSize:12, color:'#8A7A5A' }}>{u.phone||'—'}</td>
                      {/* ✅ FIX: safely read address.city */}
                      <td style={{ padding:'12px 14px', fontSize:12, color:'#8A7A5A' }}>{getLocation(u)}</td>
                      <td style={{ padding:'12px 14px', fontSize:12, color:'#C9A227', fontWeight:700 }}>{u.totalOrders||0}</td>
                      <td style={{ padding:'12px 14px', fontSize:12, color:'#C9A227', fontWeight:700 }}>₹{(u.totalSpent||0).toLocaleString()}</td>
                      <td style={{ padding:'12px 14px', fontSize:11, color:'#6B5B30', whiteSpace:'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        <button onClick={() => openUser(u)}
                          style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', background:'rgba(201,162,39,0.10)', border:'1px solid rgba(201,162,39,0.20)', borderRadius:7, color:'#C9A227', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                          <Eye size={12}/> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationBar />
        </>
      )}

      {/* ── User Detail Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Customer Details" size="md">
        {detLoading ? <LoadingSpinner text="Loading details…" /> : detail && (() => {
          const u = detail.user || {};
          const orders = detail.orders || [];
          const totalSpent = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0);
          return (
            <div className="space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background:'#F7F5F0' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-base text-[#1C1C1C] truncate">{u.name}</p>
                  <p className="text-sm text-[#6B6B6B] truncate">{u.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase text-white"
                    style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>{u.role}</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl flex items-center gap-2" style={{ background:'#F7F5F0' }}>
                  <Phone size={14} className="text-[#B8860B] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#ABABAB] font-bold uppercase tracking-wider">Phone</p>
                    <p className="text-xs font-bold text-[#1C1C1C] truncate">{u.phone||'—'}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl flex items-center gap-2" style={{ background:'#F7F5F0' }}>
                  <Calendar size={14} className="text-[#B8860B] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#ABABAB] font-bold uppercase tracking-wider">Joined</p>
                    <p className="text-xs font-bold text-[#1C1C1C]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:'Total Orders', value: orders.length },
                  { label:'Delivered',    value: orders.filter(o=>o.status==='delivered').length },
                  { label:'Total Spent',  value: `₹${totalSpent.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl text-center" style={{ background:'#F7F5F0' }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#ABABAB] mb-1">{label}</p>
                    <p className="font-black text-sm text-[#B8860B]">{value}</p>
                  </div>
                ))}
              </div>

              {/* ✅ FIX: Show full address — city, state, pincode, country */}
              <div className="p-4 rounded-xl" style={{ background:'#F7F5F0' }}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-[#B8860B]" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#ABABAB]">Delivery Address</p>
                </div>
                {u.address && (u.address.city || u.address.street) ? (
                  <div className="space-y-0.5 ml-5">
                    {u.address.street  && <p className="text-sm font-semibold text-[#1C1C1C]">{u.address.street}</p>}
                    <p className="text-xs text-[#6B6B6B]">
                      {[u.address.city, u.address.state, u.address.pincode].filter(Boolean).join(', ')}
                    </p>
                    {u.address.country && <p className="text-xs text-[#6B6B6B]">{u.address.country}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-[#ABABAB] ml-5">No address saved</p>
                )}
              </div>

              {/* Recent orders */}
              {orders.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-3">Order History ({orders.length})</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {orders.slice(0,10).map(o => (
                      <div key={o._id} className="flex items-center justify-between p-3 rounded-xl" style={{ background:'#F7F5F0' }}>
                        <div>
                          <p className="text-xs font-bold text-[#B8860B]">{o.orderNumber}</p>
                          <p className="text-xs text-[#ABABAB]">{o.items?.length} item{o.items?.length!==1?'s':''} · {new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={o.status} />
                          <p className="text-xs font-black text-[#1C1C1C] mt-1">₹{o.total?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {orders.length === 0 && (
                <div className="p-6 text-center rounded-xl" style={{ background:'#F7F5F0' }}>
                  <p className="text-sm text-[#ABABAB] font-semibold">No orders placed yet</p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </AdminLayout>
  );
}
