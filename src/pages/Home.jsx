import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Zap, Shield, Truck, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { ProductCard, SkeletonCard } from '../components/UI';

const CATEGORIES = [
  { key: 'pendant', label: 'Pendant Lights', emoji: '💡', desc: 'Hanging elegance' },
  { key: 'wall', label: 'Wall Lights', emoji: '🔆', desc: 'Accent & ambiance' },
  { key: 'table', label: 'Table Lamps', emoji: '🕯️', desc: 'Warm & cozy glow' },
  { key: 'ceiling', label: 'Ceiling Lights', emoji: '✨', desc: 'Bright & beautiful' },
  { key: 'smart', label: 'Smart Lights', emoji: '⚡', desc: 'AI-powered lighting' },
  { key: 'outdoor', label: 'Outdoor', emoji: '🌟', desc: 'Garden & facade' },
];

const FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹999' },
  { icon: Shield, title: 'Warranty', desc: '2-year manufacturer warranty' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: Zap, title: 'Smart Control', desc: 'App & voice control support' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?featured=true&limit=8')
      .then(r => setFeatured(r.data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-dark-gradient" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #C9A22740 0%, transparent 70%)' }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gold-600/5 rounded-full blur-3xl" />

        {/* Floating light bulbs */}
        {['top-20 left-[10%]', 'top-32 right-[8%]', 'bottom-1/3 left-[5%]', 'bottom-1/4 right-[12%]'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} text-4xl animate-float opacity-40`} style={{ animationDelay: `${i * 0.7}s` }}>
            {['💡', '🏮', '✨', '⚡'][i]}
          </div>
        ))}

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-gold-400 text-sm font-medium mb-8 animate-fade-up">
            <span className="notify-dot" />
            New Collection 2024 — Now Available
          </div>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-black text-dark-50 leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Light Up Your <br />
            <span className="gradient-text">Dream Home</span>
          </h1>
          <p className="text-dark-300 text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-light leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Premium lighting that transforms spaces into extraordinary experiences. From minimalist to luxurious.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/products" className="btn-gold px-10 py-4 rounded-2xl text-lg flex items-center justify-center gap-2">
              Shop Collection <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/products?featured=true" className="glass px-10 py-4 rounded-2xl text-lg text-dark-200 hover:text-gold-400 hover:border-gold-500/30 transition-all flex items-center justify-center gap-2">
              View Featured ✨
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[['500+', 'Products'], ['10K+', 'Customers'], ['4.8★', 'Rating']].map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl font-bold gradient-text">{num}</p>
                <p className="text-dark-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-400 animate-bounce">
          <span className="text-xs">Scroll</span>
          <div className="w-px h-8 bg-gold-gradient" />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-gold-400 uppercase tracking-widest text-sm font-medium mb-3">Collections</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-dark-50">
            Find Your <span className="gradient-text">Perfect Light</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.key}
              to={`/products?category=${cat.key}`}
              className="glass rounded-2xl p-6 text-center hover:border-gold-500/30 hover:bg-gold-500/5 transition-all group animate-fade-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="text-4xl mb-3 group-hover:animate-bounce">{cat.emoji}</div>
              <p className="font-semibold text-dark-100 text-sm group-hover:text-gold-400 transition-colors">{cat.label}</p>
              <p className="text-dark-500 text-xs mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-gold-400 uppercase tracking-widest text-sm font-medium mb-3">Bestsellers</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-dark-50">
              Featured <span className="gradient-text">Picks</span>
            </h2>
          </div>
          <Link to="/products" className="text-gold-400 hover:text-gold-300 flex items-center gap-2 font-medium transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.map(p => (
                <Link key={p._id} to={`/products/${p._id}`}>
                  <ProductCard product={p} onAddToCart={addToCart} />
                </Link>
              ))
          }
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-dark-800/50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="text-center glass rounded-2xl p-8 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 bg-gold-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-gold-400" />
              </div>
              <h3 className="font-semibold text-dark-100 mb-1">{title}</h3>
              <p className="text-dark-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #C9A227 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold-500/20 blur-3xl rounded-full" />
          <div className="relative z-10">
            <p className="text-gold-400 text-sm uppercase tracking-widest mb-4">Limited Time</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-dark-50 mb-4">
              Up to <span className="gradient-text">40% OFF</span>
            </h2>
            <p className="text-dark-300 mb-8 text-lg">On selected premium collections. Free shipping on all orders this week!</p>
            <Link to="/products?sort=price_asc" className="btn-gold px-12 py-4 rounded-2xl text-lg inline-flex items-center gap-2">
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark-900 border-t border-gold-600/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gold-gradient rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="font-display font-bold gradient-text tracking-widest">LUMINA</span>
              </div>
              <p className="text-dark-400 text-sm leading-relaxed">Premium lighting for modern homes. Illuminate your world with elegance.</p>
            </div>
            {[
              { title: 'Shop', links: ['All Products', 'Pendant Lights', 'Wall Lights', 'Smart Lights'] },
              { title: 'Support', links: ['Track Order', 'Returns', 'FAQ', 'Contact'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Partners'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-dark-100 font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-dark-400 text-sm hover:text-gold-400 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gold-600/10 pt-8 text-center text-dark-500 text-sm">
            © 2024 Lumina Lights. All rights reserved. Crafted with ✨ for beautiful homes.
          </div>
        </div>
      </footer>
    </div>
  );
}
