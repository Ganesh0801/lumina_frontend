import React, { useState, useEffect } from 'react';
import { Eye, Users, Mail, Phone, MapPin, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, Modal, StatusBadge } from '../../components/UI';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const LIMIT = 15;

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/users?page=${page}&limit=${LIMIT}`)
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const openUser = async (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/admin/users/${user._id}`);
      setUserDetail(data);
    } catch { }
    setDetailLoading(false);
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout title="Customers">
      <div className="flex justify-between items-center mb-6">
        <p className="text-dark-400 text-sm">{total} registered customers</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" text="Loading customers..." />
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-dark-500">No customers yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-dark">
              <thead>
                <tr>
                  {['Customer', 'Email', 'Phone', 'Location', 'Orders', 'Total Spent', 'Joined', 'Action'].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gold-gradient rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-dark-100 text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-dark-300">{user.email}</td>
                    <td className="px-4 py-4 text-sm text-dark-300">{user.phone || '—'}</td>
                    <td className="px-4 py-4 text-sm text-dark-400">{user.address?.city ? `${user.address.city}, ${user.address.state}` : '—'}</td>
                    <td className="px-4 py-4">
                      <span className="text-blue-400 font-semibold">{user.totalOrders || 0}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gold-400 font-semibold">₹{(user.totalSpent || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-dark-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => openUser(user)}
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
            className="glass p-2 rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${page === p ? 'bg-gold-gradient text-white' : 'glass text-dark-300'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="glass p-2 rounded-lg disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* User Detail Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setUserDetail(null); }} title="Customer Details" size="lg">
        {detailLoading ? (
          <LoadingSpinner text="Loading customer details..." />
        ) : userDetail ? (
          <div className="space-y-6">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center text-white font-display text-2xl font-bold">
                {userDetail.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-dark-100">{userDetail.user?.name}</h3>
                <p className="text-dark-400 text-sm">{userDetail.user?.email}</p>
                <p className="text-dark-500 text-xs">Member since {new Date(userDetail.user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                <p className="text-dark-400 text-xs mb-1">Total Orders</p>
                <p className="font-display text-2xl font-bold text-blue-400">{userDetail.user?.totalOrders || userDetail.orders?.length}</p>
              </div>
              <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                <p className="text-dark-400 text-xs mb-1">Total Spent</p>
                <p className="font-display text-2xl font-bold text-gold-400">₹{(userDetail.user?.totalSpent || 0).toLocaleString()}</p>
              </div>
              <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                <p className="text-dark-400 text-xs mb-1">Avg Order</p>
                <p className="font-display text-2xl font-bold text-green-400">
                  ₹{userDetail.orders?.length ? Math.round((userDetail.user?.totalSpent || 0) / userDetail.orders.length).toLocaleString() : 0}
                </p>
              </div>
            </div>

            {/* Contact & Address */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700/30 rounded-xl p-4">
                <p className="text-dark-400 text-xs uppercase tracking-wider mb-3">Contact</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-gold-400" /><span className="text-dark-300">{userDetail.user?.email}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-gold-400" /><span className="text-dark-300">{userDetail.user?.phone || '—'}</span></div>
                </div>
              </div>
              <div className="bg-dark-700/30 rounded-xl p-4">
                <p className="text-dark-400 text-xs uppercase tracking-wider mb-3">Address</p>
                {userDetail.user?.address?.city ? (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gold-400 mt-0.5" />
                    <div>
                      <p className="text-dark-300">{userDetail.user.address.street}</p>
                      <p className="text-dark-400">{userDetail.user.address.city}, {userDetail.user.address.state}</p>
                      <p className="text-dark-400">{userDetail.user.address.pincode}</p>
                    </div>
                  </div>
                ) : <p className="text-dark-500 text-sm">No address saved</p>}
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <p className="text-dark-300 font-medium text-sm mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gold-400" /> Recent Orders
              </p>
              {userDetail.orders?.length === 0 ? (
                <p className="text-dark-500 text-sm text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {userDetail.orders.slice(0, 8).map(order => (
                    <div key={order._id} className="flex items-center justify-between bg-dark-700/30 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-mono text-gold-400 text-sm">{order.orderNumber}</p>
                        <p className="text-dark-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="font-bold text-gold-400 text-sm">₹{order.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
