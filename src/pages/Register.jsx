import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, User, Phone, Lock, Eye, EyeOff, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { GoldButton, Input } from '../components/UI';

const STEPS = ['info', 'otp', 'password'];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    otp: '',
    password: '', confirmPassword: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' }
  });

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));
  const setAddr = (field, value) => setForm(p => ({ ...p, address: { ...p.address, [field]: value } }));

  const handleOtpChange = (index, val) => {
    if (!/^\d*$/.test(val)) return;
    const digits = [...otpDigits];
    digits[index] = val.slice(-1);
    setOtpDigits(digits);
    set('otp', digits.join(''));
    if (val && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const sendOTP = async () => {
    if (!form.name || !form.email || !form.phone) return toast.error('Fill all fields');
    if (!/^\d{10}$/.test(form.phone)) return toast.error('Enter valid 10-digit phone');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { name: form.name, email: form.email, phone: form.phone });
      toast.success('OTP sent to your email!');
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    if (form.otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: form.email, otp: form.otp });
      toast.success('Email verified!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const register = async () => {
    if (!form.password || form.password.length < 8) return toast.error('Password must be 8+ characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!form.address.street || !form.address.city || !form.address.pincode) return toast.error('Fill address details');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        address: form.address
      });
      localStorage.setItem('lumina_token', data.token);
      localStorage.setItem('lumina_user', JSON.stringify(data.user));
      toast.success('Welcome to Lumina! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-dark-gradient items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #C9A227 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-8 animate-glow">
            <Zap className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="font-display text-5xl font-bold gradient-text mb-4">LUMINA</h1>
          <p className="text-dark-300 text-lg mb-12">Illuminate Your World with Elegance</p>
          <div className="space-y-4 text-left">
            {['Exclusive lighting collections', 'Smart home integration', 'Premium quality guaranteed', 'Free delivery above ₹999'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-dark-200">
                <CheckCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-dark-900">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {['Your Info', 'Verify Email', 'Set Password'].map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-gold-gradient text-white' :
                    i === step ? 'bg-gold-gradient text-white animate-glow' :
                    'bg-dark-700 text-dark-400'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${i === step ? 'text-gold-400 font-medium' : 'text-dark-400'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px transition-all ${i < step ? 'bg-gold-gradient' : 'bg-dark-700'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* STEP 1: Personal Info */}
          {step === 0 && (
            <div className="animate-fade-up">
              <h2 className="font-display text-3xl font-bold text-dark-50 mb-2">Create Account</h2>
              <p className="text-dark-400 mb-8">Let's start with your basic details</p>
              <div className="space-y-4">
                <Input label="Full Name" type="text" placeholder="e.g. Arjun Sharma" value={form.name}
                  onChange={e => set('name', e.target.value)} />
                <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)} />
                <Input label="Phone Number" type="tel" placeholder="10-digit mobile number" value={form.phone}
                  onChange={e => set('phone', e.target.value)} />
                <GoldButton onClick={sendOTP} loading={loading} className="w-full mt-2">
                  Send OTP <ArrowRight className="w-4 h-4" />
                </GoldButton>
              </div>
              <p className="text-center text-dark-400 text-sm mt-6">
                Already have an account? <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">Sign In</Link>
              </p>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 className="font-display text-3xl font-bold text-dark-50 mb-2">Verify Email</h2>
              <p className="text-dark-400 mb-2">We sent a 6-digit code to</p>
              <p className="text-gold-400 font-semibold mb-8">{form.email}</p>
              <div className="flex gap-3 justify-center mb-8">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="input-dark w-12 h-14 text-center text-xl font-bold rounded-xl"
                  />
                ))}
              </div>
              <GoldButton onClick={verifyOTP} loading={loading} className="w-full">
                Verify OTP <ArrowRight className="w-4 h-4" />
              </GoldButton>
              <button onClick={() => { sendOTP(); }} className="block w-full text-center text-sm text-dark-400 hover:text-gold-400 mt-4 transition-colors">
                Didn't receive? Resend OTP
              </button>
              <button onClick={() => setStep(0)} className="block w-full text-center text-sm text-dark-500 mt-2 hover:text-dark-300 transition-colors">
                ← Change email
              </button>
            </div>
          )}

          {/* STEP 3: Password + Address */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h2 className="font-display text-3xl font-bold text-dark-50 mb-2">Almost There!</h2>
              <p className="text-dark-400 mb-8">Set your password and delivery address</p>
              <div className="space-y-4">
                <div className="relative">
                  <Input label="Password" type={showPass ? 'text' : 'password'} placeholder="Min 8 characters"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                  <button onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-9 text-dark-400 hover:text-gold-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input label="Confirm Password" type="password" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />

                <div className="pt-2">
                  <p className="text-sm font-medium text-dark-200 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gold-400" /> Delivery Address
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="Street / Flat No / Area" value={form.address.street}
                      onChange={e => setAddr('street', e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="City" value={form.address.city} onChange={e => setAddr('city', e.target.value)} />
                      <Input placeholder="State" value={form.address.state} onChange={e => setAddr('state', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Pincode" value={form.address.pincode} onChange={e => setAddr('pincode', e.target.value)} />
                      <Input placeholder="Country" value={form.address.country} onChange={e => setAddr('country', e.target.value)} />
                    </div>
                  </div>
                </div>

                <GoldButton onClick={register} loading={loading} className="w-full mt-2">
                  Create Account 🎉
                </GoldButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
