import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Package, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, StatusBadge } from '../../components/UI';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#C9A227','#60A5FA','#4ADE80','#A78BFA','#F87171','#9CA3AF'];
const card = { background:'#1C1910', border:'1px solid rgba(201,162,39,0.10)', borderRadius:16 };

function StatCard({ title, value, sub, icon:Icon, accent='#C9A227' }) {
  return (
    <div style={{ ...card, padding:16, display:'flex', alignItems:'flex-start', gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:11, flexShrink:0,
        background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={19} style={{ color:accent }} />
      </div>
      <div style={{ minWidth:0 }}>
        <p style={{ color:'#8A7A5A', fontSize:11, fontWeight:600, marginBottom:3 }}>{title}</p>
        <p style={{ color:'#E8D8A0', fontSize:20, fontWeight:900, lineHeight:1 }}>{value}</p>
        {sub && <p style={{ color:'#6B5B30', fontSize:10, marginTop:3 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).catch(()=>{}).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><LoadingSpinner size="lg" text="Loading dashboard…" /></AdminLayout>;

  const { stats={}, recentOrders=[], monthlyRevenue=[], statusBreakdown=[], lowStock=[] } = data || {};

  const chartData = monthlyRevenue.map(m => ({
    name:    MONTHS[(m._id?.month||1)-1],
    revenue: m.revenue||0,
    orders:  m.count||0,
  }));
  const pieData = statusBreakdown.map(s => ({ name:s._id, value:s.count }));

  return (
    <AdminLayout title="Dashboard">

      {/* ── KPI CARDS — 2 cols mobile, 4 cols desktop ── */}
      <div style={{ display:'grid', gap:12, marginBottom:16 }}
        className="grid grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue"  value={`₹${(stats.totalRevenue||0).toLocaleString()}`}     sub="All time"                 icon={TrendingUp} accent="#C9A227" />
        <StatCard title="Total Orders"   value={stats.totalOrders||0}                                sub={`${stats.pendingOrders||0} pending`} icon={ShoppingBag} accent="#60A5FA" />
        <StatCard title="Customers"      value={stats.totalUsers||0}                                 sub="Registered"               icon={Users}      accent="#4ADE80" />
        <StatCard title="Products"       value={stats.totalProducts||0}                              sub={`${stats.lowStockCount||0} low stock`} icon={Package} accent={stats.lowStockCount>0?'#F87171':'#C9A227'} />
      </div>

      {/* ── SECONDARY STATS ── */}
      <div style={{ display:'grid', gap:12, marginBottom:16 }}
        className="grid grid-cols-3">
        {[
          { label:'Avg Order',    value:`₹${Math.round(stats.avgOrderValue||0).toLocaleString()}`, color:'#C9A227' },
          { label:'Pending',      value:stats.pendingOrders||0,  color:'#FBB91C' },
          { label:'Low Stock',    value:stats.lowStockCount||0,  color:'#F87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...card, padding:'12px 10px', textAlign:'center' }}>
            <p style={{ color:'#8A7A5A', fontSize:10, fontWeight:600, marginBottom:4 }}>{label}</p>
            <p style={{ color, fontSize:20, fontWeight:900 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── CHARTS — stacked on mobile, side-by-side on desktop ── */}
      <div style={{ display:'grid', gap:12, marginBottom:16 }}
        className="grid grid-cols-1 lg:grid-cols-2">

        {/* Revenue area chart */}
        <div style={{ ...card, padding:16 }}>
          <p style={{ color:'#E8D8A0', fontWeight:800, fontSize:13, marginBottom:12 }}>Monthly Revenue</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C9A227" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A227" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill:'#6B5B30', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#6B5B30', fontSize:10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background:'#1C1910', border:'1px solid #C9A22730', borderRadius:8, color:'#E8D8A0', fontSize:11 }} />
                <Area type="monotone" dataKey="revenue" stroke="#C9A227" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center', color:'#6B5B30', fontSize:13 }}>No data yet</div>
          )}
        </div>

        {/* Pie chart */}
        <div style={{ ...card, padding:16 }}>
          <p style={{ color:'#E8D8A0', fontWeight:800, fontSize:13, marginBottom:12 }}>Order Status</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value" paddingAngle={3}>
                    {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'#1C1910', border:'1px solid #C9A22730', borderRadius:8, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:6 }}>
                {pieData.slice(0,4).map((p,i) => (
                  <div key={p.name} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <div style={{ width:7, height:7, borderRadius:2, background:PIE_COLORS[i], flexShrink:0 }} />
                    <span style={{ color:'#8A7A5A', fontSize:10, flex:1, textTransform:'capitalize' }}>{p.name}</span>
                    <span style={{ color:'#C9A227', fontSize:10, fontWeight:700 }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height:130, display:'flex', alignItems:'center', justifyContent:'center', color:'#6B5B30', fontSize:13 }}>No data yet</div>
          )}
        </div>
      </div>

      {/* ── RECENT ORDERS + LOW STOCK — stacked on mobile ── */}
      <div style={{ display:'grid', gap:12 }}
        className="grid grid-cols-1 lg:grid-cols-2">

        {/* Recent orders */}
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(201,162,39,0.08)' }}>
            <p style={{ color:'#E8D8A0', fontWeight:800, fontSize:13 }}>Recent Orders</p>
            <Link to="/admin/orders" style={{ color:'#C9A227', fontSize:11, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {/* Mobile: card list */}
          <div className="lg:hidden">
            {recentOrders.length === 0 ? (
              <div style={{ padding:32, textAlign:'center', color:'#6B5B30', fontSize:13 }}>No orders yet</div>
            ) : recentOrders.map((o,i) => (
              <div key={o._id} style={{ padding:'12px 16px', borderBottom:'1px solid rgba(201,162,39,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ color:'#C9A227', fontSize:12, fontWeight:700 }}>{o.orderNumber}</p>
                  <p style={{ color:'#8A7A5A', fontSize:11 }}>{o.user?.name||'N/A'}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ color:'#C9A227', fontSize:12, fontWeight:700 }}>₹{o.total?.toLocaleString()}</p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block" style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(201,162,39,0.04)' }}>
                  {['Order','Customer','Total','Status','Date'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#6B5B30', textTransform:'uppercase', letterSpacing:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:'#6B5B30', fontSize:13 }}>No orders yet</td></tr>
                ) : recentOrders.map((o,i) => (
                  <tr key={o._id} style={{ borderBottom:'1px solid rgba(201,162,39,0.05)', background:i%2===0?'transparent':'rgba(201,162,39,0.02)' }}>
                    <td style={{ padding:'11px 14px', fontSize:12, color:'#C9A227', fontWeight:700 }}>{o.orderNumber}</td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:'#E8D8A0' }}>{o.user?.name||'N/A'}</td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:'#C9A227', fontWeight:700 }}>₹{o.total?.toLocaleString()}</td>
                    <td style={{ padding:'11px 14px' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding:'11px 14px', fontSize:11, color:'#6B5B30', whiteSpace:'nowrap' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(201,162,39,0.08)', display:'flex', alignItems:'center', gap:7 }}>
            <AlertTriangle size={14} style={{ color:'#F87171' }} />
            <p style={{ color:'#E8D8A0', fontWeight:800, fontSize:13 }}>Low Stock</p>
          </div>
          <div style={{ padding:10, display:'flex', flexDirection:'column', gap:7 }}>
            {lowStock.length === 0 ? (
              <div style={{ padding:24, textAlign:'center', color:'#6B5B30', fontSize:12 }}>✓ No low stock items</div>
            ) : lowStock.map(p => (
              <div key={p._id} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 9px', background:'rgba(248,113,113,0.06)', borderRadius:9, border:'1px solid rgba(248,113,113,0.10)' }}>
                <div style={{ width:34, height:34, borderRadius:8, overflow:'hidden', background:'#2A2416', flexShrink:0 }}>
                  {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none'}} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>💡</div>}
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
