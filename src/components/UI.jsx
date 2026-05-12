import React from 'react';
import { Star, Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 className={`${sizes[size]} text-gold-400 animate-spin`} />
      {text && <p className="text-dark-300 text-sm">{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="skeleton h-56 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-4 rounded w-1/2" />
        <div className="skeleton h-8 rounded w-full mt-2" />
      </div>
    </div>
  );
}

export function StarRating({ rating, count, size = 'sm' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${sizes[size]} ${i <= Math.round(rating) ? 'star-filled fill-gold-400' : 'star-empty'}`} />
      ))}
      {count !== undefined && <span className="text-dark-300 text-xs ml-1">({count})</span>}
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`status-${status} px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide`}>
      {status}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gold-600/10 rounded-full flex items-center justify-center mb-6">
        {Icon && <Icon className="w-10 h-10 text-gold-600" />}
      </div>
      <h3 className="text-xl font-display font-semibold text-dark-100 mb-2">{title}</h3>
      {description && <p className="text-dark-400 max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function GoldButton({ children, onClick, type = 'button', className = '', disabled = false, loading = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn-gold py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-dark-200">{label}</label>}
      <input
        className={`input-dark w-full px-4 py-3 rounded-xl text-sm ${error ? 'border-red-500/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-dark-200">{label}</label>}
      <select
        className={`input-dark w-full px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative glass rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-fade-up`}>
        <div className="flex items-center justify-between p-6 border-b border-gold-600/20">
          <h2 className="font-display text-xl font-semibold gradient-text">{title}</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-100 transition-colors">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card glass rounded-2xl overflow-hidden group cursor-pointer">
      <div className="relative overflow-hidden h-56 bg-dark-800">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">💡</div>
        )}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 badge-gold px-2 py-1 rounded-lg">{product.discount}% OFF</span>
        )}
        {product.isFeatured && (
          <span className="absolute top-3 right-3 bg-dark-900/80 text-gold-400 text-xs px-2 py-1 rounded-lg border border-gold-600/30">
            ★ Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gold-500 uppercase tracking-wider mb-1 font-medium">{product.category}</p>
        <h3 className="font-display font-semibold text-dark-100 mb-2 line-clamp-1">{product.name}</h3>
        <StarRating rating={product.rating} count={product.numReviews} />
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-gold-400 font-bold text-lg">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-dark-400 text-sm line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          {product.stock === 0 && (
            <span className="text-red-400 text-xs font-medium">Out of Stock</span>
          )}
        </div>
        {onAddToCart && product.stock > 0 && (
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
            className="btn-gold w-full mt-3 py-2.5 rounded-xl text-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
