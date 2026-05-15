import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, User, Phone, CheckCircle2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// ── Step indicator ────────────────────────────────────────
function StepDot({ n, current, label }) {
  const done   = n < current;
  const active = n === current;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 13,
        background: done || active ? 'linear-gradient(135deg,#7a5200,#C9A227)' : '#F0EDE6',
        color: done || active ? '#fff' : '#ABABAB',
        transition: 'all 0.3s',
      }}>
        {done ? <CheckCircle2 size={16} /> : n}
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#B8860B' : done ? '#6B6B6B' : '#ABABAB', textTransform:'uppercase', letterSpacing:1 }}>
        {label}
      </span>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, register } = useAuth();

  const [step,     setStep]     = useState(1);      // 1=details, 2=otp, 3=password
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Step 1 fields
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 field
  const [otp,     setOtp]     = useState('');
  const [resendCd, setResendCd] = useState(0);

  // Step 3 fields
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── STEP 1: send OTP ──────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!name.trim())  return toast.error('Please enter your name');
    if (!email.trim()) return toast.error('Please enter your email');
    if (!phone.trim()) return toast.error('Please enter your phone number');
    if (!/^\+?[\d\s\-()]{8,}$/.test(phone)) return toast.error('Please enter a valid phone number');
    setLoading(true);
    try {
      await sendOTP(name.trim(), email.trim().toLowerCase(), phone.trim());
      toast.success(`OTP sent to ${email}! Check your inbox.`);
      setStep(2);
      startResendCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  // ── STEP 2: verify OTP ────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) return toast.error('Please enter the OTP');
    setLoading(true);
    try {
      await verifyOTP(email.trim().toLowerCase(), otp.trim());
      toast.success('Email verified! Set your password.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCd > 0) return;
    setLoading(true);
    try {
      await sendOTP(name.trim(), email.trim().toLowerCase(), phone.trim());
      toast.success('OTP resent!');
      startResendCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
    setLoading(false);
  };

  const startResendCooldown = () => {
    setResendCd(60);
    const t = setInterval(() => {
      setResendCd(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  // ── STEP 3: set password & complete ──────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!password)                    return toast.error('Please enter a password');
    if (password.length < 8)          return toast.error('Password must be at least 8 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, confirmPassword);
      toast.success('Account created! Welcome to Lumina ✨');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F5F0' }}>

      {/* ── LEFT PANEL (desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#FFF8E1 0%,#F0E5C0 100%)' }}>
        <div className="absolute inset-0"
          style={{ backgroundImage:'radial-gradient(circle,#C9A22718 1px,transparent 1px)', backgroundSize:'36px 36px' }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl animate-float"
            style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>
            <Zap className="w-12 h-12 text-white" fill="white" />
          </div>
          <h1 className="text-6xl font-black gradient-text mb-3">LUMINA</h1>
          <p className="text-[#7a5200] text-lg font-bold mb-10">Join thousands of happy customers</p>
          <div className="space-y-3">
            {[
              { icon:'✓', text:'500+ Premium Products' },
              { icon:'✓', text:'Free Delivery on ₹999+' },
              { icon:'✓', text:'2-Year Warranty' },
              { icon:'✓', text:'Email Verified Accounts' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/70 rounded-2xl px-5 py-3.5 text-left shadow-sm">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>{icon}</span>
                <span className="font-bold text-sm text-[#1C1C1C]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-[400px] animate-fade-up py-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-black text-2xl gradient-text tracking-widest">LUMINA</span>
          </div>

          {/* Step indicator */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
            <StepDot n={1} current={step} label="Details" />
            <div style={{ flex:1, height:2, margin:'0 8px', marginBottom:20, background: step > 1 ? 'linear-gradient(90deg,#7a5200,#C9A227)' : '#E8E4DC', borderRadius:2, transition:'background 0.4s' }} />
            <StepDot n={2} current={step} label="Verify" />
            <div style={{ flex:1, height:2, margin:'0 8px', marginBottom:20, background: step > 2 ? 'linear-gradient(90deg,#7a5200,#C9A227)' : '#E8E4DC', borderRadius:2, transition:'background 0.4s' }} />
            <StepDot n={3} current={step} label="Password" />
          </div>

          {/* ── STEP 1: Details ── */}
          {step === 1 && (
            <>
              <h2 className="text-3xl font-black text-[#1C1C1C] mb-1">Create Account</h2>
              <p className="text-[#ABABAB] font-semibold text-sm mb-7">Enter your details to get started</p>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Full Name</label>
                  <div className="inp-wrap">
                    <User className="inp-icon" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="John Doe" className="inp" autoComplete="name" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Email Address</label>
                  <div className="inp-wrap">
                    <Mail className="inp-icon" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className="inp" autoComplete="email" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Phone Number</label>
                  <div className="inp-wrap">
                    <Phone className="inp-icon" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210" className="inp" autoComplete="tel" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="btn-gold w-full h-12 rounded-2xl font-bold text-sm gap-2 mt-2">
                  {loading ? <><span className="spinner" /> Sending OTP…</> : 'Send OTP →'}
                </button>
              </form>
              <p className="text-center mt-6 text-sm text-[#6B6B6B] font-semibold">
                Already have an account?{' '}
                <Link to="/login" className="text-[#B8860B] font-black hover:underline underline-offset-2">Sign In</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-[#6B6B6B] font-bold text-sm mb-6 hover:text-[#B8860B] transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <h2 className="text-3xl font-black text-[#1C1C1C] mb-1">Verify Email</h2>
              <p className="text-[#6B6B6B] font-semibold text-sm mb-2">
                We sent a 6-digit OTP to
              </p>
              <p className="font-black text-[#B8860B] text-sm mb-7">{email}</p>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="• • • • • •"
                    className="inp"
                    style={{
                      textAlign: 'center',
                      fontSize: 28,
                      fontWeight: 900,
                      letterSpacing: 12,
                      height: 64,
                      color: '#B8860B',
                    }}
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading || otp.length < 6}
                  className="btn-gold w-full h-12 rounded-2xl font-bold text-sm gap-2">
                  {loading ? <><span className="spinner" /> Verifying…</> : 'Verify OTP →'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-sm text-[#ABABAB] font-semibold mb-2">Didn't receive the OTP?</p>
                <button onClick={handleResend} disabled={resendCd > 0 || loading}
                  className="text-sm font-bold transition-colors"
                  style={{ color: resendCd > 0 ? '#ABABAB' : '#B8860B', background:'none', border:'none', cursor: resendCd > 0 ? 'not-allowed' : 'pointer' }}>
                  {resendCd > 0 ? `Resend in ${resendCd}s` : 'Resend OTP'}
                </button>
              </div>

              {/* OTP hint for dev */}
              <div className="mt-5 p-3 rounded-xl text-center" style={{ background:'#FFF8E1', border:'1px solid #F5E0A0' }}>
                <p className="text-xs text-[#B8860B] font-semibold">📧 Check your email inbox (and spam folder)</p>
              </div>
            </>
          )}

          {/* ── STEP 3: Set Password ── */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm text-[#1C1C1C]">Email Verified!</p>
                  <p className="text-xs text-[#ABABAB]">{email}</p>
                </div>
              </div>

              <h2 className="text-3xl font-black text-[#1C1C1C] mb-1">Set Password</h2>
              <p className="text-[#ABABAB] font-semibold text-sm mb-7">Almost there! Choose a strong password.</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Password</label>
                  <div className="inp-wrap">
                    <Lock className="inp-icon" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="inp"
                      style={{ paddingRight: 44 }}
                      autoComplete="new-password"
                    />
                    <button type="button" className="inp-icon-right" onClick={() => setShowPass(s => !s)}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {password.length > 0 && (
                    <div style={{ display:'flex', gap:4, marginTop:6 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex:1, height:3, borderRadius:2,
                          background: password.length >= i*2
                            ? i <= 1 ? '#F87171' : i <= 2 ? '#FBB91C' : i <= 3 ? '#60A5FA' : '#4ADE80'
                            : '#E8E4DC',
                          transition:'background 0.3s',
                        }} />
                      ))}
                      <span style={{ fontSize:10, color:'#ABABAB', fontWeight:700, whiteSpace:'nowrap', marginLeft:4 }}>
                        {password.length < 4 ? 'Weak' : password.length < 6 ? 'Fair' : password.length < 8 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Confirm Password</label>
                  <div className="inp-wrap">
                    <Lock className="inp-icon" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="inp"
                      style={{
                        borderColor: confirmPassword && confirmPassword !== password ? '#F87171' : undefined,
                      }}
                      autoComplete="new-password"
                    />
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p style={{ color:'#F87171', fontSize:11, fontWeight:700, marginTop:4 }}>Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p style={{ color:'#4ADE80', fontSize:11, fontWeight:700, marginTop:4 }}>✓ Passwords match</p>
                  )}
                </div>

                <button type="submit" disabled={loading || password !== confirmPassword || password.length < 8}
                  className="btn-gold w-full h-12 rounded-2xl font-bold text-sm gap-2 mt-2">
                  {loading ? <><span className="spinner" /> Creating Account…</> : '🎉 Create Account'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
