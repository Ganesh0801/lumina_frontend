import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Zap, Shield, Truck, RefreshCw, Search, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  { key: 'pendant', label: 'Pendant', icon: '💡' },
  { key: 'table', label: 'Table', icon: '🕯️' },
  { key: 'wall', label: 'Wall', icon: '🔆' },
  { key: 'ceiling', label: 'Ceiling', icon: '✨' },
  { key: 'smart', label: 'Smart', icon: '⚡' },
  { key: 'outdoor', label: 'Outdoor', icon: '🌟' },
  { key: 'floor', label: 'Floor', icon: '🏮' },
  { key: 'other', label: 'All', icon: '🔍' },
];

function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0" style={{ width: 160 }}
      onClick={() => navigate(`/products/${product._id}`)}>
      <div className="relative bg-[#F7F5F0]" style={{ height: 140 }}>
        {product.images?.[0]
          ? <img src={product.images[0]?.startsWith('http') ? product.images[0] : `${(process.env.REACT_APP_API_URL||'http://localhost:5000/api').replace('/api','')}${product.images[0]}`} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">💡</div>}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-[#C9A227] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onAddToCart(product); }}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md"
          style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
          <span className="text-lg leading-none font-bold">+</span>
        </button>
      </div>
      <div className="p-2.5">
        <p className="text-[11px] text-[#ABABAB] capitalize mb-0.5">{product.category}</p>
        <p className="text-xs font-bold text-[#1C1C1C] line-clamp-1 mb-1">{product.name}</p>
        <div className="flex items-center gap-1 mb-1">
          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-[10px] text-[#6B6B6B] font-semibold">{product.rating?.toFixed(1) || '4.5'}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-black text-[#B8860B] text-sm">₹{product.price?.toLocaleString()}</span>
          {product.originalPrice && <span className="text-[#ABABAB] text-[10px] line-through">₹{product.originalPrice?.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm" style={{ width: 160 }}>
      <div className="skeleton" style={{ height: 140 }} />
      <div className="p-2.5 space-y-2">
        <div className="skeleton h-3 w-2/3" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/products?featured=true&limit=8'),
      api.get('/products?limit=6&sort=createdAt'),
      api.get('/products?limit=4&sort=popular'),
    ]).then(([f, n, t]) => {
      setFeatured(f.data.products);
      setNewArrivals(n.data.products);
      setTopProducts(t.data.products);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?search=${encodeURIComponent(searchQ)}`);
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0" style={{ background: '#F7F5F0' }}>

      {/* ── HERO ── */}
      <section className="pt-20 pb-0 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #FFF8E1 0%, #F7F5F0 60%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 py-8 lg:py-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm mb-5">
                <span className="notify-dot" />
                <span className="text-xs font-bold text-[#B8860B]">New Collection {new Date().getFullYear()}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-[#1C1C1C] leading-tight mb-4" style={{ fontFamily: 'Nunito' }}>
                Make Your Room<br /><span className="gradient-text">Bright & Beautiful</span>
              </h1>
              <p className="text-[#6B6B6B] text-base lg:text-lg mb-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
                With the app you can control and modify the setting of your lighting.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/products" className="btn-gold px-8 py-3.5 rounded-2xl text-sm font-bold inline-flex items-center gap-2">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/products?featured=true" className="bg-white px-8 py-3.5 rounded-2xl text-sm font-bold text-[#6B6B6B] shadow-sm inline-flex items-center gap-2 hover:shadow-md transition-all">
                  View Featured ✨
                </Link>
              </div>
              <div className="flex justify-center lg:justify-start gap-8 mt-8">
                {[['500+', 'Products'], ['10K+', 'Customers'], ['4.8★', 'Rating']].map(([n, l]) => (
                  <div key={l} className="text-center">
                    <p className="font-black text-xl gradient-text">{n}</p>
                    <p className="text-[#ABABAB] text-xs font-semibold">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Hero image placeholder */}
            <div className="flex-shrink-0 w-64 h-64 lg:w-96 lg:h-96 rounded-3xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg,#E8D5A0,#F5E8C0)' }}>
              <div className="text-center animate-float">
                <div className="text-9xl">💡</div>
                <p className="text-[#B8860B] font-bold text-sm mt-2">Premium Lighting</p>
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-2xl px-3 py-2 shadow-md">
                <p className="text-[10px] text-[#ABABAB] font-semibold">Best Seller</p>
                <p className="text-xs font-black text-[#1C1C1C]">Pendant Light</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── SEARCH BAR ── */}
        <div className="py-5">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ABABAB]" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Search here…"
              className="inp"
              style={{ borderRadius: 18 }} />
          </form>
        </div>

        {/* ── CATEGORIES ── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-[#1C1C1C]">Find your Product</h2>
            <Link to="/products" className="text-xs font-bold text-[#B8860B] flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.key} to={cat.key === 'other' ? '/products' : `/products?category=${cat.key}`}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-all"
                style={{ minWidth: 64 }}>
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[11px] font-bold text-[#1C1C1C]">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── NEW ARRIVALS ── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-[#1C1C1C]">New Arrivals</h2>
            <Link to="/products?sort=createdAt" className="text-xs font-bold text-[#B8860B] flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : newArrivals.map(p => <ProductCard key={p._id} product={p} onAddToCart={addToCart} />)}
          </div>
        </section>

        {/* ── BANNER ── */}
        <section className="mb-8">
          <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg,#3D2800,#7a5200)', minHeight: 160 }}>
            <div className="p-6 relative z-10">
              <p className="text-[#D4AA4A] text-xs font-bold uppercase tracking-widest mb-2">Limited Time Offer</p>
              <h3 className="text-white text-2xl font-black mb-1">Up to <span style={{ color: '#C9A227' }}>40% OFF</span></h3>
              <p className="text-[#D4AA4A]/80 text-sm mb-4">On selected premium collections</p>
              <Link to="/products?sort=price_asc" className="bg-white text-[#B8860B] font-bold text-sm px-5 py-2.5 rounded-xl inline-flex items-center gap-2 hover:shadow-md transition-all">
                Let's Start <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute right-4 top-4 text-7xl opacity-20 animate-float">💡</div>
            <div className="absolute right-16 bottom-2 text-5xl opacity-15 animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
          </div>
        </section>

        {/* ── TOP PRODUCTS ── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-[#1C1C1C]">Top Products</h2>
            <Link to="/products?sort=popular" className="text-xs font-bold text-[#B8860B] flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-3 flex gap-3 items-center shadow-sm">
                    <div className="skeleton rounded-xl flex-shrink-0" style={{ width: 60, height: 60 }} />
                    <div className="flex-1 space-y-2"><div className="skeleton h-3 w-3/4" /><div className="skeleton h-3 w-1/2" /></div>
                  </div>
                ))
              : topProducts.map((p) => (
                  <div key={p._id} onClick={() => navigate(`/products/${p._id}`)}
                    className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="rounded-xl overflow-hidden flex-shrink-0 bg-[#F7F5F0]" style={{ width: 60, height: 60 }}>
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#1C1C1C] truncate">{p.name}</p>
                      <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /><span className="text-xs text-[#6B6B6B]">{p.rating?.toFixed(1) || '4.5'}</span></div>
                      <p className="font-black text-[#B8860B] text-sm">₹{p.price?.toLocaleString()}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); addToCart(p); }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                      <span className="text-lg font-bold leading-none">+</span>
                    </button>
                  </div>
                ))}
          </div>
        </section>

        {/* ── FEATURED GRID (desktop) ── */}
        <section className="mb-12 hidden lg:block">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#1C1C1C]">Featured <span className="gradient-text">Picks</span></h2>
            <Link to="/products" className="text-sm font-bold text-[#B8860B] flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="skeleton" style={{ height: 180 }} />
                    <div className="p-3 space-y-2"><div className="skeleton h-3 w-3/4" /><div className="skeleton h-4 w-1/2" /></div>
                  </div>
                ))
              : featured.map(p => (
                  <div key={p._id} className="product-card bg-white rounded-2xl overflow-hidden shadow-sm"
                    onClick={() => navigate(`/products/${p._id}`)}>
                    <div className="relative bg-[#F7F5F0]" style={{ height: 180 }}>
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl">💡</div>}
                      {p.isFeatured && <span className="absolute top-2 left-2 bg-[#C9A227] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">★ Featured</span>}
                      <button onClick={e => { e.stopPropagation(); addToCart(p); }}
                        className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                        <span className="text-xl font-bold leading-none">+</span>
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] text-[#ABABAB] capitalize mb-0.5">{p.category}</p>
                      <p className="text-sm font-bold text-[#1C1C1C] line-clamp-1 mb-1">{p.name}</p>
                      <div className="flex items-center gap-1 mb-1.5"><Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /><span className="text-xs text-[#6B6B6B]">{p.rating?.toFixed(1) || '4.5'}</span></div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-[#B8860B]">₹{p.price?.toLocaleString()}</span>
                        {p.originalPrice && <span className="text-[#ABABAB] text-xs line-through">₹{p.originalPrice?.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'Orders above ₹999' },
              { icon: Shield, title: 'Warranty', desc: '2-year guarantee' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day returns' },
              { icon: Zap, title: 'Smart Control', desc: 'App & voice control' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: '#FFF8E1' }}>
                  <Icon className="w-5 h-5 text-[#B8860B]" />
                </div>
                <p className="font-bold text-xs text-[#1C1C1C]">{title}</p>
                <p className="text-[#ABABAB] text-[11px] mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-[#EBEBEB] pt-8 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                  <Zap className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="font-black text-lg gradient-text tracking-widest">LUMINA</span>
              </div>
              <p className="text-[#ABABAB] text-xs leading-relaxed">Premium lighting for modern homes.</p>
            </div>
            {[
              { title: 'Shop', links: ['All Products', 'Pendants', 'Wall Lights', 'Smart Lights'] },
              { title: 'Support', links: ['Track Order', 'Returns', 'FAQ', 'Contact'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Partners'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-black text-sm text-[#1C1C1C] mb-3">{col.title}</h4>
                <ul className="space-y-1.5">
                  {col.links.map(l => <li key={l}><a href="#" className="text-[#ABABAB] text-xs hover:text-[#B8860B] transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#EBEBEB] pt-4 text-center text-[#ABABAB] text-xs">
            © 2024 Lumina Lights. All rights reserved.
          </div>
        </footer>

      </div>
    </div>
  );
}
