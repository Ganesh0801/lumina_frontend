import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, ChevronLeft, ChevronRight, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '../utils/api';

const STATUS_CONFIG = {
  pending:    { label:'Pending',    color:'text-[#F59E0B]', bg:'bg-[#FFF8E1]', icon:'⏳' },
  confirmed:  { label:'Confirmed',  color:'text-[#3B82F6]', bg:'bg-[#EFF6FF]', icon:'✅' },
  processing: { label:'Processing', color:'text-[#8B5CF6]', bg:'bg-[#F5F3FF]', icon:'⚙️' },
  shipped:    { label:'Shipped',    color:'text-[#D97706]', bg:'bg-[#FFFBEB]', icon:'🚚' },
  delivered:  { label:'Delivered',  color:'text-[#22C55E]', bg:'bg-[#F0FDF4]', icon:'📦' },
  cancelled:  { label:'Cancelled',  color:'text-[#EF4444]', bg:'bg-[#FEF2F2]', icon:'❌' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen pt-20 pb-24 px-4" style={{ background: '#F7F5F0' }}>
      <div className="max-w-2xl mx-auto py-6 space-y-3">
        {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-3xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 lg:pb-12" style={{ background: '#F7F5F0' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-20">

        {/* Header */}
        <div className="flex items-center gap-3 py-5">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#6B6B6B]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#1C1C1C]">My Orders</h1>
            <p className="text-xs text-[#ABABAB] font-semibold">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-5">📦</div>
            <h3 className="text-lg font-black text-[#1C1C1C] mb-2">No Orders Yet</h3>
            <p className="text-[#ABABAB] text-sm mb-7">Start shopping to place your first order</p>
            <Link to="/products" className="btn-gold px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <Link key={order._id} to={`/orders/${order._id}`}
                  className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group animate-fade-up block"
                  style={{ animationDelay: `${i * 0.06}s` }}>

                  {/* Product image */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F7F5F0] flex-shrink-0 relative">
                    {order.items[0]?.image
                      ? <img src={order.items[0].image} alt="" className="w-full h-full object-cover"
                          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      : null}
                    <div className="w-full h-full items-center justify-center text-3xl"
                      style={{ display: order.items[0]?.image ? 'none' : 'flex' }}>💡</div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[#1C1C1C] truncate group-hover:text-[#B8860B] transition-colors">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-[#ABABAB] font-semibold mb-1.5">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xl ${st.color} ${st.bg}`}>
                        {st.icon} {st.label}
                      </span>
                      <span className="font-black text-[#B8860B] text-sm">₹{order.total?.toLocaleString()}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#ABABAB] group-hover:text-[#B8860B] transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
