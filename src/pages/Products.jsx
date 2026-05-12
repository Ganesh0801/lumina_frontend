import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { ProductCard, SkeletonCard, EmptyState, Select } from '../components/UI';
import { Package } from 'lucide-react';

const CATEGORIES = ['pendant', 'table', 'wall', 'ceiling', 'floor', 'outdoor', 'smart', 'other'];
const SORTS = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { addToCart } = useCart();

  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || '',
    sort: params.get('sort') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    page: parseInt(params.get('page')) || 1,
  });

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v, page: 1 }));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) q.set(k, v); });
      const { data } = await api.get(`/products?${q}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch { }
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-dark-800/50 border-b border-gold-600/10 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-dark-50 mb-2">
            {filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Lights` : 'All Products'}
          </h1>
          <p className="text-dark-400">{total} products found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search lights, lamps..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              className="input-dark w-full pl-11 pr-4 py-3 rounded-xl"
            />
          </div>
          <Select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} className="sm:w-48">
            <option value="">Sort by</option>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${filtersOpen ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'glass text-dark-300 hover:border-gold-500/30'}`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <div className="glass rounded-2xl p-6 mb-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-dark-200 mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter('category', '')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filters.category ? 'bg-gold-gradient text-white' : 'glass text-dark-300 hover:border-gold-500/30'}`}
                  >All</button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilter('category', cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filters.category === cat ? 'bg-gold-gradient text-white' : 'glass text-dark-300 hover:border-gold-500/30'}`}
                    >{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-dark-200 mb-3">Price Range (₹)</p>
                <div className="flex gap-3">
                  <input type="number" placeholder="Min" value={filters.minPrice}
                    onChange={e => setFilter('minPrice', e.target.value)}
                    className="input-dark w-full px-3 py-2 rounded-lg text-sm" />
                  <input type="number" placeholder="Max" value={filters.maxPrice}
                    onChange={e => setFilter('maxPrice', e.target.value)}
                    className="input-dark w-full px-3 py-2 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ search: '', category: '', sort: '', minPrice: '', maxPrice: '', page: 1 })}
                  className="flex items-center gap-2 text-sm text-dark-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" /> Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={Package} title="No Products Found" description="Try adjusting your filters or search terms" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <Link key={p._id} to={`/products/${p._id}`}>
                <ProductCard product={p} onAddToCart={addToCart} />
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <button
              onClick={() => setFilter('page', filters.page - 1)}
              disabled={filters.page === 1}
              className="glass p-2 rounded-lg disabled:opacity-30 hover:border-gold-500/30 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setFilter('page', p)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${filters.page === p ? 'bg-gold-gradient text-white' : 'glass text-dark-300 hover:border-gold-500/30'}`}>
                {p}
              </button>
            ))}
            <button
              onClick={() => setFilter('page', filters.page + 1)}
              disabled={filters.page === pages}
              className="glass p-2 rounded-lg disabled:opacity-30 hover:border-gold-500/30 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
