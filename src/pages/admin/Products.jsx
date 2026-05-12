import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner, Modal, Input, Select, GoldButton } from '../../components/UI';

const CATEGORIES = ['pendant', 'table', 'wall', 'ceiling', 'floor', 'outdoor', 'smart', 'other'];

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '', category: 'pendant',
  stock: '', colors: '', tags: '', isFeatured: false, isActive: true,
  specifications: { material: '', wattage: '', bulbType: '', dimensions: '', weight: '', voltage: '' }
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 12, isActive: '' });
      if (search) q.set('search', search);
      const { data } = await api.get(`/products?${q}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      stock: product.stock,
      colors: product.colors?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      specifications: product.specifications || EMPTY_FORM.specifications
    });
    setModalOpen(true);
  };

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setSpec = (k, v) => setForm(p => ({ ...p, specifications: { ...p.specifications, [k]: v } }));

  const save = async () => {
    if (!form.name || !form.price || !form.category) return toast.error('Fill required fields');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
    setDeleting(null);
  };

  const toggleActive = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isActive: !product.isActive });
      toast.success(product.isActive ? 'Product deactivated' : 'Product activated');
      fetchProducts();
    } catch { toast.error('Update failed'); }
  };

  return (
    <AdminLayout title="Products">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dark w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
          />
        </div>
        <button onClick={openAdd} className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading products..." />
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-dark-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product._id} className={`glass rounded-2xl overflow-hidden transition-all hover:border-gold-500/20 ${!product.isActive ? 'opacity-60' : ''}`}>
              <div className="relative h-44 bg-dark-700">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">💡</div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {product.isFeatured && <span className="badge-gold px-2 py-0.5 rounded-lg text-xs">Featured</span>}
                  {!product.isActive && <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-lg text-xs">Inactive</span>}
                </div>
                {product.stock < 5 && product.stock > 0 && (
                  <span className="absolute top-2 right-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-lg text-xs">
                    Low: {product.stock}
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="absolute top-2 right-2 bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-lg text-xs">Out of Stock</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-gold-500 uppercase tracking-wider mb-1 capitalize">{product.category}</p>
                <h3 className="font-semibold text-dark-100 text-sm mb-1 line-clamp-1">{product.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-gold-400 font-bold">₹{product.price?.toLocaleString()}</span>
                    {product.originalPrice && <span className="text-dark-500 text-xs line-through ml-1">₹{product.originalPrice?.toLocaleString()}</span>}
                  </div>
                  <span className="text-dark-400 text-xs">Stock: {product.stock}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg glass hover:border-gold-500/30 text-dark-300 hover:text-gold-400 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => toggleActive(product)}
                    className={`flex-1 py-2 text-xs rounded-lg transition-all ${product.isActive ? 'glass text-dark-300 hover:text-orange-400' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                  >
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id, product.name)}
                    disabled={deleting === product._id}
                    className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="glass p-2 rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${page === p ? 'bg-gold-gradient text-white' : 'glass text-dark-300'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="glass p-2 rounded-lg disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add New Product'} size="xl">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Product Name *" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Modern Pendant Light" />
            </div>
            <Select label="Category *" value={form.category} onChange={e => setF('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-dark-800 capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </Select>
            <Input label="Stock Quantity *" type="number" min="0" value={form.stock} onChange={e => setF('stock', e.target.value)} placeholder="0" />
            <Input label="Selling Price (₹) *" type="number" min="0" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="999" />
            <Input label="Original Price (₹)" type="number" min="0" value={form.originalPrice} onChange={e => setF('originalPrice', e.target.value)} placeholder="1499" />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-200 block mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setF('description', e.target.value)}
              placeholder="Product description..."
              rows={3}
              className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Colors (comma separated)" value={form.colors} onChange={e => setF('colors', e.target.value)} placeholder="Black, Gold, White" />
            <Input label="Tags (comma separated)" value={form.tags} onChange={e => setF('tags', e.target.value)} placeholder="modern, luxury, led" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setF('isFeatured', !form.isFeatured)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.isFeatured ? 'bg-gold-gradient' : 'bg-dark-600'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isFeatured ? 'left-7' : 'left-1'}`} />
              </div>
              <span className="text-sm text-dark-300">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setF('isActive', !form.isActive)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.isActive ? 'bg-gold-gradient' : 'bg-dark-600'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isActive ? 'left-7' : 'left-1'}`} />
              </div>
              <span className="text-sm text-dark-300">Active (visible)</span>
            </label>
          </div>

          {/* Specifications */}
          <div>
            <p className="text-sm font-medium text-dark-200 mb-3">Specifications (optional)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(EMPTY_FORM.specifications).map(k => (
                <div key={k}>
                  <label className="text-xs text-dark-400 capitalize block mb-1">{k}</label>
                  <input
                    type="text"
                    value={form.specifications[k]}
                    onChange={e => setSpec(k, e.target.value)}
                    placeholder={k}
                    className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <GoldButton onClick={save} loading={saving} className="flex-1">{editProduct ? 'Save Changes' : 'Create Product'}</GoldButton>
            <button onClick={() => setModalOpen(false)} className="flex-1 glass py-3 rounded-xl text-dark-300 hover:text-dark-100 transition-colors">Cancel</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
