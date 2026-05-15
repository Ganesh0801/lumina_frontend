import React, { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, Modal, StatusBadge } from '../../components/UI';

const cardStyle = { background:'#1C1910', border:'1px solid rgba(201,162,39,0.10)', borderRadius:16 };

export default function AdminUsers() {
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [userDetail,    setUserDetail]    = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const LIMIT = 15;
  const pages = Math.ceil(total / LIMIT);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/users?page=${page}&limit=${LIMIT}`)
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const openUser = async (user) => {
    setModalOpen(true);
    setDetailLoading(true);
    setUserDetail(null);
    try {
      const { data } = await api.get(`/admin/users/${user._id}`);
      setUserDetail(data);
    } catch { setUserDetail({ user }); }
    setDetailLoading(false);
  };

  return (
    <AdminLayout title="Customers">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <p style={{ color:'#6B5B30', fontSize:13, fontWeight:600 }}>{total} registered customers</p>
      </div>

      <div style={{ ...cardStyle, overflow:'hidden' }}>
        {loading ? <LoadingSpinner size="lg" text="Loading customers…" /> : users.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'#6B5B30', fontSize:13 }}>No customers yet</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(201,162,39,0.05)', borderBottom:'1px solid rgba(201,162,39,0.08)' }}>
                  {['Customer','Email','Phone','Location','Orders','Spent','Joined','Action'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#6B5B30', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom:'1px solid rgba(201,162,39,0.05)', background:i%2===0?'transparent':'rgba(201,162,39,0.02)' }}>
                    <td style={{ padding:'13px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#7a5200,#C9A227)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:13, flexShrink:0 }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color:'#E8D8A0', fontSize:13, fontWeight:700 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'13px 16px', fontSize:12, color:'#8A7A5A' }}>{u.email}</td>
                    <td style={{ padding:'13px 16px', fontSize:12, color:'#8A7A5A' }}>{u.phone||'—'}</td>
                    <td style={{ padding:'13px 16px', fontSize:12, color:'#8A7A5A' }}>{u.address?.city||'—'}</td>
                    <td style={{ padding:'13px 16px', fontSize:12, color:'#C9A227', fontWeight:700 }}>{u.orderCount||0}</td>
                    <td style={{ padding:'13px 16px', fontSize:12, color:'#C9A227', fontWeight:700 }}>₹{(u.totalSpent||0).toLocaleString()}</td>
                    <td style={{ padding:'13px 16px', fontSize:11, color:'#6B5B30', whiteSpace:'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td style={{ padding:'13px 16px' }}>
                      <button onClick={() => openUser(u)}
                        style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'rgba(201,162,39,0.10)', border:'1px solid rgba(201,162,39,0.20)', borderRadius:7, color:'#C9A227', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:20 }}>
          <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{ width:36, height:36, borderRadius:8, background:'#1C1910', border:'1px solid rgba(201,162,39,0.15)', color:'#C9A227', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===1?0.4:1 }}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)}
              style={{ width:36, height:36, borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor:'pointer',
                background:page===p?'linear-gradient(135deg,#7a5200,#C9A227)':'#1C1910',
                color:page===p?'#fff':'#8A7A5A',
                border:page===p?'none':'1px solid rgba(201,162,39,0.15)' }}>{p}</button>
          ))}
          <button onClick={() => setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
            style={{ width:36, height:36, borderRadius:8, background:'#1C1910', border:'1px solid rgba(201,162,39,0.15)', color:'#C9A227', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===pages?0.4:1 }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* User detail modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Customer Details" size="md">
        {detailLoading ? <LoadingSpinner text="Loading details…" /> : userDetail && (
          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background:'#F7F5F0' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                {(userDetail.user||userDetail)?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-base text-[#1C1C1C]">{(userDetail.user||userDetail)?.name}</p>
                <p className="text-sm text-[#6B6B6B]">{(userDetail.user||userDetail)?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase" style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)', color:'#fff' }}>
                  {(userDetail.user||userDetail)?.role}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:'Orders',    value: userDetail.orderCount || 0 },
                { label:'Spent',     value: `₹${(userDetail.totalSpent||0).toLocaleString()}` },
                { label:'Joined',    value: new Date((userDetail.user||userDetail)?.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'}) },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl text-center" style={{ background:'#F7F5F0' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] mb-1">{label}</p>
                  <p className="font-black text-sm text-[#B8860B]">{value}</p>
                </div>
              ))}
            </div>

            {/* Address */}
            {(userDetail.user||userDetail)?.address?.city && (
              <div className="p-4 rounded-xl" style={{ background:'#F7F5F0' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-[#ABABAB] mb-2">Address</p>
                <p className="text-sm text-[#1C1C1C] font-semibold">{(userDetail.user||userDetail).address.street}</p>
                <p className="text-xs text-[#6B6B6B]">{(userDetail.user||userDetail).address.city}, {(userDetail.user||userDetail).address.state} {(userDetail.user||userDetail).address.pincode}</p>
              </div>
            )}

            {/* Recent orders */}
            {userDetail.recentOrders?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-3">Recent Orders</p>
                <div className="space-y-2">
                  {userDetail.recentOrders.map(o => (
                    <div key={o._id} className="flex items-center justify-between p-3 rounded-xl" style={{ background:'#F7F5F0' }}>
                      <div>
                        <p className="text-xs font-bold text-[#B8860B]">{o.orderNumber}</p>
                        <p className="text-xs text-[#ABABAB]">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={o.status} />
                        <p className="text-xs font-bold text-[#1C1C1C] mt-1">₹{o.total?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
