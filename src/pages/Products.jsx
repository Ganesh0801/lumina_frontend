import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, X, ChevronDown, Heart } from 'lucide-react';
import api from '../utils/api';
import resolveImg from '../utils/resolveImg';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['all','pendant','table','wall','ceiling','floor','outdoor','smart','other'];
const SORTS = [
  { value: 'createdAt',  label: 'Newest'            },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'         },
  { value: 'popular',    label: 'Most Popular'      },
];

function ProductCard({ product }) {
  const navigate        = useNavigate();
  const { addToCart }   = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgErr,     setImgErr]     = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm"
      onClick={() => navigate(`/products/${product._id}`)}>

      {/* Image */}
      <div className="relative bg-[#F7F5F0]" style={{ height: 170 }}>
        {product.images?.[0] && !imgErr ? (
          <img
            src={resolveImg(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">💡</div>
        )}

        {discount > 0 && (
          <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg"
            style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>-{discount}%</span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-8 bg-white text-[#B8860B] text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">★ Hot</span>
        )}

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); setWishlisted(w => !w); }}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${wishlisted ? 'bg-red-500' : 'bg-white'}`}>
          <Heart className={`w-3 h-3 ${wishlisted ? 'fill-white text-white' : 'text-[#ABABAB]'}`} />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-[10px] text-[#ABABAB] capitalize mb-0.5 font-semibold">{product.category}</p>
        <p className="text-sm font-bold text-[#1C1C1C] line-clamp-1 mb-1">{product.name}</p>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-[11px] text-[#6B6B6B] font-semibold">{(product.rating || 0).toFixed(1)}</span>
          {product.numReviews > 0 && <span className="text-[10px] text-[#ABABAB]">({product.numReviews})</span>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-black text-[#B8860B] text-base">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-[#ABABAB] text-xs line-through ml-1">₹{product.originalPrice?.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); addToCart(product); }}
            disabled={product.stock === 0}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm disabled:opacity-40 transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
            <span className="text-lg font-bold leading-none">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="skeleton" style={{ height: 170 }} />
      <div className="p-3 space-y-2">
        <div className="skeleton h-2.5 w-1/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const category    = searchParams.get('category') || 'all';
  const search      = searchParams.get('search')   || '';
  const sort        = searchParams.get('sort')      || 'createdAt';
  const [searchInput, setSearchInput] = useState(search);
  const [priceRange,  setPriceRange]  = useState({ min: '', max: '' });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 12, sort });
      if (category && category !== 'all') q.set('category', category);
      if (search)          q.set('search',   search);
      if (priceRange.min)  q.set('minPrice', priceRange.min);
      if (priceRange.max)  q.set('maxPrice', priceRange.max);
      const { data } = await api.get(`/products?${q}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    setLoading(false);
  }, [page, category, search, sort, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [category, search, sort]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val && val !== 'all') p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', searchInput);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
    setPriceRange({ min: '', max: '' });
  };

  const hasFilters = category !== 'all' || search || priceRange.min || priceRange.max;

  return (
    <div className="min-h-screen pb-24 lg:pb-8" style={{ background: '#F7F5F0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">

        {/* Header */}
        <div className="py-5">
          <h1 className="text-xl font-black text-[#1C1C1C] mb-0.5">
            {search ? `Results for "${search}"` : category !== 'all' ? `${category.charAt(0).toUpperCase()+category.slice(1)} Lights` : 'All Products'}
          </h1>
          <p className="text-sm text-[#ABABAB] font-semibold">{total} products found</p>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ABABAB] pointer-events-none" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search here…"
                className="inp w-full py-3 font-semibold"
                style={{ borderRadius: 16, paddingLeft: '2.25rem' }}
              />
            </div>
          </form>
          <button
            onClick={() => setFilterOpen(o => !o)}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-sm border transition-all
              ${filterOpen ? 'text-white border-transparent' : 'bg-white text-[#6B6B6B] border-[#EBEBEB]'}`}
            style={filterOpen ? { background: 'linear-gradient(135deg,#7a5200,#C9A227)' } : {}}>
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setParam('category', c)}
              className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold capitalize border transition-all
                ${category === c ? 'text-white border-transparent shadow-md' : 'bg-white text-[#6B6B6B] border-[#EBEBEB] hover:border-[#C9A227]'}`}
              style={category === c ? { background: 'linear-gradient(135deg,#7a5200,#C9A227)' } : {}}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2">Sort By</p>
                <div className="relative">
                  <select value={sort} onChange={e => setParam('sort', e.target.value)}
                    className="inp appearance-none pr-8 py-2.5 text-sm font-semibold w-full">
                    {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ABABAB] pointer-events-none" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2">Min Price (₹)</p>
                <input type="number" placeholder="0" value={priceRange.min}
                  onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                  className="inp py-2.5 text-sm font-semibold w-full" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-2">Max Price (₹)</p>
                <input type="number" placeholder="99999" value={priceRange.max}
                  onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                  className="inp py-2.5 text-sm font-semibold w-full" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={fetchProducts} className="btn-gold flex-1 py-2.5 rounded-xl text-sm font-bold">Apply Filters</button>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-bold border border-red-100">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && !filterOpen && (
          <div className="flex gap-2 flex-wrap mb-4">
            {search && (
              <span className="flex items-center gap-1 bg-[#FFF8E1] text-[#B8860B] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#F5E0A0]">
                "{search}" <button onClick={() => { setParam('search',''); setSearchInput(''); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {category !== 'all' && (
              <span className="flex items-center gap-1 bg-[#FFF8E1] text-[#B8860B] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#F5E0A0] capitalize">
                {category} <button onClick={() => setParam('category','')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="flex items-center gap-1 bg-[#FFF8E1] text-[#B8860B] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#F5E0A0]">
                ₹{priceRange.min||0}–{priceRange.max||'∞'} <button onClick={() => setPriceRange({min:'',max:''})}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-5">💡</div>
            <h3 className="text-lg font-black text-[#1C1C1C] mb-2">No products found</h3>
            <p className="text-[#ABABAB] text-sm mb-6">{search ? `No results for "${search}"` : 'Try a different category or filter'}</p>
            <button onClick={clearFilters} className="btn-gold px-6 py-3 rounded-xl text-sm font-bold">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <div key={p._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="w-10 h-10 rounded-xl bg-white text-[#6B6B6B] font-bold shadow-sm disabled:opacity-40 hover:shadow-md transition-all">‹</button>
            {Array.from({ length: Math.min(pages,7) }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl font-bold text-sm shadow-sm transition-all
                  ${page===p ? 'text-white shadow-md' : 'bg-white text-[#6B6B6B] hover:shadow-md'}`}
                style={page===p ? {background:'linear-gradient(135deg,#7a5200,#C9A227)'} : {}}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}
              className="w-10 h-10 rounded-xl bg-white text-[#6B6B6B] font-bold shadow-sm disabled:opacity-40 hover:shadow-md transition-all">›</button>
          </div>
        )}
      </div>
    </div>
  );
}
