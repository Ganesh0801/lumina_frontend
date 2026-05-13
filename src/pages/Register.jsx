import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!form.name || !form.email || !form.password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Lumina ✨');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F5F0' }}>
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#FFF8E1,#F0E5C0)' }}>
        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg animate-float"
            style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
            <Zap className="w-12 h-12 text-white" fill="white" />
          </div>
          <h1 className="text-6xl font-black gradient-text mb-3">LUMINA</h1>
          <p className="text-[#7a5200] text-lg font-semibold mb-8">Join thousands of happy customers</p>
          {['500+ Premium Products','Free Delivery on ₹999+','2-Year Warranty','24/7 Support'].map(f => (
            <div key={f} className="flex items-center gap-3 bg-white/60 rounded-2xl px-5 py-3 mb-2 text-left shadow-sm">
              <span className="text-green-500 font-black">✓</span>
              <span className="font-bold text-sm text-[#1C1C1C]">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-black text-xl gradient-text tracking-widest">LUMINA</span>
          </div>

          <h2 className="text-3xl font-black text-[#1C1C1C] mb-1">Create Account</h2>
          <p className="text-[#ABABAB] font-semibold text-sm mb-8">Join Lumina and light up your world</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { f:'name', label:'Full Name', icon:User, placeholder:'John Doe', type:'text' },
              { f:'email', label:'Email Address', icon:Mail, placeholder:'you@example.com', type:'email' },
            ].map(({ f, label, icon: Icon, placeholder, type }) => (
              <div key={f}>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ABABAB]" />
                  <input type={type} value={form[f]} onChange={e => set(f, e.target.value)}
                    placeholder={placeholder} className="inp pl-11 py-3.5 text-sm font-semibold" />
                </div>
              </div>
            ))}

            {[
              { f:'password', label:'Password', placeholder:'Min 6 characters' },
              { f:'confirmPassword', label:'Confirm Password', placeholder:'Repeat password' },
            ].map(({ f, label, placeholder }) => (
              <div key={f}>
                <label className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-1.5 block">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ABABAB]" />
                  <input type={showPass ? 'text' : 'password'} value={form[f]} onChange={e => set(f, e.target.value)}
                    placeholder={placeholder} className="inp pl-11 pr-11 py-3.5 text-sm font-semibold" />
                  {f === 'confirmPassword' && (
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ABABAB] hover:text-[#B8860B]">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-4 rounded-2xl font-bold text-base mt-2 flex items-center justify-center gap-2">
              {loading ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" className="opacity-25"/><path fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>Creating…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[#6B6B6B] font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="text-[#B8860B] font-black hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
