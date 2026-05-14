import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, MapPin, Phone, User, Mail, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'upi',  label: 'UPI',                 icon: '📱' },
  { id: 'cod',  label: 'Cash on Delivery',    icon: '💵' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const delivery = cartTotal > 999 ? 0 : 50;
  const total    = cartTotal + delivery;

  const [step,          setStep]          = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: '',
    address: '', city: '', state: '', pincode: '', country: 'India',
    cardNumber: '', expiry: '', cvv: '', saveCard: false,
  });
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const placeOrder = async () => {
    if (!form.address || !form.city || !form.pincode || !form.phone)
      return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      const payload = {
        // ✅ FIX: use item.image (not item.images[0]) — matches CartContext field
        items: cart.map(i => ({
          product:  i.product,
          name:     i.name,
          price:    i.price,
          quantity: i.quantity,
          image:    i.image || '',
          color:    i.color || '',
        })),
        shippingAddress: {
          address: form.address, city: form.city,
          state: form.state, pincode: form.pincode, country: form.country,
        },
        paymentMethod,
        subtotal:       cartTotal,
        deliveryCharge: delivery,
        total,
      };
      await api.post('/orders', payload);
      clearCart();
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    }
    setLoading(false);
  };

  /* ── SUCCESS SCREEN ── */
  if (step === 3) return (
    <div className="min-h-screen pt-20 pb-24 flex flex-col items-center justify-center px-4" style={{ background: '#F7F5F0' }}>
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm animate-fade-up">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
          <CheckCircle2 className="w-10 h-10 text-white" fill="white" />
        </div>
        <h2 className="text-2xl font-black text-[#1C1C1C] mb-1">Order Success!</h2>
        <p className="text-[#6B6B6B] text-sm mb-6">Congratulations! Your Order is Confirmed.</p>

        <div className="bg-[#F7F5F0] rounded-2xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#ABABAB] font-semibold">Total Paid</span>
            <span className="font-black text-[#B8860B]">₹{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#ABABAB] font-semibold">Payment</span>
            <span className="font-bold text-[#1C1C1C] capitalize">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#ABABAB] font-semibold">Delivery</span>
            <span className="font-bold text-green-500">3–5 business days</span>
          </div>
        </div>

        <button onClick={() => navigate('/orders')}
          className="btn-gold w-full py-3.5 rounded-2xl font-bold text-sm mb-3">
          Track Order
        </button>
        <button onClick={() => navigate('/')}
          className="w-full py-3 text-sm font-bold text-[#6B6B6B] hover:text-[#B8860B] transition-colors">
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 lg:pb-12" style={{ background: '#F7F5F0' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20">

        {/* Header */}
        <div className="flex items-center gap-3 py-5">
          <button onClick={() => step === 1 ? navigate('/cart') : setStep(1)}
            className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#6B6B6B]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#1C1C1C]">
              {step === 1 ? 'Delivery Address' : 'Payment Method'}
            </h1>
            <p className="text-xs text-[#ABABAB] font-semibold">Step {step} of 2</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all
                ${step >= s ? 'text-white' : 'bg-white text-[#ABABAB] border border-[#EBEBEB]'}`}
                style={step >= s ? { background: 'linear-gradient(135deg,#7a5200,#C9A227)' } : {}}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && <div className={`flex-1 h-1 rounded-full transition-all ${step > s ? 'bg-[#C9A227]' : 'bg-[#EBEBEB]'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">

            {/* ── STEP 1: ADDRESS ── */}
            {step === 1 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm animate-fade-in space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-5 h-5 text-[#B8860B]" />
                  <h2 className="font-black text-sm text-[#1C1C1C]">Delivery Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { k:'name',  label:'Full Name',      icon:User,  placeholder:'John Doe',          type:'text' },
                    { k:'phone', label:'Phone Number *',  icon:Phone, placeholder:'+91 98765 43210',   type:'tel'  },
                    { k:'email', label:'Email',           icon:Mail,  placeholder:'john@example.com',  type:'email'},
                    { k:'pincode',label:'PIN Code *',     icon:MapPin,placeholder:'600001',            type:'number'},
                  ].map(({ k, label, icon: Icon, placeholder, type }) => (
                    <div key={k}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] mb-1.5 block">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ABABAB]" />
                        <input type={type} value={form[k]} onChange={e => setF(k, e.target.value)}
                          placeholder={placeholder} className="inp pl-10 py-3 text-sm font-semibold w-full" />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] mb-1.5 block">Street Address *</label>
                  <textarea value={form.address} onChange={e => setF('address', e.target.value)}
                    placeholder="House no., Street, Area…" rows={2}
                    className="inp text-sm font-semibold resize-none w-full" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k:'city',  label:'City *',  placeholder:'Chennai'    },
                    { k:'state', label:'State',   placeholder:'Tamil Nadu' },
                  ].map(({ k, label, placeholder }) => (
                    <div key={k}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] mb-1.5 block">{label}</label>
                      <input value={form[k]} onChange={e => setF(k, e.target.value)}
                        placeholder={placeholder} className="inp py-3 text-sm font-semibold w-full" />
                    </div>
                  ))}
                </div>

                <button onClick={() => {
                  if (!form.address || !form.city || !form.pincode || !form.phone)
                    return toast.error('Fill required fields');
                  setStep(2);
                }} className="btn-gold w-full py-4 rounded-2xl font-bold mt-2">
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* ── STEP 2: PAYMENT ── */}
            {step === 2 && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-white rounded-3xl p-5 shadow-sm">
                  <h2 className="font-black text-sm text-[#1C1C1C] mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#B8860B]" /> Payment Method
                  </h2>
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left
                          ${paymentMethod === pm.id ? 'border-[#C9A227] bg-[#FFF8E1]' : 'border-[#EBEBEB] bg-white hover:border-[#C9A22750]'}`}>
                        <span className="text-2xl">{pm.icon}</span>
                        <span className={`font-bold text-sm ${paymentMethod === pm.id ? 'text-[#B8860B]' : 'text-[#1C1C1C]'}`}>{pm.label}</span>
                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${paymentMethod === pm.id ? 'border-[#C9A227]' : 'border-[#EBEBEB]'}`}>
                          {paymentMethod === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="bg-white rounded-3xl p-5 shadow-sm animate-fade-in space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] mb-1.5 block">Card Number</label>
                      <input
                        value={form.cardNumber}
                        onChange={e => setF('cardNumber', e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19))}
                        placeholder="5068 4649 7909 5679" maxLength={19}
                        className="inp py-3 text-sm font-semibold tracking-widest w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] mb-1.5 block">Expire Date</label>
                        <input value={form.expiry} onChange={e => setF('expiry', e.target.value)}
                          placeholder="MM/YY" className="inp py-3 text-sm font-semibold w-full" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] mb-1.5 block">CVC</label>
                        <input value={form.cvv} onChange={e => setF('cvv', e.target.value)}
                          maxLength={3} placeholder="567" type="password"
                          className="inp py-3 text-sm font-semibold w-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm font-semibold text-[#6B6B6B]">Save Card details</span>
                      <button type="button" onClick={() => setF('saveCard', !form.saveCard)}
                        className={`relative w-11 h-6 rounded-full transition-all ${form.saveCard ? '' : 'bg-[#EBEBEB]'}`}
                        style={form.saveCard ? { background: 'linear-gradient(135deg,#7a5200,#C9A227)' } : {}}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.saveCard ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                )}

                <button onClick={placeOrder} disabled={loading}
                  className="btn-gold w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
                  {loading
                    ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" className="opacity-25"/><path fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>Placing Order…</>
                    : `Pay Now  ₹${total.toLocaleString()}`}
                </button>
              </div>
            )}
          </div>

          {/* ── ORDER SUMMARY SIDEBAR ── */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-3xl p-5 shadow-sm sticky top-24">
              <h3 className="font-black text-sm text-[#1C1C1C] mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
                {cart.map(item => (
                  <div key={`${item.product}-${item.color}`} className="flex gap-3">
                    {/* ✅ FIX: use item.image */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F7F5F0] flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                            onError={e => { e.target.style.display='none'; }} />
                        : <div className="w-full h-full flex items-center justify-center text-xl">💡</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1C1C1C] truncate">{item.name}</p>
                      {item.color && <p className="text-[10px] text-[#ABABAB] capitalize">Color: {item.color}</p>}
                      <p className="text-[10px] text-[#ABABAB]">Qty: {item.quantity}</p>
                      <p className="text-sm font-black text-[#B8860B]">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#F7F5F0] pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#ABABAB] font-semibold">Sub total:</span>
                  <span className="font-bold">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#ABABAB] font-semibold">Delivery:</span>
                  <span className={`font-bold ${delivery === 0 ? 'text-green-500' : ''}`}>
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F7F5F0]">
                  <span className="font-black text-[#1C1C1C]">Total</span>
                  <span className="font-black text-lg gradient-text">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom total bar */}
        <div className="fixed bottom-16 left-0 right-0 lg:hidden bg-white border-t border-[#EBEBEB] px-4 py-3 z-40 shadow-lg">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-[#ABABAB] font-semibold">Total</span>
            <span className="font-black gradient-text">₹{total.toLocaleString()}</span>
          </div>
          {step === 2 && (
            <button onClick={placeOrder} disabled={loading}
              className="btn-gold w-full py-3.5 rounded-2xl font-bold text-sm">
              {loading ? 'Placing Order…' : `Pay Now ₹${total.toLocaleString()}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
