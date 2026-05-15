import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Package, TrendingUp, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, StatusBadge } from '../../components/UI';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#C9A227','#60A5FA','#4ADE80','#A78BFA','#F87171','#9CA3AF'];

function StatCard({ title, value, sub, icon: Icon, accent = '#C9A227' }) {
  return (
    <div style={{
      background: '#1C1910', border: '1px solid rgba(201,162,39,0.10)',
      borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div>
        <p style={{ color: '#8A7A5A', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{title}</p>
        <p style={{ color: '#E8D8A0', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ color: '#6B5B30', fontSize: 11, marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#1C1910', border: '1px solid rgba(201,162,39,0.10)', borderRadius: 16,
};

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><LoadingSpinner size="lg" text="Loading dashboard…" /></AdminLayout>;

  const { stats, recentOrders = [], monthlyRevenue = [], statusBreakdown = [], lowStock = [] } = data || {};

  const chartData = monthlyRevenue.map(m => ({
    name: MONTHS[(m._id?.month || 1) - 1],
    revenue: m.revenue || 0,
    orders: m.count || 0,
  }));

  const pieData = statusBreakdown.map(s => ({ name: s._id, value: s.count }));

  return (
    <AdminLayout title="Dashboard">

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
        <StatCard title="Total Revenue"  value={`₹${(stats?.totalRevenue||0).toLocaleString()}`}   sub="All time"              icon={TrendingUp} accent="#C9A227" />
        <StatCard title="Total Orders"   value={stats?.totalOrders||0}                               sub={`${stats?.pendingOrders||0} pending`} icon={ShoppingBag} accent="#60A5FA" />
        <StatCard title="Customers"      value={stats?.totalUsers||0}                                sub="Registered users"     icon={Users}     accent="#4ADE80" />
        <StatCard title="Products"       value={stats?.totalProducts||0}                             sub={`${stats?.lowStockCount||0} low stock`} icon={Package} accent={stats?.lowStockCount>0?'#F87171':'#C9A227'} />
      </div>

      {/* Secondary stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Avg Order Value', value:`₹${Math.round(stats?.avgOrderValue||0).toLocaleString()}`, color:'#C9A227' },
          { label:'Pending Orders',  value:stats?.pendingOrders||0,  color:'#FBB91C' },
          { label:'Low Stock Items', value:stats?.lowStockCount||0,  color:'#F87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...cardStyle, padding:16, textAlign:'center' }}>
            <p style={{ color:'#8A7A5A', fontSize:11, fontWeight:600, marginBottom:6 }}>{label}</p>
            <p style={{ color, fontSize:24, fontWeight:900 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, marginBottom:24 }}>
        {/* Revenue chart */}
        <div style={{ ...cardStyle, padding:20 }}>
          <p style={{ color:'#E8D8A0', fontWeight:800, fontSize:14, marginBottom:16 }}>Monthly Revenue</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C9A227" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A227" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill:'#6B5B30', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#6B5B30', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:'#1C1910', border:'1px solid #C9A22730', borderRadius:8, color:'#E8D8A0', fontSize:12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#C9A227" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'#6B5B30', fontSize:13 }}>No data yet</div>
          )}
        </div>

        {/* Pie chart */}
        <div style={{ ...cardStyle, padding:20 }}>
          <p style={{ color:'#E8D8A0', fontWeight:800, fontSize:14, marginBottom:16 }}>Order Status</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'#1C1910', border:'1px solid #C9A22730', borderRadius:8, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                {pieData.slice(0,4).map((p,i) => (
                  <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:PIE_COLORS[i], flexShrink:0 }} />
                    <span style={{ color:'#8A7A5A', fontSize:11, flex:1, textTransform:'capitalize' }}>{p.name}</span>
                    <span style={{ color:'#C9A227', fontSize:11, fontWeight:700 }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center', color:'#6B5B30', fontSize:13 }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Orders + Low Stock */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16 }}>
        {/* Recent orders */}
        <div style={{ ...cardStyle, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid rgba(201,162,39,0.08)' }}>
            <p style={{ color:'#E8D8A0', fontWeight:800, fontSize:14 }}>Recent Orders</p>
            <Link to="/admin/orders" style={{ color:'#C9A227', fontSize:12, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(201,162,39,0.04)' }}>
                  {['Order','Customer','Total','Status','Date'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#6B5B30', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:'#6B5B30', fontSize:13 }}>No orders yet</td></tr>
                ) : recentOrders.map((o, i) => (
                  <tr key={o._id} style={{ borderBottom:'1px solid rgba(201,162,39,0.05)', background: i%2===0?'transparent':'rgba(201,162,39,0.02)' }}>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'#C9A227', fontWeight:700 }}>{o.orderNumber}</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'#E8D8A0' }}>{o.user?.name||'N/A'}</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'#C9A227', fontWeight:700 }}>₹{o.total?.toLocaleString()}</td>
                    <td style={{ padding:'12px 16px' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding:'12px 16px', fontSize:11, color:'#6B5B30', whiteSpace:'nowrap' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div style={{ ...cardStyle, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(201,162,39,0.08)', display:'flex', alignItems:'center', gap:8 }}>
            <AlertTriangle size={15} style={{ color:'#F87171' }} />
            <p style={{ color:'#E8D8A0', fontWeight:800, fontSize:14 }}>Low Stock</p>
          </div>
          <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8 }}>
            {lowStock.length === 0 ? (
              <div style={{ padding:24, textAlign:'center', color:'#6B5B30', fontSize:13 }}>All good! No low stock items</div>
            ) : lowStock.map(p => (
              <div key={p._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'rgba(248,113,113,0.06)', borderRadius:10, border:'1px solid rgba(248,113,113,0.12)' }}>
                <div style={{ width:36, height:36, borderRadius:8, overflow:'hidden', background:'#2A2416', flexShrink:0 }}>
                  {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>💡</div>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:'#E8D8A0', fontSize:12, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                  <p style={{ color:'#F87171', fontSize:11, fontWeight:600 }}>Stock: {p.stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
