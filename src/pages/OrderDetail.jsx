import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Truck, Package, ChevronLeft, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TRACK_STEPS = [
  { key: 'pending',    label: 'Order Placed', icon: Package      },
  { key: 'confirmed',  label: 'Confirmed',    icon: CheckCircle  },
  { key: 'processing', label: 'Processing',   icon: Package      },
  { key: 'shipped',    label: 'Shipped',      icon: Truck        },
  { key: 'delivered',  label: 'Delivered',    icon: CheckCircle  },
];
const STATUS_ORDER = ['pending','confirmed','processing','shipped','delivered'];

const STATUS_CONFIG = {
  pending:    { label:'Pending',    color:'text-[#F59E0B]', bg:'bg-[#FFF8E1]' },
  confirmed:  { label:'Confirmed',  color:'text-[#3B82F6]', bg:'bg-[#EFF6FF]' },
  processing: { label:'Processing', color:'text-[#8B5CF6]', bg:'bg-[#F5F3FF]' },
  shipped:    { label:'Shipped',    color:'text-[#D97706]', bg:'bg-[#FFFBEB]' },
  delivered:  { label:'Delivered',  color:'text-[#22C55E]', bg:'bg-[#F0FDF4]' },
  cancelled:  { label:'Cancelled',  color:'text-[#EF4444]', bg:'bg-[#FEF2F2]' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order,       setOrder]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [cancelling,  setCancelling]  = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled');
      const r = await api.get(`/orders/${id}`);
      setOrder(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
    setCancelling(false);
  };

  if (loading) return (
    <div className="min-h-screen pt-20 pb-24 px-4" style={{ background: '#F7F5F0' }}>
      <div className="max-w-2xl mx-auto py-6 space-y-3">
        <div className="skeleton h-8 w-1/2 rounded-xl" />
        <div className="skeleton h-32 rounded-3xl" />
        <div className="skeleton h-48 rounded-3xl" />
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen pt-20 pb-24 flex items-center justify-center" style={{ background: '#F7F5F0' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">📦</div>
        <p className="font-bold text-[#1C1C1C] mb-4">Order not found</p>
        <button onClick={() => navigate('/orders')} className="btn-gold px-6 py-3 rounded-2xl text-sm font-bold">Back to Orders</button>
      </div>
    </div>
  );

  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStepIdx = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen pb-24 lg:pb-12" style={{ background: '#F7F5F0' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-20">

        {/* Header */}
        <div className="flex items-center gap-3 py-5">
          <button onClick={() => navigate('/orders')}
            className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#6B6B6B]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#1C1C1C]">Order Details</h1>
            <p className="text-xs text-[#ABABAB] font-semibold">{order.orderNumber}</p>
          </div>
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-xl ${st.color} ${st.bg}`}>{st.label}</span>
        </div>

        {/* ── TRACKING ── */}
        {!isCancelled && (
          <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
            <h2 className="font-black text-sm text-[#1C1C1C] mb-5">Track Order</h2>
            <div className="flex items-start gap-0">
              {TRACK_STEPS.map((step, i) => {
                const done   = i <= currentStepIdx;
                const active = i === currentStepIdx;
                const Icon   = step.icon;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        done ? 'text-white' : 'bg-[#F7F5F0] text-[#ABABAB]'
                      }`} style={done ? { background: 'linear-gradient(135deg,#7a5200,#C9A227)' } : {}}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-bold text-center leading-tight ${
                        active ? 'text-[#B8860B]' : done ? 'text-[#6B6B6B]' : 'text-[#ABABAB]'
                      }`} style={{ maxWidth: 48 }}>{step.label}</span>
                    </div>
                    {i < TRACK_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mt-4 mx-1 rounded-full transition-all ${
                        i < currentStepIdx ? 'bg-[#C9A227]' : 'bg-[#EBEBEB]'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ORDER ITEMS ── */}
        <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <h2 className="font-black text-sm text-[#1C1C1C] mb-4">
            Items ({order.items?.length})
          </h2>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-3">
                {/* ✅ uses item.image — consistent with CartContext */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#F7F5F0] flex-shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                        onError={e => { e.target.style.display='none'; }} />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1C1C1C] truncate">{item.name}</p>
                  {item.color && <p className="text-[11px] text-[#ABABAB] capitalize">Color: {item.color}</p>}
                  <p className="text-[11px] text-[#ABABAB]">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                </div>
                <p className="font-black text-[#B8860B] text-sm flex-shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="border-t border-[#F7F5F0] mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#ABABAB] font-semibold">Subtotal</span>
              <span className="font-bold text-[#1C1C1C]">₹{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#ABABAB] font-semibold">Delivery</span>
              <span className={`font-bold ${order.deliveryCharge === 0 ? 'text-green-500' : 'text-[#1C1C1C]'}`}>
                {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#F7F5F0]">
              <span className="font-black text-[#1C1C1C]">Total</span>
              <span className="font-black text-lg gradient-text">₹{order.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── DELIVERY ADDRESS ── */}
        {order.shippingAddress && (
          <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
            <h2 className="font-black text-sm text-[#1C1C1C] mb-3">Delivery Address</h2>
            <p className="text-sm font-semibold text-[#1C1C1C]">{order.shippingAddress.address}</p>
            <p className="text-sm text-[#6B6B6B]">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
            <p className="text-sm text-[#6B6B6B]">{order.shippingAddress.country}</p>
          </div>
        )}

        {/* ── PAYMENT ── */}
        <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <h2 className="font-black text-sm text-[#1C1C1C] mb-3">Payment</h2>
          <div className="flex justify-between text-sm">
            <span className="text-[#ABABAB] font-semibold">Method</span>
            <span className="font-bold text-[#1C1C1C] capitalize">{order.paymentMethod || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-[#ABABAB] font-semibold">Status</span>
            <span className={`font-bold ${order.isPaid ? 'text-green-500' : 'text-orange-500'}`}>
              {order.isPaid ? '✓ Paid' : 'Pending'}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-[#ABABAB] font-semibold">Ordered on</span>
            <span className="font-bold text-[#1C1C1C]">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
            </span>
          </div>
        </div>

        {/* ── CANCEL BUTTON ── */}
        {['pending','confirmed'].includes(order.status) && (
          <button onClick={cancelOrder} disabled={cancelling}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4">
            <XCircle className="w-4 h-4" />
            {cancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}

      </div>
    </div>
  );
}
