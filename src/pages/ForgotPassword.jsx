import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Zap, CheckCircle2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

function StepDot({ n, current, label }) {
  const done   = n < current;
  const active = n === current;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
      <div style={{
        width:32, height:32, borderRadius:'50%',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:800, fontSize:13, transition:'all 0.3s',
        background: done||active ? 'linear-gradient(135deg,#7a5200,#C9A227)' : '#F0EDE6',
        color: done||active ? '#fff' : '#ABABAB',
      }}>
        {done ? <CheckCircle2 size={16}/> : n}
      </div>
      <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1,
        color: active ? '#B8860B' : done ? '#6B6B6B' : '#ABABAB' }}>{label}</span>
    </div>
  );
}

export default function ForgotPassword() {
  const navigate  = useNavigate();
  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [email,    setEmail]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [resendCd, setResendCd] = useState(0);

  const startCooldown = () => {
    setResendCd(60);
    const t = setInterval(() => setResendCd(c => { if (c<=1){ clearInterval(t); return 0; } return c-1; }), 1000);
  };

  // Step 1 — send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      toast.success(data.message);
      setStep(2);
      startCooldown();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send OTP'); }
    setLoading(false);
  };

  // Step 2 — verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-reset-otp', { email: email.trim().toLowerCase(), otp });
      toast.success(data.message);
      setStep(3);
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
    setLoading(false);
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCd > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      toast.success('OTP resent!');
      startCooldown();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to resend'); }
    setLoading(false);
  };

  // Step 3 — reset password
  const handleReset = async (e) => {
    e.preventDefault();
    if (!password)              return toast.error('Enter your new password');
    if (password.length < 8)    return toast.error('Password must be at least 8 characters');
    if (password !== confirm)   return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(), otp, newPassword: password, confirmPassword: confirm,
      });
      toast.success(data.message);
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Reset failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background:'#F7F5F0' }}>
      <div className="w-full max-w-[420px] animate-fade-up">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-black text-2xl gradient-text tracking-widest">LUMINA</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border:'1px solid rgba(232,228,220,0.6)' }}>

          {/* Step dots */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
            <StepDot n={1} current={step} label="Email" />
            <div style={{ flex:1, height:2, margin:'0 8px', marginBottom:20, borderRadius:2, transition:'background 0.4s',
              background: step>1 ? 'linear-gradient(90deg,#7a5200,#C9A227)' : '#E8E4DC' }} />
            <StepDot n={2} current={step} label="Verify" />
            <div style={{ flex:1, height:2, margin:'0 8px', marginBottom:20, borderRadius:2, transition:'background 0.4s',
              background: step>2 ? 'linear-gradient(90deg,#7a5200,#C9A227)' : '#E8E4DC' }} />
            <StepDot n={3} current={step} label="Reset" />
          </div>

          {/* ── STEP 1: Enter Email ── */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-black text-[#1C1C1C] mb-1">Forgot Password?</h2>
              <p className="text-[#ABABAB] text-sm font-semibold mb-7">Enter your email and we'll send a reset code.</p>
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Email Address</label>
                  <div className="inp-wrap">
                    <Mail className="inp-icon" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className="inp" autoFocus />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full h-12 rounded-2xl font-bold text-sm gap-2">
                  {loading ? <><span className="spinner"/> Sending…</> : 'Send Reset Code →'}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: Verify OTP ── */}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-[#6B6B6B] font-bold text-sm mb-5 hover:text-[#B8860B] transition-colors">
                <ArrowLeft size={16}/> Back
              </button>
              <h2 className="text-2xl font-black text-[#1C1C1C] mb-1">Check Your Email</h2>
              <p className="text-[#6B6B6B] text-sm font-semibold mb-1">OTP sent to:</p>
              <p className="font-black text-[#B8860B] text-sm mb-7">{email}</p>
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Enter 6-digit OTP</label>
                  <input
                    type="text" inputMode="numeric" maxLength={6}
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="• • • • • •"
                    className="inp"
                    style={{ textAlign:'center', fontSize:28, fontWeight:900, letterSpacing:12, height:64, color:'#B8860B' }}
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={loading || otp.length < 6} className="btn-gold w-full h-12 rounded-2xl font-bold text-sm gap-2">
                  {loading ? <><span className="spinner"/> Verifying…</> : 'Verify OTP →'}
                </button>
              </form>
              <div className="mt-5 text-center">
                <p className="text-sm text-[#ABABAB] font-semibold mb-2">Didn't receive it?</p>
                <button onClick={handleResend} disabled={resendCd > 0 || loading}
                  style={{ background:'none', border:'none', cursor: resendCd>0?'not-allowed':'pointer',
                    color: resendCd>0?'#ABABAB':'#B8860B', fontSize:13, fontWeight:700 }}>
                  {resendCd > 0 ? `Resend in ${resendCd}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>
                  <CheckCircle2 className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <p className="font-black text-sm text-[#1C1C1C]">Identity Verified!</p>
                  <p className="text-xs text-[#ABABAB]">{email}</p>
                </div>
              </div>
              <h2 className="text-2xl font-black text-[#1C1C1C] mb-1">Set New Password</h2>
              <p className="text-[#ABABAB] text-sm font-semibold mb-7">Choose a strong password for your account.</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">New Password</label>
                  <div className="inp-wrap">
                    <Lock className="inp-icon"/>
                    <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                      placeholder="Min 8 characters" className="inp" style={{ paddingRight:44 }} autoFocus/>
                    <button type="button" className="inp-icon-right" onClick={()=>setShowPass(s=>!s)}>
                      {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div style={{ display:'flex', gap:4, marginTop:6, alignItems:'center' }}>
                      {[1,2,3,4].map(i=>(
                        <div key={i} style={{ flex:1, height:3, borderRadius:2, transition:'background 0.3s',
                          background: password.length>=i*2
                            ? i<=1?'#F87171':i<=2?'#FBB91C':i<=3?'#60A5FA':'#4ADE80'
                            : '#E8E4DC' }}/>
                      ))}
                      <span style={{ fontSize:10, color:'#ABABAB', fontWeight:700, whiteSpace:'nowrap', marginLeft:4 }}>
                        {password.length<4?'Weak':password.length<6?'Fair':password.length<8?'Good':'Strong'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Confirm Password</label>
                  <div className="inp-wrap">
                    <Lock className="inp-icon"/>
                    <input type={showPass?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)}
                      placeholder="Repeat password" className="inp"
                      style={{ borderColor: confirm && confirm!==password ? '#F87171' : undefined }}/>
                  </div>
                  {confirm && confirm!==password && <p style={{ color:'#F87171', fontSize:11, fontWeight:700, marginTop:4 }}>Passwords do not match</p>}
                  {confirm && confirm===password && <p style={{ color:'#4ADE80', fontSize:11, fontWeight:700, marginTop:4 }}>✓ Passwords match</p>}
                </div>
                <button type="submit" disabled={loading||password!==confirm||password.length<8}
                  className="btn-gold w-full h-12 rounded-2xl font-bold text-sm gap-2 mt-2">
                  {loading ? <><span className="spinner"/> Resetting…</> : '🔐 Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Back to login */}
          <div className="text-center mt-6">
            <Link to="/login" className="text-sm font-bold text-[#6B6B6B] hover:text-[#B8860B] transition-colors flex items-center justify-center gap-1.5">
              <ArrowLeft size={14}/> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
