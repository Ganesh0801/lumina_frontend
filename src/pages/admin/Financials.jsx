import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner } from '../../components/UI';

const STATUS_COLORS = {
  pending: '#FBB91C', confirmed: '#60A5FA', processing: '#A78BFA',
  shipped: '#EAB308', delivered: '#4ADE80', cancelled: '#F87171', refunded: '#9CA3AF'
};

export default function AdminFinancials() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (from) q.set('from', from);
      if (to) q.set('to', to);
      const res = await api.get(`/admin/financials?${q}`);
      setData(res.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const revenue = data?.report?.find(r => r._id === 'delivered')?.revenue || 0;
  const cancelled = data?.report?.find(r => r._id === 'cancelled')?.count || 0;
  const delivered = data?.report?.find(r => r._id === 'delivered')?.count || 0;
  const pending = (data?.report?.find(r => r._id === 'pending')?.revenue || 0) +
                  (data?.report?.find(r => r._id === 'confirmed')?.revenue || 0) +
                  (data?.report?.find(r => r._id === 'processing')?.revenue || 0) +
                  (data?.report?.find(r => r._id === 'shipped')?.revenue || 0);

  const cancelledRevenue = data?.report?.find(r => r._id === 'cancelled')?.revenue || 0;

  return (
    <AdminLayout title="Financials">
      {/* Date Filter */}
      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-end mb-8">
        <div className="flex-1">
          <label className="text-xs text-dark-400 block mb-1.5">From Date</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-dark-400 block mb-1.5">To Date</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" />
        </div>
        <button onClick={fetchData} className="btn-gold px-6 py-2.5 rounded-xl text-sm">Apply Filter</button>
        <button onClick={() => { setFrom(''); setTo(''); fetchData(); }} className="glass px-4 py-2.5 rounded-xl text-sm text-dark-300 hover:text-dark-100">Reset</button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Generating report..." />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-dark-400 text-sm">Confirmed Revenue</p>
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-green-400">₹{revenue.toLocaleString()}</p>
              <p className="text-dark-500 text-xs mt-1">From delivered orders</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-dark-400 text-sm">Pipeline Revenue</p>
                <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gold-400" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold gradient-text">₹{pending.toLocaleString()}</p>
              <p className="text-dark-500 text-xs mt-1">Active orders in progress</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-dark-400 text-sm">Cancelled Loss</p>
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-red-400">₹{cancelledRevenue.toLocaleString()}</p>
              <p className="text-dark-500 text-xs mt-1">{cancelled} cancelled orders</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-dark-400 text-sm">Delivery Success</p>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-blue-400">
                {delivered + cancelled > 0 ? Math.round((delivered / (delivered + cancelled)) * 100) : 0}%
              </p>
              <p className="text-dark-500 text-xs mt-1">{delivered} delivered successfully</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Revenue Chart */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-dark-100 mb-6">Daily Revenue</h2>
              {data?.daily?.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                    <XAxis dataKey="_id" stroke="#505050" tick={{ fill: '#707070', fontSize: 11 }}
                      tickFormatter={v => v.slice(5)} />
                    <YAxis stroke="#505050" tick={{ fill: '#707070', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 10, color: '#E8E8E8' }}
                      formatter={(v, n) => [n === 'revenue' ? `₹${v.toLocaleString()}` : v, n === 'revenue' ? 'Revenue' : 'Orders']}
                    />
                    <Legend wrapperStyle={{ color: '#707070', fontSize: 12 }} />
                    <Bar dataKey="revenue" fill="#C9A227" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="orders" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-dark-500">
                  <div className="text-center">
                    <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No revenue data for selected period</p>
                  </div>
                </div>
              )}
            </div>

            {/* Revenue by Status */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-dark-100 mb-6">Revenue by Order Status</h2>
              {data?.report?.length > 0 ? (
                <div className="space-y-3">
                  {data.report.sort((a, b) => b.revenue - a.revenue).map(item => {
                    const maxRevenue = Math.max(...data.report.map(r => r.revenue));
                    const pct = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={item._id}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[item._id] || '#C9A227' }} />
                            <span className="text-dark-200 capitalize">{item._id}</span>
                            <span className="text-dark-500 text-xs">({item.count} orders)</span>
                          </div>
                          <span className="font-semibold" style={{ color: STATUS_COLORS[item._id] || '#C9A227' }}>
                            ₹{item.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: STATUS_COLORS[item._id] || '#C9A227' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center text-dark-500">No data available</div>
              )}
            </div>
          </div>

          {/* Summary Table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gold-600/10">
              <h2 className="font-semibold text-dark-100">Detailed Report</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-dark">
                <thead>
                  <tr>
                    {['Status', 'Orders', 'Total Revenue', 'Delivery Revenue', 'Avg per Order'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.report?.map(row => (
                    <tr key={row._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{ background: `${STATUS_COLORS[row._id]}20`, color: STATUS_COLORS[row._id], border: `1px solid ${STATUS_COLORS[row._id]}40` }}>
                          {row._id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-200 font-semibold">{row.count}</td>
                      <td className="px-6 py-4 font-bold text-gold-400">₹{row.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-dark-300">₹{(row.deliveryRevenue || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-dark-300">
                        ₹{row.count > 0 ? Math.round(row.revenue / row.count).toLocaleString() : 0}
                      </td>
                    </tr>
                  ))}
                  {data?.report?.length > 0 && (
                    <tr className="bg-gold-500/5 border-t border-gold-600/20">
                      <td className="px-6 py-4 font-bold text-gold-400">TOTAL</td>
                      <td className="px-6 py-4 font-bold text-dark-100">{data.report.reduce((a, r) => a + r.count, 0)}</td>
                      <td className="px-6 py-4 font-bold text-gold-400">₹{data.report.reduce((a, r) => a + r.revenue, 0).toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-dark-100">₹{data.report.reduce((a, r) => a + (r.deliveryRevenue || 0), 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-dark-400">—</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
