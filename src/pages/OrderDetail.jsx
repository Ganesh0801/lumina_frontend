import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Truck, Package, Star, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { LoadingSpinner, StatusBadge, GoldButton } from '../components/UI';

const TRACK_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: '' });
  const [submittingRating, setSubmittingRating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrder, [id]);

  const cancelOrder = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    } finally { setCancelling(false); }
  };

  const submitRating = async () => {
    setSubmittingRating(true);
    try {
      await api.post(`/orders/${id}/rate`, ratingForm);
      toast.success('Thanks for your review!');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmittingRating(false); }
  };

  if (loading) return <div className="pt-24 min-h-screen"><LoadingSpinner size="lg" text="Loading order..." /></div>;
  if (!order) return null;

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/orders')} className="text-dark-400 hover:text-gold-400 transition-colors text-sm mb-6 flex items-center gap-1">
          ← Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-dark-50">{order.orderNumber}</h1>
            <p className="text-dark-400 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            {['pending', 'confirmed'].includes(order.status) && (
              <button onClick={cancelOrder} disabled={cancelling}
                className="text-red-400 text-sm hover:text-red-300 flex items-center gap-1 transition-colors disabled:opacity-50">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Tracking */}
        {!isCancelled && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-dark-100 mb-6">Order Tracking</h2>
            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-dark-600" />
              <div
                className="absolute left-5 top-5 w-0.5 bg-gold-gradient transition-all duration-700"
                style={{ height: `${Math.max(0, (currentStepIndex / (TRACK_STEPS.length - 1)) * 100)}%` }}
              />
              <div className="space-y-6 relative">
                {TRACK_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i <= currentStepIndex;
                  const current = i === currentStepIndex;
                  const trackEntry = order.tracking?.find(t => t.status === step.key);
                  return (
                    <div key={step.key} className="flex items-start gap-4 pl-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                        done ? 'bg-gold-gradient shadow-lg' : 'bg-dark-700 border border-dark-600'
                      } ${current ? 'animate-glow' : ''}`}>
                        <Icon className={`w-5 h-5 ${done ? 'text-white' : 'text-dark-500'}`} />
                      </div>
                      <div className="pt-2">
                        <p className={`font-medium ${done ? 'text-dark-100' : 'text-dark-500'}`}>{step.label}</p>
                        {trackEntry && (
                          <>
                            <p className="text-dark-400 text-sm">{trackEntry.message}</p>
                            <p className="text-dark-500 text-xs">{new Date(trackEntry.timestamp).toLocaleString()}</p>
                          </>
                        )}
                        {step.key === 'shipped' && order.estimatedDelivery && done && (
                          <p className="text-gold-400 text-sm">Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-dark-100 mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items?.map(item => (
              <div key={item._id} className="flex gap-4">
                <div className="w-16 h-16 bg-dark-700 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark-100">{item.name}</p>
                  {item.color && <p className="text-dark-400 text-sm">Color: {item.color}</p>}
                  <p className="text-dark-400 text-sm">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                </div>
                <p className="font-bold text-gold-400">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gold-600/20 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-dark-400"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm text-dark-400"><span>Delivery</span><span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span></div>
            <div className="flex justify-between font-bold text-dark-100 pt-1"><span>Total</span><span className="gradient-text font-display text-lg">₹{order.total?.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Address + Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-dark-100 mb-3">Delivery Address</h3>
            <p className="text-dark-300 text-sm">{order.shippingAddress?.name}</p>
            <p className="text-dark-400 text-sm">{order.shippingAddress?.street}</p>
            <p className="text-dark-400 text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p className="text-dark-400 text-sm">{order.shippingAddress?.phone}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-dark-100 mb-3">Payment Info</h3>
            <p className="text-dark-300 text-sm capitalize">Method: {order.paymentMethod}</p>
            <p className={`text-sm font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
              Status: {order.paymentStatus}
            </p>
          </div>
        </div>

        {/* Rating */}
        {order.status === 'delivered' && !order.isRated && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-dark-100 mb-4">Rate Your Order</h2>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => setRatingForm(p => ({ ...p, rating: r }))}>
                  <Star className={`w-8 h-8 transition-colors ${r <= ratingForm.rating ? 'text-gold-400 fill-gold-400' : 'text-dark-600'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={ratingForm.review}
              onChange={e => setRatingForm(p => ({ ...p, review: e.target.value }))}
              placeholder="How was your experience?"
              rows={3}
              className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none mb-4"
            />
            <GoldButton onClick={submitRating} loading={submittingRating}>Submit Review</GoldButton>
          </div>
        )}
        {order.isRated && (
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-green-400 font-medium">✓ You've rated this order — Thank you!</p>
            <div className="flex justify-center gap-1 mt-2">
              {[1,2,3,4,5].map(r => <Star key={r} className={`w-5 h-5 ${r <= order.rating ? 'text-gold-400 fill-gold-400' : 'text-dark-600'}`} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
