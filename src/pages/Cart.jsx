import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState, GoldButton } from '../components/UI';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const deliveryCharge = cartTotal > 999 ? 0 : 50;
  const finalTotal = cartTotal + deliveryCharge;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24">
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart is Empty"
          description="Looks like you haven't added any lights yet. Illuminate your home!"
          action={<Link to="/products" className="btn-gold px-8 py-3 rounded-xl inline-flex items-center gap-2">Start Shopping <ArrowRight className="w-4 h-4" /></Link>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-dark-50 mb-2">Shopping Cart</h1>
        <p className="text-dark-400 mb-8">{cartCount} item{cartCount > 1 ? 's' : ''}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, i) => (
              <div key={`${item.product}-${item.color}`} className="glass rounded-2xl p-5 flex gap-4 animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-dark-700">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">💡</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-dark-100 truncate">{item.name}</h3>
                      {item.color && <p className="text-dark-400 text-sm">Color: {item.color}</p>}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product, item.color)}
                      className="text-dark-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center glass rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(item.product, item.color, item.quantity - 1)}
                        className="px-3 py-2 hover:bg-white/5 text-dark-300 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 py-2 text-sm font-semibold border-x border-gold-600/20">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product, item.color, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-white/5 text-dark-300 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-display font-bold text-gold-400 text-lg">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-dark-100 mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-dark-300">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-dark-300">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-green-400' : ''}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-xs text-dark-500">Add ₹{(999 - cartTotal + 1).toLocaleString()} more for free delivery</p>
                )}
                <div className="border-t border-gold-600/20 pt-3 flex justify-between font-bold">
                  <span className="text-dark-100">Total</span>
                  <span className="font-display text-xl gradient-text">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <GoldButton
                onClick={() => user ? navigate('/checkout') : navigate('/login')}
                className="w-full text-base"
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'} <ArrowRight className="w-4 h-4" />
              </GoldButton>

              <Link to="/products" className="block text-center text-sm text-dark-400 hover:text-gold-400 mt-4 transition-colors">
                ← Continue Shopping
              </Link>

              {/* Security badge */}
              <div className="mt-6 pt-6 border-t border-gold-600/10 text-center">
                <p className="text-dark-500 text-xs">🔒 Secure SSL encrypted checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
