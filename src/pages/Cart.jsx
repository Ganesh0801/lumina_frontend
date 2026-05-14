import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  const delivery = cartTotal > 999 ? 0 : 50;
  const total = cartTotal + delivery;

  if (cart.length === 0) return (
    <div className="min-h-screen pt-20 pb-24 flex flex-col items-center justify-center px-4" style={{ background: '#F7F5F0' }}>
      <div className="text-8xl mb-5 animate-float">🛒</div>
      <h2 className="text-xl font-black text-[#1C1C1C] mb-2">Your cart is empty</h2>
      <p className="text-[#ABABAB] text-sm mb-7 text-center">Discover our beautiful lighting collection</p>
      <Link to="/products" className="btn-gold px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2">
        Start Shopping <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen pb-32 lg:pb-12" style={{ background: '#F7F5F0' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20">

        {/* Header */}
        <div className="flex items-center gap-3 py-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#6B6B6B] hover:text-[#B8860B] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#1C1C1C]">My Cart</h1>
            <p className="text-xs text-[#ABABAB] font-semibold">{cartCount} Product{cartCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">

          {/* ── ITEMS ── */}
          <div className="lg:col-span-2 space-y-3 mb-5 lg:mb-0">
            {cart.map((item, i) => (
              <div key={`${item.product}-${item.color}`}
                className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}>

                {/* ✅ FIX: use item.image (single string saved by CartContext) */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#F7F5F0] flex-shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    : null}
                  <div className={`w-full h-full items-center justify-center text-3xl ${item.image ? 'hidden' : 'flex'}`}>💡</div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  {item.category && <p className="text-[10px] text-[#ABABAB] capitalize font-semibold mb-0.5">{item.category}</p>}
                  <p className="font-bold text-sm text-[#1C1C1C] line-clamp-1 mb-0.5">{item.name}</p>
                  {item.color && <p className="text-[11px] text-[#6B6B6B] mb-1 capitalize">Color: {item.color}</p>}
                  <p className="font-black text-[#B8860B] text-base">₹{item.price?.toLocaleString()}</p>

                  <div className="flex items-center justify-between mt-2">
                    {/* ✅ FIX: pass product + color to updateQuantity */}
                    <div className="flex items-center bg-[#F7F5F0] rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product, item.color, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#6B6B6B] hover:text-[#B8860B] transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center font-black text-sm text-[#1C1C1C]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product, item.color, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#6B6B6B] hover:text-[#B8860B] transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* ✅ FIX: pass product + color to removeFromCart */}
                    <button
                      onClick={() => removeFromCart(item.product, item.color)}
                      className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <h2 className="font-black text-base text-[#1C1C1C] mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B6B] font-semibold">Sub total:</span>
                  <span className="font-bold text-[#1C1C1C]">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B6B] font-semibold">Delivery Charge:</span>
                  <span className={`font-bold ${delivery === 0 ? 'text-green-500' : 'text-[#1C1C1C]'}`}>
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-[11px] text-[#B8860B] font-semibold bg-[#FFF8E1] px-3 py-1.5 rounded-xl">
                    Add ₹{(999 - cartTotal).toLocaleString()} more for free delivery!
                  </p>
                )}
                <div className="border-t border-[#F7F5F0] pt-3 flex justify-between">
                  <span className="font-black text-[#1C1C1C]">Total</span>
                  <span className="font-black text-xl gradient-text">₹{total.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')}
                className="btn-gold w-full py-4 rounded-2xl font-bold text-base mb-3 flex items-center justify-center gap-2">
                Check Out <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/products" className="block text-center text-sm font-bold text-[#6B6B6B] hover:text-[#B8860B] transition-colors py-2">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE FIXED BOTTOM ── */}
      <div className="fixed bottom-16 left-0 right-0 lg:hidden bg-white border-t border-[#EBEBEB] p-4 shadow-lg z-40">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-[#6B6B6B] font-semibold">Total</span>
          <span className="font-black text-lg gradient-text">₹{total.toLocaleString()}</span>
        </div>
        <button onClick={() => navigate('/checkout')} className="btn-gold w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2">
          Check Out <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
