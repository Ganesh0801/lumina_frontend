import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GoldButton, Input } from '../components/UI';

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
    <div className="min-h-screen flex">
      {/* Left Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-dark-gradient items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #C9A227 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl animate-float" />
        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 bg-gold-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 animate-glow">
            <Zap className="w-12 h-12 text-white" fill="white" />
          </div>
          <h1 className="font-display text-6xl font-black gradient-text mb-4">LUMINA</h1>
          <p className="text-dark-300 text-xl font-light tracking-wide">Illuminate Your World</p>
          <div className="mt-16 grid grid-cols-3 gap-4">
            {['💡', '🏮', '✨', '🕯️', '⚡', '🌟'].map((e, i) => (
              <div key={i} className={`text-4xl glass rounded-2xl p-4 flex items-center justify-center animate-float`}
                style={{ animationDelay: `${i * 0.3}s` }}>
                {e}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-dark-900">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text tracking-widest">LUMINA</span>
          </div>

          <h2 className="font-display text-4xl font-bold text-dark-50 mb-2">Welcome Back</h2>
          <p className="text-dark-400 mb-10">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-9 text-dark-400 hover:text-gold-400 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <GoldButton type="submit" loading={loading} className="w-full text-base">
              Sign In <ArrowRight className="w-4 h-4" />
            </GoldButton>
          </form>

          {/* <div className="mt-6 p-4 glass rounded-xl">
            <p className="text-dark-400 text-xs mb-2 font-medium">Demo credentials:</p>
            <p className="text-dark-300 text-xs">Admin: <span className="text-gold-400">admin@lumina.com</span> / <span className="text-gold-400">Admin@123</span></p>
          </div> */}

          <p className="text-center text-dark-400 text-sm mt-6">
            New to Lumina?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
