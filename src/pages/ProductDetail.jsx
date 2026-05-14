import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ChevronLeft, Truck, Shield, Minus, Plus, Heart, Share2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function StarRating({ rating, size = 'md', interactive = false, onChange }) {
  const s = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i}
          onClick={() => interactive && onChange?.(i)}
          className={`${s} transition-colors ${interactive ? 'cursor-pointer' : ''} ${i <= Math.round(rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#EBEBEB] fill-[#EBEBEB]'}`}
        />
      ))}
    </div>
  );
}

const COLOR_MAP = {
  black:'#1C1C1C', white:'#FFFFFF', gold:'#C9A227', silver:'#C0C0C0',
  brown:'#8B4513', yellow:'#F59E0B', red:'#EF4444', blue:'#3B82F6',
  green:'#22C55E', pink:'#EC4899', purple:'#A855F7', gray:'#9CA3AF',
  champagne:'#F5E0A0', bronze:'#CD7F32', copper:'#B87333', cream:'#F5F0E8',
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product,     setProduct]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [qty,         setQty]         = useState(1);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [reviewForm,  setReviewForm]  = useState({ rating: 5, comment: '' });
  const [submitting,  setSubmitting]  = useState(false);
  const [addedAnim,   setAddedAnim]   = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data);
        setSelectedColor(r.data.colors?.[0] || '');
        setSelectedImg(0);
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ FIX: pass product object, qty, color — CartContext handles the rest
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty, selectedColor);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1800);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, qty, selectedColor);
    navigate('/cart');
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) return toast.error('Please write a comment');
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/review`, reviewForm);
      toast.success('Review submitted!');
      const r = await api.get(`/products/${id}`);
      setProduct(r.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: '#F7F5F0' }}>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="skeleton h-72 rounded-3xl" />
        <div className="skeleton h-5 w-3/4 rounded-xl" />
        <div className="skeleton h-8 w-1/2 rounded-xl" />
        <div className="skeleton h-4 w-full rounded-xl" />
        <div className="skeleton h-4 w-5/6 rounded-xl" />
      </div>
    </div>
  );

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen pb-32 lg:pb-12" style={{ background: '#F7F5F0' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20">

        {/* ── BACK ── */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#6B6B6B] font-bold text-sm mt-4 mb-4 hover:text-[#B8860B] transition-colors">
          <ChevronLeft className="w-5 h-5" /> Details
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-10">

          {/* ── IMAGES ── */}
          <div>
            {/* Main image */}
            <div className="relative bg-white rounded-3xl overflow-hidden mb-3 shadow-sm" style={{ height: 320 }}>
              {product.images?.[selectedImg] ? (
                <img
                  src={product.images[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">💡</div>
              )}

              {discount > 0 && (
                <span className="absolute top-4 left-4 text-white text-xs font-bold px-2.5 py-1 rounded-xl"
                  style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                  -{discount}% OFF
                </span>
              )}

              <button onClick={() => setWishlisted(w => !w)}
                className={`absolute top-4 right-4 w-9 h-9 rounded-2xl flex items-center justify-center shadow-md transition-all ${wishlisted ? 'bg-red-500' : 'bg-white'}`}>
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white text-white' : 'text-[#ABABAB]'}`} />
              </button>

              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }
              }} className="absolute top-4 right-16 w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-md text-[#ABABAB] hover:text-[#B8860B] transition-colors">
                <Share2 className="w-4 h-4" />
              </button>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-2xl">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all bg-white ${selectedImg === i ? 'border-[#C9A227] shadow-md' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO ── */}
          <div className="mt-6 lg:mt-0">
            <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest mb-1 capitalize">{product.category}</p>
            <h1 className="text-2xl font-black text-[#1C1C1C] mb-2 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.rating || 0} />
              <span className="text-sm font-bold text-[#1C1C1C]">{(product.rating || 0).toFixed(1)}</span>
              <span className="text-[#ABABAB] text-xs">({product.numReviews || 0} Reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-black gradient-text">₹{product.price?.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-[#ABABAB] text-lg line-through">₹{product.originalPrice?.toLocaleString()}</span>
                  <span className="bg-[#FFF8E1] text-[#B8860B] text-xs font-bold px-2 py-0.5 rounded-lg">
                    Save ₹{(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-[#6B6B6B] text-sm leading-relaxed mb-4">{product.description}</p>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2">
                  Product Colour: <span className="text-[#B8860B] capitalize">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => {
                    const hex = COLOR_MAP[c.toLowerCase()] || '#888888';
                    return (
                      <button key={c} onClick={() => setSelectedColor(c)}
                        style={{
                          background: hex,
                          border: `2px solid ${selectedColor === c ? '#C9A227' : '#EBEBEB'}`,
                          outline: selectedColor === c ? '2px solid #C9A22760' : 'none',
                          outlineOffset: 2,
                        }}
                        className="w-8 h-8 rounded-full transition-all shadow-sm"
                        title={c}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">Quantity:</p>
              <div className="flex items-center bg-white rounded-2xl shadow-sm border border-[#EBEBEB] overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-[#B8860B] hover:bg-[#FFF8E1] transition-all">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 h-10 flex items-center justify-center font-black text-[#1C1C1C] border-x border-[#EBEBEB]">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-[#B8860B] hover:bg-[#FFF8E1] transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                product.stock === 0   ? 'bg-red-50 text-red-500'
                : product.stock < 5  ? 'bg-orange-50 text-orange-500'
                : 'bg-green-50 text-green-600'
              }`}>
                {product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? `Only ${product.stock} left!` : '✓ In Stock'}
              </span>
            </div>

            {/* CTA Buttons — desktop */}
            <div className="hidden lg:flex gap-3 mb-5">
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  ${addedAnim ? 'bg-green-500 text-white' : 'btn-gold'}`}>
                {addedAnim
                  ? <><CheckCircle2 className="w-4 h-4" /> Added to Cart!</>
                  : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="flex-1 bg-white border-2 border-[#C9A227] text-[#B8860B] py-3.5 rounded-2xl font-bold text-sm hover:bg-[#FFF8E1] transition-all disabled:opacity-50">
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Truck,  text: 'Free delivery above ₹999' },
                { icon: Shield, text: '2-year warranty included'  },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="bg-white rounded-2xl p-3 flex items-center gap-2 shadow-sm">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFF8E1' }}>
                    <Icon className="w-4 h-4 text-[#B8860B]" />
                  </div>
                  <span className="text-xs font-semibold text-[#6B6B6B]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SPECIFICATIONS ── */}
        {product.specifications && Object.values(product.specifications).some(Boolean) && (
          <div className="mt-8 bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[#F7F5F0]">
              <h2 className="font-black text-base text-[#1C1C1C]">Specifications</h2>
            </div>
            <div>
              {Object.entries(product.specifications).filter(([, v]) => v).map(([k, v], i) => (
                <div key={k} className={`flex justify-between px-5 py-3 text-sm ${i % 2 === 0 ? 'bg-[#FDFBF5]' : 'bg-white'}`}>
                  <span className="text-[#6B6B6B] capitalize font-semibold">{k}</span>
                  <span className="font-bold text-[#1C1C1C]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        <div className="mt-8 mb-8">
          <h2 className="font-black text-lg text-[#1C1C1C] mb-5">Customer Reviews</h2>

          {/* Write review form */}
          {user ? (
            <div className="bg-white rounded-3xl p-5 mb-5 shadow-sm">
              <h3 className="font-bold text-sm text-[#1C1C1C] mb-3">Write a Review</h3>
              <div className="flex items-center gap-1 mb-3">
                <StarRating rating={reviewForm.rating} interactive onChange={r => setReviewForm(p => ({ ...p, rating: r }))} />
                <span className="text-xs text-[#ABABAB] ml-2 font-semibold">{reviewForm.rating}/5</span>
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                placeholder="Share your experience with this product…"
                rows={3}
                className="inp text-sm resize-none mb-3 w-full"
              />
              <button onClick={submitReview} disabled={submitting}
                className="btn-gold w-full py-3 rounded-2xl text-sm font-bold">
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          ) : (
            <div className="bg-[#FFF8E1] rounded-2xl p-4 mb-5 text-center">
              <p className="text-sm font-semibold text-[#B8860B]">
                <span className="cursor-pointer underline" onClick={() => navigate('/login')}>Sign in</span> to write a review
              </p>
            </div>
          )}

          {/* Reviews list */}
          {!product.reviews?.length ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
              <div className="text-5xl mb-3">⭐</div>
              <p className="font-bold text-[#1C1C1C] mb-1">No reviews yet</p>
              <p className="text-[#ABABAB] text-sm">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {product.reviews.map(rev => (
                <div key={rev._id} className="bg-white rounded-3xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                        {rev.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#1C1C1C]">{rev.name}</p>
                        <StarRating rating={rev.rating} size="sm" />
                      </div>
                    </div>
                    <span className="text-[#ABABAB] text-[11px] font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                  </div>
                  {rev.comment && <p className="text-[#6B6B6B] text-sm leading-relaxed ml-12">{rev.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── FIXED BOTTOM BAR (mobile only) ── */}
      <div className="fixed bottom-16 left-0 right-0 lg:hidden bg-white border-t border-[#EBEBEB] px-4 py-3 flex gap-3 z-40 shadow-lg">
        <button onClick={handleAddToCart} disabled={product.stock === 0}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50
            ${addedAnim ? 'bg-green-500 text-white' : 'btn-gold'}`}>
          {addedAnim
            ? <><CheckCircle2 className="w-4 h-4" /> Added!</>
            : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
        </button>
        <button onClick={handleBuyNow} disabled={product.stock === 0}
          className="flex-1 bg-[#1C1C1C] text-white py-3 rounded-2xl font-bold text-sm disabled:opacity-50">
          Buy Now
        </button>
      </div>
    </div>
  );
}
