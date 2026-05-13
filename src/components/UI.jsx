import React from 'react';
import { Star, Package } from 'lucide-react';

/* ── Loading Spinner ── */
export function LoadingSpinner({ size = 'md', text }) {
  const s = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' }[size];
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className={`${s} rounded-full border-3 border-[#EBEBEB] animate-spin`}
        style={{ borderTopColor: '#C9A227', borderWidth: 3 }} />
      {text && <p className="text-sm text-[#ABABAB] font-semibold">{text}</p>}
    </div>
  );
}

/* ── Status Badge ── */
const STATUS = {
  pending:    { label:'Pending',    cls:'bg-[#FFF8E1] text-[#F59E0B]' },
  confirmed:  { label:'Confirmed',  cls:'bg-[#EFF6FF] text-[#3B82F6]' },
  processing: { label:'Processing', cls:'bg-[#F5F3FF] text-[#8B5CF6]' },
  shipped:    { label:'Shipped',    cls:'bg-[#FFFBEB] text-[#D97706]' },
  delivered:  { label:'Delivered',  cls:'bg-[#F0FDF4] text-[#22C55E]' },
  cancelled:  { label:'Cancelled',  cls:'bg-[#FEF2F2] text-[#EF4444]' },
  refunded:   { label:'Refunded',   cls:'bg-[#F9FAFB] text-[#9CA3AF]' },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

/* ── Star Rating ── */
export function StarRating({ rating, size = 'md' }) {
  const w = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${w} ${i <= Math.round(rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#EBEBEB] fill-[#EBEBEB]'}`} />
      ))}
    </div>
  );
}

/* ── GoldButton ── */
export function GoldButton({ children, onClick, disabled, loading, className = '', type = 'button' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`btn-gold px-6 py-3 rounded-2xl flex items-center gap-2 justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {loading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" className="opacity-25"/><path fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>}
      {children}
    </button>
  );
}

/* ── Input ── */
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B]">{label}</label>}
      <input className={`inp ${error ? 'border-red-400' : ''} ${className}`} {...props} />
      {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 mx-auto" style={{ background: '#FFF8E1' }}>
        {Icon ? <Icon className="w-9 h-9 text-[#C9A227]" /> : <Package className="w-9 h-9 text-[#C9A227]" />}
      </div>
      <h3 className="text-lg font-black text-[#1C1C1C] mb-2">{title}</h3>
      {description && <p className="text-[#ABABAB] text-sm mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

/* ── Modal ── */
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size] || 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${maxW} max-h-[90vh] overflow-y-auto animate-fade-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB] sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="font-black text-base text-[#1C1C1C]">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#F7F5F0] flex items-center justify-center text-[#6B6B6B] hover:bg-[#EBEBEB] transition-colors font-bold text-lg leading-none">
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ── Select ── */
export function Select({ value, onChange, children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select value={value} onChange={onChange}
        className="inp appearance-none pr-8 font-semibold text-sm cursor-pointer w-full">
        {children}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ABABAB] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </div>
  );
}
