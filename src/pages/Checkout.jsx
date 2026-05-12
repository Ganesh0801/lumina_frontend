import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, CreditCard, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Input, GoldButton } from '../components/UI';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { value: 'upi', label: 'UPI / GPay / PhonePe', icon: '📱' },
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
];

export default function Checkout() {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [success, setSuccess] = useState(false);
  const [orderNum, setOrderNum] = useState('');

  const [addr, setAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    country: user?.address?.country || 'India',
  });

  const setA = (k, v) => setAddr(p => ({ ...p, [k]: v }));

  const deliveryCharge = cartTotal > 999 ? 0 : 50;
  const total = cartTotal + deliveryCharge;

  const placeOrder = async () => {
    if (!addr.street || !addr.city || !addr.pincode) return toast.error('Fill shipping address');
    setLoading(true);
    try {
      const items = cart.map(i => ({ product: i.product, quantity: i.quantity, color: i.color }));
      const { data } = await api.post('/orders', {
        items,
        shippingAddress: addr,
        paymentMethod,
        paymentDetails: paymentMethod !== 'cod' ? { transactionId: 'TXN' + Date.now(), paidAt: new Date() } : {}
      });
      setOrderNum(data.order.orderNumber);
      clearCart();
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-6">
        <div className="text-center glass rounded-3xl p-12 max-w-md w-full animate-fade-up">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-dark-50 mb-2">Order Placed! 🎉</h1>
          <p className="text-dark-300 mb-4">Your order has been placed successfully</p>
          <div className="bg-dark-800 rounded-2xl p-4 mb-8">
            <p className="text-dark-400 text-sm mb-1">Order Number</p>
            <p className="font-display text-2xl font-bold gradient-text">{orderNum}</p>
          </div>
          <p className="text-dark-400 text-sm mb-8">We'll send a confirmation email shortly. Our admin will verify and ship your order.</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/orders')} className="flex-1 btn-gold py-3 rounded-xl">Track Order</button>
            <button onClick={() => navigate('/')} className="flex-1 glass py-3 rounded-xl text-dark-200 hover:text-gold-400 transition-colors">Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-dark-50 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="glass rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-semibold text-dark-100 text-lg mb-5">
                <MapPin className="w-5 h-5 text-gold-400" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={addr.name} onChange={e => setA('name', e.target.value)} />
                <Input label="Phone" value={addr.phone} onChange={e => setA('phone', e.target.value)} />
                <div className="sm:col-span-2">
                  <Input label="Street / Flat / Area" value={addr.street} onChange={e => setA('street', e.target.value)} />
                </div>
                <Input label="City" value={addr.city} onChange={e => setA('city', e.target.value)} />
                <Input label="State" value={addr.state} onChange={e => setA('state', e.target.value)} />
                <Input label="Pincode" value={addr.pincode} onChange={e => setA('pincode', e.target.value)} />
                <Input label="Country" value={addr.country} onChange={e => setA('country', e.target.value)} />
              </div>
            </div>

            {/* Payment */}
            <div className="glass rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-semibold text-dark-100 text-lg mb-5">
                <CreditCard className="w-5 h-5 text-gold-400" /> Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === m.value ? 'border-gold-400 bg-gold-500/10' : 'border-dark-600 hover:border-dark-500'}`}
                  >
                    <span className="text-2xl block mb-2">{m.icon}</span>
                    <span className={`text-sm font-medium ${paymentMethod === m.value ? 'text-gold-400' : 'text-dark-200'}`}>{m.label}</span>
                  </button>
                ))}
              </div>
              {paymentMethod === 'cod' && (
                <p className="text-dark-400 text-sm mt-4">💡 Pay ₹{total.toLocaleString()} when your order is delivered.</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-dark-100 mb-5">Order Summary</h2>
              <div className="space-y-3 max-h-56 overflow-y-auto mb-5">
                {cart.map(item => (
                  <div key={`${item.product}-${item.color}`} className="flex gap-3">
                    <div className="w-14 h-14 bg-dark-700 rounded-xl overflow-hidden flex-shrink-0">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-200 truncate">{item.name}</p>
                      <p className="text-xs text-dark-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gold-400">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gold-600/20 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-dark-300">
                  <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-dark-300">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-green-400' : ''}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gold-600/10">
                  <span className="text-dark-100">Total</span>
                  <span className="font-display text-xl gradient-text">₹{total.toLocaleString()}</span>
                </div>
              </div>
              <GoldButton onClick={placeOrder} loading={loading} className="w-full mt-5 text-base">
                <Truck className="w-4 h-4" /> Place Order
              </GoldButton>
              <p className="text-center text-xs text-dark-500 mt-3">🔒 Secure & encrypted checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
