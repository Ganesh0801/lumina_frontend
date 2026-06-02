import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner } from '../../components/UI';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS = {
  pending: '#FBB91C', confirmed: '#60A5FA', processing: '#A78BFA',
  shipped: '#EAB308', delivered: '#4ADE80', cancelled: '#F87171', refunded: '#9CA3AF'
};
const cardStyle = { background: '#1C1910', border: '1px solid rgba(201,162,39,0.10)', borderRadius: 16 };

function StatBox({ icon: Icon, label, value, sub, accent = '#C9A227', trend }) {
  return (
    <div style={{ ...cardStyle, padding: '18px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#4ADE80' : '#F87171', display: 'flex', alignItems: 'center', gap: 3 }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p style={{ color: '#8A7A5A', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#E8D8A0', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: '#6B5B30', fontSize: 11, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export default function AdminFinancials() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [from,    setFrom]    = useState('');
  const [to,      setTo]      = useState('');

  const fetchData = useCallback(async (fromVal, toVal) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (fromVal) q.set('from', fromVal);
      if (toVal)   q.set('to', toVal);
      const res = await api.get(`/admin/financials?${q}`);
      setData(res.data);
    } catch { /* silently fail */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData('', ''); }, [fetchData]);

  const handleApply = () => fetchData(from, to);
  const handleReset = () => { setFrom(''); setTo(''); fetchData('', ''); };

  const report    = data?.report || [];
  const monthly   = data?.monthly || [];
  const revenue   = report.find(r => r._id === 'delivered')?.revenue   || 0;
  const cancelled = report.find(r => r._id === 'cancelled')?.count     || 0;
  const delivered = report.find(r => r._id === 'delivered')?.count     || 0;
  const pending   = ['pending','confirmed','processing','shipped']
    .reduce((s, k) => s + (report.find(r => r._id === k)?.revenue || 0), 0);
  const cancelledRev = report.find(r => r._id === 'cancelled')?.revenue || 0;

  // Build chart data from monthly aggregation
  const chartData = monthly.map(m => ({
    name: MONTHS[(m._id?.month || 1) - 1],
    revenue: m.revenue || 0,
    orders: m.count || 0,
  }));

  const inputStyle = {
    width: '100%', height: 38, padding: '0 12px',
    background: '#111008', border: '1px solid rgba(201,162,39,0.18)',
    borderRadius: 8, color: '#E8D8A0', fontSize: 13,
    outline: 'none', fontFamily: 'Nunito,sans-serif',
    colorScheme: 'dark',
  };

  return (
    <AdminLayout title="Financials">

      {/* Filter bar */}
      <div style={{ ...cardStyle, padding: '14px 16px', marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[{ label: 'From Date', val: from, set: setFrom }, { label: 'To Date', val: to, set: setTo }].map(({ label, val, set }) => (
            <div key={label} style={{ flex: '1 1 140px', minWidth: 130 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#6B5B30', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
              <input type="date" value={val} onChange={e => set(e.target.value)} style={inputStyle} />
            </div>
          ))}
          <button onClick={handleApply}
            style={{ height: 38, padding: '0 20px', background: 'linear-gradient(135deg,#7a5200,#C9A227)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            Apply
          </button>
          <button onClick={handleReset}
            style={{ height: 38, padding: '0 14px', background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.18)', borderRadius: 8, color: '#C9A227', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner size="lg" text="Loading financials…" /> : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 22 }}>
            <StatBox icon={DollarSign}   label="Total Revenue"    value={`₹${revenue.toLocaleString()}`}       sub="From delivered orders"    accent="#C9A227" />
            <StatBox icon={TrendingUp}   label="Pending Revenue"  value={`₹${pending.toLocaleString()}`}        sub="In-progress orders"       accent="#60A5FA" />
            <StatBox icon={ShoppingBag}  label="Delivered Orders" value={delivered}                             sub="Successfully fulfilled"   accent="#4ADE80" />
            <StatBox icon={TrendingDown} label="Cancelled"        value={cancelled}                             sub={`₹${cancelledRev.toLocaleString()} lost`} accent="#F87171" />
          </div>

          {/* Monthly chart */}
          <div style={{ ...cardStyle, padding: '18px 16px', marginBottom: 18 }}>
            <p style={{ color: '#E8D8A0', fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Monthly Revenue & Orders</p>
            {chartData.length > 0 ? (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <ResponsiveContainer width="100%" height={220} minWidth={300}>
                  <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.08)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#6B5B30', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6B5B30', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip contentStyle={{ background: '#1C1910', border: '1px solid #C9A22730', borderRadius: 8, color: '#E8D8A0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ color: '#8A7A5A', fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="revenue" fill="#C9A227" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                    <Bar dataKey="orders"  fill="#60A5FA" radius={[6, 6, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B5B30', fontSize: 13 }}>No data for this period</div>
            )}
          </div>

          {/* Status breakdown table */}
          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(201,162,39,0.08)' }}>
              <p style={{ color: '#E8D8A0', fontWeight: 800, fontSize: 14 }}>Revenue by Order Status</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
                <thead>
                  <tr style={{ background: 'rgba(201,162,39,0.05)' }}>
                    {['Status', 'Orders', 'Revenue', 'Avg Value'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6B5B30', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#6B5B30', fontSize: 13 }}>No data</td></tr>
                  ) : report.map((r, i) => (
                    <tr key={r._id} style={{ borderBottom: '1px solid rgba(201,162,39,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(201,162,39,0.02)' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${STATUS_COLORS[r._id] || '#888'}18`, color: STATUS_COLORS[r._id] || '#888' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[r._id] || '#888', flexShrink: 0 }} />
                          {r._id?.charAt(0).toUpperCase() + r._id?.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: '#E8D8A0', fontWeight: 700 }}>{r.count}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: '#C9A227', fontWeight: 700 }}>₹{(r.revenue || 0).toLocaleString()}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#8A7A5A' }}>₹{r.count ? Math.round(r.revenue / r.count).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
