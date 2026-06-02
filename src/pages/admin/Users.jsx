import React, { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, StatusBadge } from '../../components/UI';

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
            {/* Dark Customer Modal */}
      {modalOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(3px)' }} onClick={() => setModalOpen(false)} />
          <div style={{
            position:'relative', background:'#171410', border:'1px solid rgba(201,162,39,0.15)',
            borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh',
            overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.7)',
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(201,162,39,0.08)', position:'sticky', top:0, background:'#171410', zIndex:10, borderRadius:'20px 20px 0 0' }}>
              <p style={{ color:'#E8D8A0', fontWeight:900, fontSize:14 }}>Customer Details</p>
              <button onClick={() => setModalOpen(false)} style={{ background:'rgba(201,162,39,0.08)', border:'1px solid rgba(201,162,39,0.15)', borderRadius:8, cursor:'pointer', color:'#C9A227', padding:6, display:'flex' }}>✕</button>
            </div>
            <div style={{ padding:18 }}>
              {detLoading ? (
                <LoadingSpinner size="md" text="Loading customer…" />
              ) : (() => {
                if (!detail) return null;
                const { user: u, orders } = detail;
                const totalSpent = orders.reduce((s, o) => s + (o.status !== 'cancelled' && o.status !== 'refunded' ? (o.total || 0) : 0), 0);
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {/* Avatar + name */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, padding:14, background:'#1C1910', borderRadius:12, border:'1px solid rgba(201,162,39,0.07)' }}>
                      <div style={{ width:48, height:48, borderRadius:12, flexShrink:0, background:'linear-gradient(135deg,#7a5200,#C9A227)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:20 }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ color:'#E8D8A0', fontWeight:900, fontSize:15 }}>{u.name}</p>
                        <p style={{ color:'#6B5B30', fontSize:12, marginTop:2 }}>{u.email}</p>
                        {u.phone && <p style={{ color:'#8A7A5A', fontSize:12 }}>📞 {u.phone}</p>}
                      </div>
                    </div>
                    {/* Stats */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                      {[
                        { label:'Orders',   value: orders.length },
                        { label:'Delivered', value: orders.filter(o=>o.status==='delivered').length },
                        { label:'Spent',     value: `₹${totalSpent.toLocaleString()}` },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background:'#1C1910', border:'1px solid rgba(201,162,39,0.07)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                          <p style={{ color:'#6B5B30', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{label}</p>
                          <p style={{ color:'#C9A227', fontWeight:900, fontSize:15 }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Address */}
                    {u.address && (u.address.city || u.address.street) && (
                      <div style={{ background:'#1C1910', border:'1px solid rgba(201,162,39,0.07)', borderRadius:10, padding:12 }}>
                        <p style={{ color:'#6B5B30', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>📍 Address</p>
                        {u.address.street && <p style={{ color:'#E8D8A0', fontSize:13, fontWeight:600 }}>{u.address.street}</p>}
                        <p style={{ color:'#8A7A5A', fontSize:12 }}>{[u.address.city, u.address.state, u.address.pincode].filter(Boolean).join(', ')}</p>
                      </div>
                    )}
                    {/* Recent orders */}
                    {orders.length > 0 && (
                      <div>
                        <p style={{ color:'#8A7A5A', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Order History ({orders.length})</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:7, maxHeight:200, overflowY:'auto' }}>
                          {orders.slice(0,10).map(o => (
                            <div key={o._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'#1C1910', borderRadius:10, border:'1px solid rgba(201,162,39,0.07)' }}>
                              <div>
                                <p style={{ color:'#C9A227', fontSize:12, fontWeight:700 }}>{o.orderNumber}</p>
                                <p style={{ color:'#6B5B30', fontSize:11 }}>{new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                              </div>
                              <div style={{ textAlign:'right' }}>
                                <StatusBadge status={o.status} />
                                <p style={{ color:'#E8D8A0', fontSize:12, fontWeight:700, marginTop:3 }}>₹{o.total?.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {orders.length === 0 && (
                      <div style={{ padding:'20px', textAlign:'center', background:'#1C1910', borderRadius:10, color:'#6B5B30', fontSize:13 }}>No orders placed yet</div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}