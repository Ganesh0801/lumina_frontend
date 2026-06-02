import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Edit, Trash2, Search, Package, X, ChevronLeft, ChevronRight,
  Upload, ImagePlus, CheckCircle2, Sparkles, Zap,
  Star, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import { LoadingSpinner } from '../../components/UI';
import resolveImg from '../../utils/resolveImg';

/* ─── constants ─────────────────────────────────────── */
const CATEGORIES = ['pendant', 'table', 'wall', 'ceiling', 'floor', 'outdoor', 'smart', 'other'];

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '', category: 'pendant',
  stock: '', colors: '', tags: '', isFeatured: false, isActive: true,
  specifications: { material: '', wattage: '', bulbType: '', dimensions: '', weight: '', voltage: '' }
};

const STEPS = ['Image', 'Details', 'Specs'];

/* ─── helpers ────────────────────────────────────────── */
function Badge({ children, variant = 'gold' }) {
  const v = {
    gold:   'bg-[#C9A22720] text-[#C9A227] border border-[#C9A22740]',
    red:    'bg-red-500/10 text-red-400 border border-red-500/25',
    orange: 'bg-orange-500/10 text-orange-400 border border-orange-500/25',
    green:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${v[variant]}`}>
      {children}
    </span>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C9A22750] ${value ? 'bg-[linear-gradient(135deg,#8B6914,#C9A227,#D4AA4A)]' : 'bg-[#282828]'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${value ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

function GoldBtn({ children, onClick, type = 'button', disabled, loading, className = '', variant = 'primary' }) {
  const styles = {
    primary: 'bg-[linear-gradient(135deg,#8B6914,#C9A227,#D4AA4A)] text-white hover:shadow-[0_8px_25px_rgba(201,162,39,0.35)] hover:-translate-y-px',
    ghost:   'bg-white/5 border border-white/10 text-[#C8C8C8] hover:bg-white/8 hover:border-[#C9A22740]',
    danger:  'bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}>
      {loading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
      {children}
    </button>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold uppercase tracking-widest text-[#707070]">{label}</label>}
      {children}
      {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>{error}</p>}
    </div>
  );
}

function TInput({ error, className = '', ...props }) {
  return (
    <input className={`w-full bg-[#1A1A1A] border ${error ? 'border-red-500/50' : 'border-[#C9A22720]'} text-[#E8E8E8] placeholder-[#505050] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-[#C9A227] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.12)] ${className}`}
      {...props} />
  );
}

function TArea({ error, className = '', ...props }) {
  return (
    <textarea className={`w-full bg-[#1A1A1A] border ${error ? 'border-red-500/50' : 'border-[#C9A22720]'} text-[#E8E8E8] placeholder-[#505050] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-[#C9A227] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.12)] resize-none ${className}`}
      {...props} />
  );
}

/* ─── Step 1: Image Upload ───────────────────────────── */
function ImageUploadStep({ images, setImages, productName, setProductName, onNext }) {
  const [dragging, setDragging] = useState(false);
  const [nameError, setNameError] = useState('');
  const fileRef = useRef(null);

  const processFiles = (files) => {
    Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setImages(prev => [
        ...prev,
        { file, preview: e.target.result, id: Math.random().toString(36).slice(2), isNew: true }
      ]);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const removeImage = (id) => setImages(prev => prev.filter(img => img.id !== id));

  const handleNext = () => {
    if (!productName.trim()) { setNameError('Product name is required'); return; }
    if (images.length === 0) { toast.error('Please upload at least one image'); return; }
    onNext();
  };

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-widest text-[#707070]">
          Product Name <span className="text-[#C9A227]">*</span>
        </label>
        <div className="relative">
          <TInput value={productName} onChange={e => { setProductName(e.target.value); setNameError(''); }}
            placeholder="e.g. Celestial Arc Pendant" error={nameError} className="text-base pr-10" />
          {productName && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />}
        </div>
        {nameError && <p className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>{nameError}</p>}
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => images.length === 0 && fileRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
          ${dragging ? 'border-[#C9A227] bg-[#C9A22710]' : images.length === 0
            ? 'border-[#C9A22730] bg-[#1A1A1A] hover:border-[#C9A22760] hover:bg-[#C9A22708]'
            : 'border-[#C9A22728] bg-[#1A1A1A]'}`}
        style={{ minHeight: images.length === 0 ? 240 : 'auto' }}>

        {images.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${dragging ? 'bg-[#C9A22725] scale-110' : 'bg-[#C9A22712]'}`}>
              <ImagePlus className={`w-9 h-9 transition-all duration-300 ${dragging ? 'text-[#C9A227]' : 'text-[#707070]'}`} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[#E8E8E8] font-semibold">{dragging ? 'Drop to add images' : 'Drop your light images here'}</p>
              <p className="text-[#505050] text-sm">or <span className="text-[#C9A227] underline underline-offset-2">browse files</span> · PNG, JPG, WEBP up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-2">
              {images.map((img, i) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square bg-[#282828]">
                  <img src={img.preview} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  {i === 0 && (
                    <div className="absolute top-1.5 left-1.5">
                      <Badge variant="gold"><Star className="w-2.5 h-2.5 fill-current" /> Cover</Badge>
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
              <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                className="aspect-square rounded-xl border-2 border-dashed border-[#C9A22730] flex flex-col items-center justify-center gap-1.5 text-[#505050] hover:border-[#C9A227] hover:text-[#C9A227] hover:bg-[#C9A22708] transition-all duration-200">
                <Plus className="w-5 h-5" /><span className="text-xs">Add more</span>
              </button>
            </div>
            <p className="text-[#505050] text-xs text-center">First image is the cover</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => processFiles(e.target.files)} />
      </div>

      <div className="flex justify-end">
        <GoldBtn onClick={handleNext} className="gap-2 px-7">
          Continue to Details <ChevronRight className="w-4 h-4" />
        </GoldBtn>
      </div>
    </div>
  );
}

/* ─── Step 2: Details ────────────────────────────────── */
function DetailsStep({ form, setF, images, onBack, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.price) e.price = 'Required';
    if (form.stock === '' || form.stock === undefined) e.stock = 'Required';
    if (!form.description) e.description = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#C9A22718]">
        {images[0]?.preview && <img src={images[0].preview} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
        <div>
          <p className="text-sm font-semibold text-[#E8E8E8] truncate">{form.name || 'Untitled product'}</p>
          <p className="text-xs text-[#707070]">{images.length} image{images.length !== 1 ? 's' : ''} uploaded</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category *">
          <select value={form.category} onChange={e => setF('category', e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#C9A22720] text-[#E8E8E8] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A227] transition-all appearance-none cursor-pointer">
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1A1A1A] capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </Field>
        <Field label="Stock Qty *" error={errors.stock}>
          <TInput type="number" min="0" value={form.stock} onChange={e => { setF('stock', e.target.value); setErrors(p => ({...p, stock: ''})); }} placeholder="0" error={errors.stock} />
        </Field>
        <Field label="Selling Price (₹) *" error={errors.price}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707070] text-sm">₹</span>
            <TInput type="number" min="0" value={form.price} onChange={e => { setF('price', e.target.value); setErrors(p => ({...p, price: ''})); }} placeholder="1,999" className="pl-8" error={errors.price} />
          </div>
        </Field>
        <Field label="Original Price (₹)">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707070] text-sm">₹</span>
            <TInput type="number" min="0" value={form.originalPrice} onChange={e => setF('originalPrice', e.target.value)} placeholder="2,999" className="pl-8" />
          </div>
        </Field>
      </div>

      <Field label="Description *" error={errors.description}>
        <TArea value={form.description} onChange={e => { setF('description', e.target.value); setErrors(p => ({...p, description: ''})); }}
          placeholder="Describe this lighting fixture — style, mood, use case…" rows={3} error={errors.description} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Colors (comma separated)">
          <TInput value={form.colors} onChange={e => setF('colors', e.target.value)} placeholder="Black, Gold, White" />
        </Field>
        <Field label="Tags (comma separated)">
          <TInput value={form.tags} onChange={e => setF('tags', e.target.value)} placeholder="modern, luxury, led" />
        </Field>
      </div>

      <div className="flex gap-8 pt-1">
        <div className="flex items-center gap-3">
          <Toggle value={form.isFeatured} onChange={v => setF('isFeatured', v)} />
          <div>
            <p className="text-sm font-medium text-[#C8C8C8]">Featured</p>
            <p className="text-xs text-[#505050]">Show on homepage</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Toggle value={form.isActive} onChange={v => setF('isActive', v)} />
          <div>
            <p className="text-sm font-medium text-[#C8C8C8]">Active</p>
            <p className="text-xs text-[#505050]">Visible to customers</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <GoldBtn onClick={onBack} variant="ghost" className="gap-2 flex-shrink-0"><ChevronLeft className="w-4 h-4" /> Back</GoldBtn>
        <GoldBtn onClick={() => { if (validate()) onNext(); }} className="flex-1 gap-2">Continue to Specs <ChevronRight className="w-4 h-4" /></GoldBtn>
      </div>
    </div>
  );
}

/* ─── Step 3: Specs ──────────────────────────────────── */
function SpecsStep({ form, setSpec, onBack, onSave, saving, editProduct }) {
  const specFields = [
    { key: 'material', label: 'Material', placeholder: 'Brass, Steel, Glass…' },
    { key: 'wattage', label: 'Wattage', placeholder: '10W, 40W…' },
    { key: 'bulbType', label: 'Bulb Type', placeholder: 'LED, E27, GU10…' },
    { key: 'dimensions', label: 'Dimensions', placeholder: 'H 45cm × Ø 30cm' },
    { key: 'weight', label: 'Weight', placeholder: '1.2 kg' },
    { key: 'voltage', label: 'Voltage', placeholder: '220–240V' },
  ];
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-[#C9A22708] border border-[#C9A22720]">
        <p className="text-xs text-[#C9A227] font-semibold uppercase tracking-widest mb-1">Almost there ✦</p>
        <p className="text-sm text-[#A0A0A0]">Specifications are optional but improve discoverability and customer trust.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {specFields.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <TInput value={form.specifications[key]} onChange={e => setSpec(key, e.target.value)} placeholder={placeholder} />
          </Field>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <GoldBtn onClick={onBack} variant="ghost" className="gap-2 flex-shrink-0"><ChevronLeft className="w-4 h-4" /> Back</GoldBtn>
        <GoldBtn onClick={onSave} loading={saving} className="flex-1 gap-2">
          {saving ? 'Saving…' : editProduct ? 'Save Changes' : 'Create Product'}
          {!saving && <Sparkles className="w-4 h-4" />}
        </GoldBtn>
      </div>
    </div>
  );
}

/* ─── Step Bar ───────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${done ? 'bg-[linear-gradient(135deg,#8B6914,#C9A227)] text-white' :
                  active ? 'bg-[#C9A22720] border-2 border-[#C9A227] text-[#C9A227]' :
                  'bg-[#1A1A1A] border border-[#383838] text-[#505050]'}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${active ? 'text-[#C9A227]' : done ? 'text-[#707070]' : 'text-[#383838]'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 mb-5 transition-all duration-500 ${done ? 'bg-[#C9A227]' : 'bg-[#282828]'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Modal ──────────────────────────────────────────── */
function ProductModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0F0F0F] border border-[#C9A22720] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-[#0F0F0F]/95 backdrop-blur-sm flex items-center justify-between px-8 py-5 border-b border-[#C9A22715]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[linear-gradient(135deg,#8B6914,#C9A227)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#E8E8E8]">{title}</h2>
              <p className="text-[10px] text-[#505050] uppercase tracking-widest">Lumina Admin</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#707070] hover:text-[#E8E8E8] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-8 py-7">{children}</div>
      </div>
    </div>
  );
}

/* ─── Product Card ───────────────────────────────────── */
function ProductCard({ product, onEdit, onDelete, onToggleActive, deleting }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className={`group relative bg-[#0F0F0F] border border-[#C9A22712] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#C9A22730] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${!product.isActive ? 'opacity-55' : ''}`}>
      <div className="relative aspect-[4/3] bg-[#1A1A1A] overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#383838]">
            <Package className="w-10 h-10" /><span className="text-xs">No image</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {product.isFeatured && <Badge variant="gold"><Star className="w-2.5 h-2.5 fill-current" /> Featured</Badge>}
          {!product.isActive && <Badge variant="red"><EyeOff className="w-2.5 h-2.5" /> Inactive</Badge>}
          {discount > 0 && <Badge variant="green">-{discount}%</Badge>}
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/80 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/30 backdrop-blur-sm">OUT OF STOCK</span>
          </div>
        )}
        {product.stock > 0 && product.stock < 5 && (
          <div className="absolute bottom-2.5 right-2.5">
            <Badge variant="orange"><AlertTriangle className="w-2.5 h-2.5" /> Low: {product.stock}</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] text-[#C9A227] uppercase tracking-widest font-semibold mb-1 capitalize">{product.category}</p>
        <h3 className="font-semibold text-[#E8E8E8] text-sm mb-2.5 line-clamp-1">{product.name}</h3>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-[#C9A227] font-bold text-base">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && <span className="text-[#505050] text-xs line-through ml-2">₹{product.originalPrice?.toLocaleString()}</span>}
          </div>
          <span className="text-[#505050] text-xs">Stock: <span className={product.stock < 5 ? 'text-orange-400 font-medium' : 'text-[#707070]'}>{product.stock}</span></span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => onEdit(product)}
            className="flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl bg-white/5 border border-white/8 text-[#A0A0A0] hover:text-[#C9A227] hover:border-[#C9A22730] hover:bg-[#C9A22708] transition-all duration-200">
            <Edit className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onToggleActive(product)}
            className={`flex items-center justify-center py-2 text-xs rounded-xl border transition-all duration-200 ${product.isActive ? 'bg-white/5 border-white/8 text-[#A0A0A0] hover:text-orange-400 hover:border-orange-500/30' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'}`}>
            {product.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onDelete(product._id, product.name)} disabled={deleting === product._id}
            className="flex items-center justify-center py-2 text-xs rounded-xl bg-white/5 border border-white/8 text-[#A0A0A0] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/8 transition-all duration-200 disabled:opacity-40">
            {deleting === product._id
              ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/></svg>
              : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
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
  const [images, setImages] = useState([]);  // { file?, preview, id, isNew, url? }
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [step, setStep] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 12, isActive: '' });
      if (search) q.set('search', search);
      const { data } = await api.get(`/products?${q}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setStep(0);
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
    setImages(
      (product.images || []).map(url => ({
        preview: resolveImg(url),
        url,
        id: Math.random().toString(36).slice(2),
        isNew: false
      }))
    );
    setStep(0);
    setModalOpen(true);
  };

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setSpec = (k, v) => setForm(p => ({ ...p, specifications: { ...p.specifications, [k]: v } }));

  const save = async () => {
    setSaving(true);
    try {
      // Separate new files vs existing URL-only images
      const newFiles = images.filter(img => img.isNew && img.file);
      const existingUrls = images.filter(img => !img.isNew).map(img => img.url);

      // Build FormData so we can attach files
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      if (form.originalPrice) fd.append('originalPrice', form.originalPrice);
      fd.append('category', form.category);
      fd.append('stock', form.stock);
      fd.append('isFeatured', form.isFeatured);
      fd.append('isActive', form.isActive);

      // Arrays as JSON strings (backend parses them)
      const colors = form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      fd.append('colors', JSON.stringify(colors));
      fd.append('tags', JSON.stringify(tags));
      fd.append('specifications', JSON.stringify(form.specifications));

      // Existing images (kept on edit)
      existingUrls.forEach(url => fd.append('existingImages', url));

      // New image files
      newFiles.forEach(img => fd.append('images', img.file));

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, fd, config);
        toast.success('Product updated!');
      } else {
        await api.post('/products', fd, config);
        toast.success('Product created! ✦');
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
      const fd = new FormData();
      fd.append('isActive', !product.isActive);
      await api.put(`/products/${product._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(product.isActive ? 'Deactivated' : 'Activated');
      fetchProducts();
    } catch { toast.error('Update failed'); }
  };

  return (
    <AdminLayout title="Products">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-7">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#505050]" />
            <input type="text" placeholder="Search by name, category…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#1A1A1A] border border-[#C9A22720] text-[#E8E8E8] placeholder-[#505050] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#C9A227] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.10)] transition-all" />
          </div>
          {total > 0 && <span className="text-sm text-[#505050] flex-shrink-0">{total} products</span>}
        </div>
        <GoldBtn onClick={openAdd} className="gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Product
        </GoldBtn>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading products…" />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-24 h-24 rounded-full bg-[#C9A22710] border border-[#C9A22720] flex items-center justify-center mb-6">
            <Package className="w-11 h-11 text-[#C9A22740]" />
          </div>
          <p className="text-lg font-semibold text-[#E8E8E8] mb-2">No products found</p>
          <p className="text-sm text-[#505050] mb-7">{search ? `No results for "${search}"` : 'Start by adding your first lighting product'}</p>
          {!search && <GoldBtn onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Add First Product</GoldBtn>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(product => (
            <ProductCard key={product._id} product={product}
              onEdit={openEdit} onDelete={deleteProduct} onToggleActive={toggleActive} deleting={deleting} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-[#282828] flex items-center justify-center text-[#707070] hover:text-[#C9A227] hover:border-[#C9A22730] disabled:opacity-30 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${page === p ? 'bg-[linear-gradient(135deg,#8B6914,#C9A227)] text-white shadow-[0_4px_14px_rgba(201,162,39,0.35)]' : 'bg-[#1A1A1A] border border-[#282828] text-[#707070] hover:text-[#C9A227] hover:border-[#C9A22730]'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-[#282828] flex items-center justify-center text-[#707070] hover:text-[#C9A227] hover:border-[#C9A22730] disabled:opacity-30 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal */}
      <ProductModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setStep(0); }}
        title={editProduct ? `Edit: ${form.name || 'Product'}` : 'New Product'}>
        <StepBar current={step} />
        {step === 0 && (
          <ImageUploadStep images={images} setImages={setImages}
            productName={form.name} setProductName={v => setF('name', v)} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <DetailsStep form={form} setF={setF} images={images} onBack={() => setStep(0)} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <SpecsStep form={form} setSpec={setSpec} onBack={() => setStep(1)} onSave={save} saving={saving} editProduct={editProduct} />
        )}
      </ProductModal>
    </AdminLayout>
  );
}
