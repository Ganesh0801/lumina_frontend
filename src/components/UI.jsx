import React from 'react';
import { Star, Package, Eye, EyeOff, Lock } from 'lucide-react';

/* ── Loading Spinner ── */
export function LoadingSpinner({ size = 'md', text }) {
  const s = { sm:'w-6 h-6', md:'w-10 h-10', lg:'w-14 h-14' }[size];
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className={`${s} rounded-full animate-spin`}
        style={{ border:'3px solid #E8E4DC', borderTopColor:'#C9A227' }} />
      {text && <p className="text-sm text-[#ABABAB] font-semibold">{text}</p>}
    </div>
  );
}

/* ── Status Badge ── */
const STATUS = {
  pending:    { label:'Pending',    cls:'status-pending'    },
  confirmed:  { label:'Confirmed',  cls:'status-confirmed'  },
  processing: { label:'Processing', cls:'status-processing' },
  shipped:    { label:'Shipped',    cls:'status-shipped'    },
  delivered:  { label:'Delivered',  cls:'status-delivered'  },
  cancelled:  { label:'Cancelled',  cls:'status-cancelled'  },
  refunded:   { label:'Refunded',   cls:'status-refunded'   },
};
export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${s.cls}`}>
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
        <Star key={i} className={`${w} ${i <= Math.round(rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#E8E4DC] text-[#E8E4DC]'}`} />
      ))}
    </div>
  );
}

/* ── Gold Button ── */
export function GoldButton({ children, onClick, disabled, loading, className='', type='button' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      className={`btn-gold h-11 px-6 rounded-xl gap-2 ${className}`}>
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}

/* ── Input ── */
export function Input({ label, error, className='', ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">{label}</label>}
      <input className={`inp ${error ? 'border-red-400 focus:border-red-400' : ''} ${className}`} {...props} />
      {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
}

/* ── Password Input ── */
export function PasswordInput({ label, error, ...props }) {
  const [show, setShow] = React.useState(false);
  return (
    <div>
      {label && <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">{label}</label>}
      <div className="inp-wrap">
        <Lock className="inp-icon" />
        <input type={show ? 'text' : 'password'} className={`inp ${error ? 'border-red-400' : ''}`} style={{ paddingRight:44 }} {...props} />
        <button type="button" className="inp-icon-right" onClick={() => setShow(s=>!s)}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 mx-auto"
        style={{ background:'#FFF8E1' }}>
        {Icon ? <Icon className="w-9 h-9 text-[#C9A227]" /> : <Package className="w-9 h-9 text-[#C9A227]" />}
      </div>
      <h3 className="text-lg font-black text-[#1C1C1C] mb-2">{title}</h3>
      {description && <p className="text-[#ABABAB] text-sm mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

/* ── Modal ── */
export function Modal({ isOpen, onClose, title, children, size='md' }) {
  if (!isOpen) return null;
  const maxW = { sm:'max-w-sm', md:'max-w-xl', lg:'max-w-3xl', xl:'max-w-5xl' }[size] || 'max-w-xl';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${maxW} max-h-[90vh] overflow-y-auto animate-fade-up`}
        style={{ border:'1px solid rgba(232,228,220,0.6)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EDE6] sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="font-black text-base text-[#1C1C1C]">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#F7F5F0] flex items-center justify-center text-[#6B6B6B] hover:bg-[#EBEBEB] transition-colors font-bold text-xl leading-none">
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ── Select ── */
export function Select({ value, onChange, children, className='' }) {
  return (
    <div className={`relative ${className}`}>
      <select value={value} onChange={onChange} className="inp inp-select">
        {children}
      </select>
    </div>
  );
}
