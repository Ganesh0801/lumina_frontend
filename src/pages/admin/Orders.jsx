import React, { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, StatusBadge, Modal, Select } from '../../components/UI';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) q.set('status', statusFilter);
      const { data } = await api.get(`/admin/orders?${q}`);
      setOrders(data.orders);
      setTotal(data.total);
      setPages(data.pages);
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
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${selectedOrder._id}/status`, { status: newStatus, adminNote });
      toast.success(`Order updated to ${newStatus}`);
      setModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setUpdating(false);
  };

  return (
    <AdminLayout title="Orders">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${statusFilter === s ? 'bg-gold-gradient text-white' : 'glass text-dark-300 hover:text-gold-400'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="ml-auto text-dark-400 text-sm self-center">{total} orders</div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" text="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-dark-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-dark">
              <thead>
                <tr>
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-gold-400 text-sm font-medium">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-dark-100 font-medium">{order.user?.name}</p>
                      <p className="text-xs text-dark-500">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-dark-300">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-gold-400">₹{order.total?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium capitalize px-2 py-1 rounded-lg ${order.paymentStatus === 'paid' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-4 text-sm text-dark-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => openOrder(order)}
                        className="p-2 text-dark-400 hover:text-gold-400 hover:bg-gold-500/10 rounded-lg transition-all"
                      >
                        <Eye className="w-4 h-4" />
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
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="glass p-2 rounded-lg disabled:opacity-30 hover:border-gold-500/30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${page === p ? 'bg-gold-gradient text-white' : 'glass text-dark-300'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="glass p-2 rounded-lg disabled:opacity-30 hover:border-gold-500/30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Order: ${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700/50 rounded-xl p-4">
                <p className="text-dark-400 text-xs uppercase tracking-wider mb-2">Customer</p>
                <p className="text-dark-100 font-medium">{selectedOrder.user?.name}</p>
                <p className="text-dark-400 text-sm">{selectedOrder.user?.email}</p>
                <p className="text-dark-400 text-sm">{selectedOrder.user?.phone}</p>
              </div>
              <div className="bg-dark-700/50 rounded-xl p-4">
                <p className="text-dark-400 text-xs uppercase tracking-wider mb-2">Shipping Address</p>
                <p className="text-dark-200 text-sm">{selectedOrder.shippingAddress?.street}</p>
                <p className="text-dark-400 text-sm">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                <p className="text-dark-400 text-sm">{selectedOrder.shippingAddress?.pincode}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-dark-300 text-sm font-medium mb-3">Order Items</p>
              <div className="space-y-3">
                {selectedOrder.items?.map(item => (
                  <div key={item._id} className="flex gap-3 bg-dark-700/30 rounded-xl p-3">
                    <div className="w-14 h-14 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-dark-100 font-medium text-sm">{item.name}</p>
                      {item.color && <p className="text-dark-500 text-xs">Color: {item.color}</p>}
                      <p className="text-dark-400 text-sm">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                    </div>
                    <p className="font-bold text-gold-400">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-600 mt-4 pt-4 space-y-1.5">
                <div className="flex justify-between text-sm text-dark-400">
                  <span>Subtotal</span><span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-dark-400">
                  <span>Delivery</span><span>{selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between font-bold text-dark-100 pt-1">
                  <span>Total</span><span className="gradient-text">₹{selectedOrder.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div className="bg-gold-600/5 border border-gold-600/20 rounded-xl p-4">
              <p className="text-gold-400 text-sm font-medium mb-3">Update Order Status</p>
              <Select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="mb-3">
                {STATUSES.map(s => <option key={s} value={s} className="bg-dark-800 capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </Select>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Admin note (optional)..."
                rows={2}
                className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none mb-3"
              />
              <button
                onClick={updateStatus}
                disabled={updating || newStatus === selectedOrder.status}
                className="btn-gold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>

            {/* Tracking History */}
            {selectedOrder.tracking?.length > 0 && (
              <div>
                <p className="text-dark-300 text-sm font-medium mb-3">Tracking History</p>
                <div className="space-y-2">
                  {[...selectedOrder.tracking].reverse().map((t, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="text-dark-500 flex-shrink-0 text-xs pt-0.5">{new Date(t.timestamp).toLocaleString()}</span>
                      <div>
                        <span className="text-gold-400 capitalize font-medium">{t.status}</span>
                        <span className="text-dark-400 mx-2">—</span>
                        <span className="text-dark-300">{t.message}</span>
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
