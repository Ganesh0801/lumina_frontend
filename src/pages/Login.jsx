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
    if (!form.email || !form.password) return toast.error('Please fill all fields');
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

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#FFF8E1 0%,#F0E5C0 100%)' }}>
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle,#C9A22718 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl animate-float"
            style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
            <Zap className="w-12 h-12 text-white" fill="white" />
          </div>
          <h1 className="text-6xl font-black gradient-text mb-3">LUMINA</h1>
          <p className="text-[#7a5200] text-lg font-bold mb-12">Illuminate Your World</p>
          <div className="grid grid-cols-3 gap-3">
            {['💡','🏮','✨','🕯️','⚡','🌟'].map((e, i) => (
              <div key={i} className="text-3xl bg-white/70 rounded-2xl p-4 flex items-center justify-center shadow-sm animate-float"
                style={{ animationDelay: `${i * 0.25}s` }}>{e}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-[400px] animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg,#7a5200,#C9A227)' }}>
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-black text-2xl gradient-text tracking-widest">LUMINA</span>
          </div>

          <h2 className="text-3xl font-black text-[#1C1C1C] mb-1 leading-tight">Welcome Back</h2>
          <p className="text-[#ABABAB] font-semibold text-sm mb-8">Sign in to your Lumina account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Email Address</label>
              <div className="inp-wrap">
                <Mail className="inp-icon" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="inp"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Password</label>
              <div className="inp-wrap">
                <Lock className="inp-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Your password"
                  className="inp"
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button type="button" className="inp-icon-right" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" className="text-xs font-bold text-[#B8860B] hover:underline underline-offset-2">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full h-12 rounded-2xl font-bold text-sm mt-1 gap-2">
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E8E4DC]" />
            <span className="text-xs text-[#ABABAB] font-semibold">New to Lumina?</span>
            <div className="flex-1 h-px bg-[#E8E4DC]" />
          </div>

          <Link to="/register"
            className="block w-full h-12 rounded-2xl border-2 border-[#C9A227] text-[#B8860B] font-bold text-sm text-center leading-[44px] hover:bg-[#FFF8E1] transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
