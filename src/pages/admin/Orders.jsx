import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, StatusBadge } from '../../components/UI';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const dark = {
  card:    { background: '#1C1910', border: '1px solid rgba(201,162,39,0.10)', borderRadius: 16 },
  input:   {
    height: 38, padding: '0 12px', background: '#1C1910',
    border: '1px solid rgba(201,162,39,0.18)', borderRadius: 10,
    color: '#E8D8A0', fontSize: 13, outline: 'none', fontFamily: 'Nunito, sans-serif',
    width: '100%',
  },
  select: {
    height: 38, padding: '0 32px 0 12px', background: '#1C1910',
    border: '1px solid rgba(201,162,39,0.18)', borderRadius: 10,
    color: '#E8D8A0', fontSize: 13, outline: 'none', cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif', appearance: 'none',
  },
  label:  { color: '#6B5B30', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 },
};

/* ── Dark Modal ── */
function OrderModal({ order, onClose, onUpdate }) {
  const [newStatus, setNewStatus]   = useState(order?.status || '');
  const [adminNote, setAdminNote]   = useState(order?.adminNote || '');
  const [updating, setUpdating]     = useState(false);

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
      setAdminNote(order.adminNote || '');
    }
  }, [order]);

  if (!order) return null;

  const update = async () => {
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${order._id}/status`, { status: newStatus, adminNote });
      toast.success(`Order updated to ${newStatus}`);
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setUpdating(false);
  };

  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(201,162,39,0.07)' }}>
      <span style={{ color: '#6B5B30', fontSize: 12, fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#E8D8A0', fontSize: 13, fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#171410', border: '1px solid rgba(201,162,39,0.15)',
        borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '92vh',
        overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid rgba(201,162,39,0.08)',
          position: 'sticky', top: 0, background: '#171410', zIndex: 10, borderRadius: '20px 20px 0 0',
        }}>
          <div>
            <p style={{ color: '#C9A227', fontWeight: 900, fontSize: 14 }}>{order.orderNumber}</p>
            <p style={{ color: '#6B5B30', fontSize: 11 }}>Order Details</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.15)', borderRadius: 8, cursor: 'pointer', color: '#C9A227', padding: 7, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Items */}
          <p style={{ color: '#8A7A5A', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Items ({order.items?.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: 12, background: '#1C1910', borderRadius: 12, border: '1px solid rgba(201,162,39,0.07)' }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, overflow: 'hidden', background: '#252015', flexShrink: 0 }}>
                  {item.image
                    ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💡</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#E8D8A0', fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{item.name}</p>
                  <p style={{ color: '#6B5B30', fontSize: 12 }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                </div>
                <p style={{ color: '#C9A227', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Info grid — responsive */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#1C1910', borderRadius: 12, padding: 14, border: '1px solid rgba(201,162,39,0.07)' }}>
              <p style={{ color: '#6B5B30', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Customer</p>
              <p style={{ color: '#E8D8A0', fontSize: 13, fontWeight: 700 }}>{order.user?.name}</p>
              <p style={{ color: '#6B5B30', fontSize: 12, marginTop: 2 }}>{order.user?.email}</p>
              {order.user?.phone && <p style={{ color: '#6B5B30', fontSize: 12, marginTop: 2 }}>📞 {order.user?.phone}</p>}
            </div>
            <div style={{ background: '#1C1910', borderRadius: 12, padding: 14, border: '1px solid rgba(201,162,39,0.07)' }}>
              <p style={{ color: '#6B5B30', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Delivery Address</p>
              <p style={{ color: '#E8D8A0', fontSize: 13, fontWeight: 700 }}>{order.shippingAddress?.name || order.user?.name}</p>
              <p style={{ color: '#8A7A5A', fontSize: 12, marginTop: 2 }}>{order.shippingAddress?.address}</p>
              <p style={{ color: '#8A7A5A', fontSize: 12 }}>{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}</p>
            </div>
          </div>

          {/* Totals */}
          <div style={{ background: '#1C1910', borderRadius: 12, padding: 14, border: '1px solid rgba(201,162,39,0.07)', marginBottom: 20 }}>
            <Row label="Subtotal"   value={`₹${order.subtotal?.toLocaleString()}`} />
            <Row label="Delivery"   value={order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`} />
            {order.discount > 0 && <Row label="Discount" value={`-₹${order.discount?.toLocaleString()}`} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 4 }}>
              <span style={{ color: '#E8D8A0', fontWeight: 900, fontSize: 14 }}>Total</span>
              <span style={{ color: '#C9A227', fontWeight: 900, fontSize: 18 }}>₹{order.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Update status */}
          <div style={{ background: '#1C1910', borderRadius: 12, padding: 14, border: '1px solid rgba(201,162,39,0.07)' }}>
            <p style={{ color: '#8A7A5A', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Update Order Status</p>
            <div style={{ marginBottom: 12 }}>
              <label style={dark.label}>New Status</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  style={{ ...dark.select, width: '100%' }}>
                  {STATUSES.map(s => (
                    <option key={s} value={s} style={{ background: '#171410', color: '#E8D8A0' }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B5B30' }}>▾</span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={dark.label}>Admin Note (optional)</label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Internal note for this order…"
                rows={2}
                style={{
                  ...dark.input, height: 'auto', padding: '10px 12px',
                  resize: 'none', lineHeight: 1.5, borderRadius: 10,
                }}
              />
            </div>
            <button
              onClick={update}
              disabled={updating}
              style={{
                width: '100%', height: 44, borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#7a5200,#C9A227)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: updating ? 'not-allowed' : 'pointer',
                opacity: updating ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {updating
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Updating…</>
                : 'Update Order'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminOrders() {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [total,         setTotal]         = useState(0);
  const [pages,         setPages]         = useState(1);
  const [page,          setPage]          = useState(1);
  const [statusFilter,  setStatusFilter]  = useState('');
  const [search,        setSearch]        = useState('');
  const [searchInput,   setSearchInput]   = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) q.set('status', statusFilter);
      if (search)       q.set('search', search);
      const { data } = await api.get(`/admin/orders?${q}`);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  return (
    <AdminLayout title="Orders">
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#6B5B30', pointerEvents: 'none' }} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Order # or customer name…"
            style={{ ...dark.input, paddingLeft: 34 }}
          />
        </div>
        <button onClick={handleSearch}
          style={{ height: 38, padding: '0 16px', background: 'linear-gradient(135deg,#7a5200,#C9A227)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          Search
        </button>

        {/* Status filter */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ ...dark.select, minWidth: 140 }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s} style={{ background: '#171410' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B5B30' }}>▾</span>
        </div>

        {(search || statusFilter) && (
          <button onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter(''); setPage(1); }}
            style={{ height: 38, padding: '0 12px', background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.15)', borderRadius: 10, color: '#C9A227', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            Clear
          </button>
        )}

        <span style={{ color: '#6B5B30', fontSize: 12, fontWeight: 600, marginLeft: 'auto' }}>{total} orders</span>
      </div>

      {/* ── MOBILE: Card list ── */}
      {loading
        ? <LoadingSpinner size="lg" text="Loading orders…" />
        : orders.length === 0
          ? <div style={{ padding: 48, textAlign: 'center', color: '#6B5B30', background: '#1C1910', borderRadius: 16, border: '1px solid rgba(201,162,39,0.10)' }}>No orders found</div>
          : (
            <>
              {/* Mobile cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }} className="orders-mobile">
                {orders.map(o => (
                  <div key={o._id} style={{ background: '#1C1910', border: '1px solid rgba(201,162,39,0.10)', borderRadius: 14, padding: '13px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <p style={{ color: '#C9A227', fontSize: 13, fontWeight: 800 }}>{o.orderNumber}</p>
                        <p style={{ color: '#E8D8A0', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{o.user?.name || 'N/A'}</p>
                        <p style={{ color: '#6B5B30', fontSize: 11 }}>{o.user?.email}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#C9A227', fontSize: 14, fontWeight: 900 }}>₹{o.total?.toLocaleString()}</p>
                        <div style={{ marginTop: 4 }}><StatusBadge status={o.status} /></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#6B5B30', fontSize: 11 }}>
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}
                      </span>
                      <button onClick={() => setSelectedOrder(o)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'rgba(201,162,39,0.10)', border: '1px solid rgba(201,162,39,0.20)', borderRadius: 8, color: '#C9A227', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        <Eye size={12} /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div style={{ background: '#1C1910', border: '1px solid rgba(201,162,39,0.10)', borderRadius: 16, overflow: 'hidden', marginBottom: 18 }} className="orders-desktop">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                    <thead>
                      <tr style={{ background: 'rgba(201,162,39,0.05)', borderBottom: '1px solid rgba(201,162,39,0.08)' }}>
                        {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                          <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6B5B30', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={o._id} style={{ borderBottom: '1px solid rgba(201,162,39,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(201,162,39,0.02)' }}>
                          <td style={{ padding: '12px 14px', fontSize: 12, color: '#C9A227', fontWeight: 800 }}>{o.orderNumber}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <p style={{ fontSize: 13, color: '#E8D8A0', fontWeight: 700 }}>{o.user?.name || 'N/A'}</p>
                            <p style={{ fontSize: 11, color: '#6B5B30' }}>{o.user?.email}</p>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: 12, color: '#8A7A5A' }}>{o.items?.length}</td>
                          <td style={{ padding: '12px 14px', fontSize: 13, color: '#C9A227', fontWeight: 800 }}>₹{o.total?.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px' }}><StatusBadge status={o.status} /></td>
                          <td style={{ padding: '12px 14px', fontSize: 11, color: '#6B5B30', whiteSpace: 'nowrap' }}>
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <button onClick={() => setSelectedOrder(o)}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'rgba(201,162,39,0.10)', border: '1px solid rgba(201,162,39,0.20)', borderRadius: 7, color: '#C9A227', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
      }

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, flexWrap: 'wrap' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ width: 36, height: 36, borderRadius: 8, background: '#1C1910', border: '1px solid rgba(201,162,39,0.15)', color: '#C9A227', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}>
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{
                width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: page === p ? 'linear-gradient(135deg,#7a5200,#C9A227)' : '#1C1910',
                color: page === p ? '#fff' : '#8A7A5A',
                outline: page === p ? 'none' : '1px solid rgba(201,162,39,0.15)',
              }}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ width: 36, height: 36, borderRadius: 8, background: '#1C1910', border: '1px solid rgba(201,162,39,0.15)', color: '#C9A227', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === pages ? 0.4 : 1 }}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={fetchOrders}
        />
      )}

      <style>{`
        @media (min-width: 768px) {
          .orders-mobile  { display: none !important; }
          .orders-desktop { display: block !important; }
        }
        @media (max-width: 767px) {
          .orders-mobile  { display: flex !important; }
          .orders-desktop { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
}
