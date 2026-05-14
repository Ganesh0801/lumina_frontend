import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! ✨`);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F5F0' }}>

      {/* ── LEFT DECORATIVE (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#FFF8E1,#F0E5C0)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #C9A227 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg animate-float"
            style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
            <Zap className="w-12 h-12 text-white" fill="white" />
          </div>
          <h1 className="text-6xl font-black gradient-text mb-3" style={{ fontFamily: 'Nunito' }}>LUMINA</h1>
          <p className="text-[#7a5200] text-lg font-semibold mb-12">Illuminate Your World</p>
          <div className="grid grid-cols-3 gap-4">
            {['💡','🏮','✨','🕯️','⚡','🌟'].map((e, i) => (
              <div key={i} className="text-4xl bg-white/60 rounded-2xl p-4 flex items-center justify-center shadow-sm animate-float"
                style={{ animationDelay: `${i * 0.3}s` }}>{e}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: FORM ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-black text-xl gradient-text tracking-widest">LUMINA</span>
          </div>

          <h2 className="text-3xl font-black text-[#1C1C1C] mb-1">Welcome Back</h2>
          <p className="text-[#ABABAB] font-semibold text-sm mb-8">Sign in to your Lumina account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ABABAB]" />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com" className="inp pl-20 py-3.5 text-sm font-semibold" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ABABAB]" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Your password" className="inp pl-11 pr-11 py-3.5 text-sm font-semibold" />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ABABAB] hover:text-[#B8860B] transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-bold text-[#B8860B] hover:underline">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-4 rounded-2xl font-bold text-base mt-2 flex items-center justify-center gap-2">
              {loading ? <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" className="opacity-25"/><path fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>Signing in…</> : 'Sign In'}
            </button>
          </form>

          {/* <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#EBEBEB]" />
            <span className="text-xs text-[#ABABAB] font-semibold">OR</span>
            <div className="flex-1 h-px bg-[#EBEBEB]" />
          </div> */}

          {/* <button className="w-full mt-4 bg-white border border-[#EBEBEB] rounded-2xl py-3.5 flex items-center justify-center gap-3 font-bold text-sm text-[#6B6B6B] hover:shadow-md transition-all">
            <span className="text-xl">🔷</span> Continue with Google
          </button> */}

          <p className="text-center mt-6 text-sm text-[#6B6B6B] font-semibold">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#B8860B] font-black hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
