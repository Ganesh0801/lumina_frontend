import React, { useState, useEffect } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, StatusBadge, Modal } from '../../components/UI';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

const cardStyle = { background:'#1C1910', border:'1px solid rgba(201,162,39,0.10)', borderRadius:16 };

export default function AdminOrders() {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [total,         setTotal]         = useState(0);
  const [pages,         setPages]         = useState(1);
  const [page,          setPage]          = useState(1);
  const [statusFilter,  setStatusFilter]  = useState('');
  const [search,        setSearch]        = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [updating,      setUpdating]      = useState(false);
  const [newStatus,     setNewStatus]     = useState('');
  const [adminNote,     setAdminNote]     = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit:15 });
      if (statusFilter) q.set('status', statusFilter);
      if (search)       q.set('search', search);
      const { data } = await api.get(`/admin/orders?${q}`);
      setOrders(data.orders); setTotal(data.total); setPages(data.pages);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const openOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNote(order.adminNote || '');
    setModalOpen(true);
  };

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${selectedOrder._id}/status`, { status: newStatus, adminNote });
      toast.success(`Order updated to ${newStatus}`);
      setModalOpen(false);
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    setUpdating(false);
  };

  const labelStyle = { color:'#6B5B30', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1 };
  const valueStyle = { color:'#E8D8A0', fontSize:13, fontWeight:600 };

  return (
    <AdminLayout title="Orders">

      {/* Toolbar */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        {/* Search */}
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6B5B30', pointerEvents:'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key==='Enter' && fetchOrders()}
            placeholder="Search order no or customer…"
            style={{
              width:'100%', height:38, paddingLeft:36, paddingRight:12,
              background:'#1C1910', border:'1px solid rgba(201,162,39,0.15)',
              borderRadius:10, color:'#E8D8A0', fontSize:13, outline:'none',
              fontFamily:'Nunito, sans-serif',
            }}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            height:38, padding:'0 32px 0 12px', background:'#1C1910',
            border:'1px solid rgba(201,162,39,0.15)', borderRadius:10,
            color:'#E8D8A0', fontSize:13, outline:'none', cursor:'pointer',
            fontFamily:'Nunito, sans-serif',
          }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} style={{ textTransform:'capitalize' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>

        <div style={{ color:'#6B5B30', fontSize:12, fontWeight:600, marginLeft:'auto' }}>{total} orders</div>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, overflow:'hidden', marginBottom:20 }}>
        {loading ? <LoadingSpinner size="lg" text="Loading orders…" /> : orders.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'#6B5B30' }}>No orders found</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(201,162,39,0.05)', borderBottom:'1px solid rgba(201,162,39,0.08)' }}>
                  {['Order #','Customer','Items','Total','Status','Date','Action'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#6B5B30', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o._id} style={{ borderBottom:'1px solid rgba(201,162,39,0.05)', background:i%2===0?'transparent':'rgba(201,162,39,0.02)', transition:'background 0.15s' }}>
                    <td style={{ padding:'13px 16px', fontSize:12, color:'#C9A227', fontWeight:800 }}>{o.orderNumber}</td>
                    <td style={{ padding:'13px 16px' }}>
                      <p style={{ fontSize:13, color:'#E8D8A0', fontWeight:700 }}>{o.user?.name||'N/A'}</p>
                      <p style={{ fontSize:11, color:'#6B5B30' }}>{o.user?.email}</p>
                    </td>
                    <td style={{ padding:'13px 16px', fontSize:12, color:'#8A7A5A' }}>{o.items?.length} item{o.items?.length!==1?'s':''}</td>
                    <td style={{ padding:'13px 16px', fontSize:13, color:'#C9A227', fontWeight:800 }}>₹{o.total?.toLocaleString()}</td>
                    <td style={{ padding:'13px 16px' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding:'13px 16px', fontSize:11, color:'#6B5B30', whiteSpace:'nowrap' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td style={{ padding:'13px 16px' }}>
                      <button onClick={() => openOrder(o)}
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
        <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
          <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{ width:36, height:36, borderRadius:8, background:'#1C1910', border:'1px solid rgba(201,162,39,0.15)', color:'#C9A227', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===1?0.4:1 }}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)}
              style={{ width:36, height:36, borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor:'pointer',
                background:page===p?'linear-gradient(135deg,#7a5200,#C9A227)':'#1C1910',
                color:page===p?'#fff':'#8A7A5A',
                border:page===p?'none':'1px solid rgba(201,162,39,0.15)',
              }}>{p}</button>
          ))}
          <button onClick={() => setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
            style={{ width:36, height:36, borderRadius:8, background:'#1C1910', border:'1px solid rgba(201,162,39,0.15)', color:'#C9A227', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===pages?0.4:1 }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Order ${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div className="space-y-5">
            {/* Items */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-3">Items ({selectedOrder.items?.length})</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background:'#F7F5F0' }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#EBEBEB] flex-shrink-0">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" onError={e=>{e.target.style.display='none'}} /> : <div className="w-full h-full flex items-center justify-center text-xl">💡</div>}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-[#1C1C1C]">{item.name}</p>
                      <p className="text-xs text-[#ABABAB]">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                    </div>
                    <p className="font-black text-[#B8860B] text-sm">₹{(item.price*item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ background:'#F7F5F0' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-[#ABABAB] mb-2">Customer</p>
                <p className="font-bold text-sm text-[#1C1C1C]">{selectedOrder.user?.name}</p>
                <p className="text-xs text-[#6B6B6B]">{selectedOrder.user?.email}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background:'#F7F5F0' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-[#ABABAB] mb-2">Delivery Address</p>
                <p className="text-sm text-[#1C1C1C] font-semibold">{selectedOrder.shippingAddress?.address}</p>
                <p className="text-xs text-[#6B6B6B]">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.pincode}</p>
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 rounded-xl space-y-2" style={{ background:'#F7F5F0' }}>
              <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] font-semibold">Subtotal</span><span className="font-bold">₹{selectedOrder.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6B6B6B] font-semibold">Delivery</span><span className="font-bold">{selectedOrder.deliveryCharge===0?'FREE':`₹${selectedOrder.deliveryCharge}`}</span></div>
              <div className="flex justify-between pt-2 border-t border-[#EBEBEB]"><span className="font-black text-[#1C1C1C]">Total</span><span className="font-black text-[#B8860B] text-lg">₹{selectedOrder.total?.toLocaleString()}</span></div>
            </div>

            {/* Update status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Update Status</label>
              <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="inp inp-select mb-3">
                {STATUSES.map(s=><option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Admin Note (optional)</label>
              <textarea value={adminNote} onChange={e=>setAdminNote(e.target.value)}
                placeholder="Internal note for this order…" rows={2}
                className="inp inp-textarea" />
            </div>

            <button onClick={updateStatus} disabled={updating}
              className="btn-gold w-full h-12 rounded-xl font-bold text-sm gap-2">
              {updating ? <><span className="spinner" /> Updating…</> : 'Update Order'}
            </button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
