import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Package, TrendingUp, AlertTriangle, Clock, CheckCircle, Truck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, StatusBadge } from '../../components/UI';
import { Link } from 'react-router-dom';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#C9A227','#60A5FA','#4ADE80','#A78BFA','#F87171','#9CA3AF'];

function StatCard({ title, value, sub, icon: Icon, color = 'gold' }) {
  const colors = {
    gold: 'bg-gold-500/10 text-gold-400',
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    red: 'bg-red-500/10 text-red-400',
  };
  return (
    <div className="glass rounded-2xl p-5 flex items-start gap-4 hover:border-gold-500/20 transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-dark-400 text-sm mb-1">{title}</p>
        <p className="font-display text-2xl font-bold text-dark-50">{value}</p>
        {sub && <p className="text-dark-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><LoadingSpinner size="lg" text="Loading dashboard..." /></AdminLayout>;

  const { stats, recentOrders, monthlyRevenue, statusBreakdown, lowStock } = data;

  const chartData = monthlyRevenue.map(m => ({
    name: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    orders: m.count
  }));

  const pieData = statusBreakdown.map(s => ({ name: s._id, value: s.count }));

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} sub="All time" icon={TrendingUp} color="gold" />
        <StatCard title="Total Orders" value={stats.totalOrders} sub={`${stats.pendingOrders} pending`} icon={ShoppingBag} color="blue" />
        <StatCard title="Customers" value={stats.totalUsers} sub="Registered users" icon={Users} color="green" />
        <StatCard title="Products" value={stats.totalProducts} sub={`${stats.lowStockCount} low stock`} icon={Package} color={stats.lowStockCount > 0 ? 'red' : 'gold'} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-dark-400 text-sm mb-1">Avg Order Value</p>
          <p className="font-display text-xl font-bold gradient-text">₹{Math.round(stats.avgOrderValue || 0).toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-400" />
            <p className="text-dark-400 text-sm">Pending</p>
          </div>
          <p className="font-display text-xl font-bold text-yellow-400">{stats.pendingOrders}</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-dark-400 text-sm">Low Stock</p>
          </div>
          <p className="font-display text-xl font-bold text-red-400">{stats.lowStockCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h2 className="font-semibold text-dark-100 mb-6">Revenue Overview (6 months)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A227" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A227" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#505050" tick={{ fill: '#707070', fontSize: 12 }} />
                <YAxis stroke="#505050" tick={{ fill: '#707070', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 12, color: '#E8E8E8' }}
                  formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#C9A227" fill="url(#goldGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-56 flex items-center justify-center text-dark-500">No data yet</div>}
        </div>

        {/* Order Status Pie */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-dark-100 mb-4">Order Status</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 8, color: '#E8E8E8' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-dark-300 capitalize">{d.name}</span>
                    </div>
                    <span className="text-dark-200 font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-56 flex items-center justify-center text-dark-500">No orders yet</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-dark-100">Recent Orders</h2>
            <Link to="/admin/orders" className="text-gold-400 text-sm hover:text-gold-300">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-dark-500 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <Link key={order._id} to={`/admin/orders`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-200 group-hover:text-gold-400 transition-colors">{order.orderNumber}</p>
                    <p className="text-xs text-dark-500">{order.user?.name}</p>
                  </div>
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-bold text-gold-400">₹{order.total?.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Low Stock Alert
          </h2>
          {lowStock.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-dark-400 text-sm">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.map(p => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-dark-200">{p.name}</p>
                  <span className="text-red-400 font-bold text-sm">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
