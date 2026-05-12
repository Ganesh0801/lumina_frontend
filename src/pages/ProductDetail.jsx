import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Plus, Minus, Truck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, StarRating, StatusBadge, GoldButton } from '../components/UI';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => { setProduct(r.data); setSelectedColor(r.data.colors?.[0] || ''); })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty, selectedColor);
  };

  const handleBuyNow = () => {
    addToCart(product, qty, selectedColor);
    navigate('/cart');
  };

  const submitReview = async () => {
    if (!user) return toast.error('Please login to review');
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/review`, reviewForm);
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="pt-20 min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading product..." /></div>;
  if (!product) return null;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-dark-400 py-6">
          <button onClick={() => navigate(-1)} className="hover:text-gold-400 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <span>/</span>
          <span className="capitalize text-dark-300">{product.category}</span>
          <span>/</span>
          <span className="text-dark-200 truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            <div className="glass rounded-3xl overflow-hidden h-96 lg:h-[500px] mb-4 relative group">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">💡</div>
              )}
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 badge-gold px-3 py-1.5 rounded-xl text-sm">
                  {product.discount}% OFF
                </span>
              )}
              <button
                onClick={() => setWishlist(!wishlist)}
                className={`absolute top-4 right-4 w-10 h-10 glass rounded-xl flex items-center justify-center transition-colors ${wishlist ? 'text-red-400' : 'text-dark-400'}`}
              >
                <Heart className={`w-5 h-5 ${wishlist ? 'fill-red-400' : ''}`} />
              </button>
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-gold-400' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-gold-400 text-sm uppercase tracking-widest font-medium mb-2">{product.category}</p>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-dark-50 mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} count={product.numReviews} size="md" />
              <span className="text-dark-400 text-sm">{product.rating?.toFixed(1)}</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl font-bold gradient-text">₹{product.price?.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-dark-400 text-xl line-through">₹{product.originalPrice?.toLocaleString()}</span>
                  <span className="badge-gold px-2 py-1 rounded-lg text-sm">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
                </>
              )}
            </div>

            <p className="text-dark-300 leading-relaxed mb-6">{product.description}</p>

            {/* Color */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-dark-200 mb-3">Color: <span className="text-gold-400">{selectedColor}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${selectedColor === c ? 'border-gold-400 bg-gold-500/10 text-gold-400' : 'border-dark-600 text-dark-300 hover:border-dark-500'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-8">
              <p className="text-sm font-medium text-dark-200">Quantity:</p>
              <div className="flex items-center glass rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-white/5 text-dark-200 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-3 text-dark-100 font-semibold border-x border-gold-600/20">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-3 hover:bg-white/5 text-dark-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className={`text-sm ${product.stock < 5 ? 'text-red-400' : 'text-green-400'}`}>
                {product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? `Only ${product.stock} left!` : 'In Stock'}
              </span>
            </div>

            <div className="flex gap-4 mb-8">
              <GoldButton onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </GoldButton>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 glass border border-gold-500/30 text-gold-400 py-3 rounded-xl font-semibold hover:bg-gold-500/10 transition-all disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Truck, text: 'Free delivery above ₹999' },
                { icon: Shield, text: '2-year warranty included' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="glass rounded-xl p-3 flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span className="text-xs text-dark-300">{text}</span>
                </div>
              ))}
            </div>

            {/* Specifications */}
            {Object.values(product.specifications || {}).some(Boolean) && (
              <div className="mt-8">
                <h3 className="font-semibold text-dark-100 mb-4">Specifications</h3>
                <div className="glass rounded-xl overflow-hidden">
                  {Object.entries(product.specifications).filter(([, v]) => v).map(([k, v], i) => (
                    <div key={k} className={`flex justify-between px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-white/2' : ''}`}>
                      <span className="text-dark-400 capitalize">{k}</span>
                      <span className="text-dark-200 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-dark-50 mb-8">Customer Reviews</h2>

          {/* Add Review */}
          {user && (
            <div className="glass rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-dark-100 mb-4">Write a Review</h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setReviewForm(p => ({ ...p, rating: r }))}>
                    <Star className={`w-7 h-7 transition-colors ${r <= reviewForm.rating ? 'text-gold-400 fill-gold-400' : 'text-dark-600'}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                placeholder="Share your experience..."
                rows={3}
                className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none mb-4"
              />
              <GoldButton onClick={submitReview} loading={submitting}>Submit Review</GoldButton>
            </div>
          )}

          {/* Reviews List */}
          {product.reviews?.length === 0 ? (
            <div className="text-center py-12 text-dark-400">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {product.reviews?.map((rev) => (
                <div key={rev._id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold-gradient rounded-full flex items-center justify-center text-white font-bold">
                        {rev.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-dark-100">{rev.name}</p>
                        <StarRating rating={rev.rating} size="sm" />
                      </div>
                    </div>
                    <span className="text-dark-500 text-xs">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  {rev.comment && <p className="text-dark-300 text-sm">{rev.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
