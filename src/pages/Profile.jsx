import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Lock, ChevronLeft, Eye, EyeOff, Mail, Phone, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { key:'profile',  label:'Profile',  icon: User   },
  { key:'address',  label:'Address',  icon: MapPin  },
  { key:'security', label:'Security', icon: Lock    },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState({ current:false, new:false, confirm:false });
  const [profile, setProfile] = useState({ name: user?.name||'', phone: user?.phone||'' });
  const [address, setAddress] = useState(user?.address || { street:'', city:'', state:'', pincode:'', country:'India' });
  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'', confirmNew:'' });

  const setP  = (k,v) => setProfile(p=>({...p,[k]:v}));
  const setA  = (k,v) => setAddress(p=>({...p,[k]:v}));
  const setPw = (k,v) => setPasswords(p=>({...p,[k]:v}));

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name:profile.name, phone:profile.phone, address });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    setLoading(false);
  };

  const changePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) return toast.error('Fill all fields');
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (passwords.newPassword !== passwords.confirmNew) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword:passwords.currentPassword, newPassword:passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword:'', newPassword:'', confirmNew:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8" style={{ background:'#F7F5F0' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-20">

        {/* Header */}
        <div className="flex items-center gap-3 py-5">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#6B6B6B]">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-[#1C1C1C]">My Profile</h1>
        </div>

        {/* User card */}
        <div className="bg-white rounded-3xl p-5 mb-5 flex items-center gap-4 shadow-sm"
          style={{ border:'1px solid rgba(232,228,220,0.6)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-black text-lg text-[#1C1C1C]">{user?.name}</p>
            <p className="text-sm text-[#ABABAB] font-semibold">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ background:'linear-gradient(135deg,#7a5200,#C9A227)' }}>{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-white p-1.5 rounded-2xl shadow-sm" style={{ border:'1px solid rgba(232,228,220,0.6)' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={tab===key ? {
                background:'linear-gradient(135deg,#7a5200,#C9A227)',
                color:'#fff',
                boxShadow:'0 4px 12px rgba(184,134,11,0.25)',
              } : { color:'#ABABAB' }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm animate-fade-in" style={{ border:'1px solid rgba(232,228,220,0.6)' }}>
            <h2 className="font-black text-sm text-[#1C1C1C] mb-5 uppercase tracking-widest">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Full Name</label>
                <div className="inp-wrap">
                  <User className="inp-icon" />
                  <input value={profile.name} onChange={e => setP('name',e.target.value)}
                    placeholder="Your full name" className="inp" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Email Address</label>
                <div className="inp-wrap">
                  <Mail className="inp-icon" />
                  <input value={user?.email} disabled className="inp" style={{ opacity:0.5 }} />
                </div>
                <p className="text-xs text-[#ABABAB] mt-1.5 ml-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Phone Number</label>
                <div className="inp-wrap">
                  <Phone className="inp-icon" />
                  <input value={profile.phone} onChange={e => setP('phone',e.target.value)}
                    placeholder="+91 98765 43210" className="inp" type="tel" />
                </div>
              </div>
              <button onClick={saveProfile} disabled={loading}
                className="btn-gold w-full h-12 rounded-2xl font-bold text-sm gap-2 mt-2">
                {loading ? <><span className="spinner" /> Saving…</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        )}

        {/* ── ADDRESS TAB ── */}
        {tab === 'address' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm animate-fade-in" style={{ border:'1px solid rgba(232,228,220,0.6)' }}>
            <h2 className="font-black text-sm text-[#1C1C1C] mb-5 uppercase tracking-widest">Delivery Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">Street / Flat / Area</label>
                <div className="inp-wrap">
                  <MapPin className="inp-icon" />
                  <input value={address.street} onChange={e => setA('street',e.target.value)}
                    placeholder="House no., Street, Area…" className="inp" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k:'city', label:'City', placeholder:'Chennai' },
                  { k:'state', label:'State', placeholder:'Tamil Nadu' },
                ].map(({ k, label, placeholder }) => (
                  <div key={k}>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">{label}</label>
                    <input value={address[k]} onChange={e => setA(k,e.target.value)}
                      placeholder={placeholder} className="inp" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k:'pincode', label:'PIN Code', placeholder:'600001' },
                  { k:'country', label:'Country', placeholder:'India' },
                ].map(({ k, label, placeholder }) => (
                  <div key={k}>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">{label}</label>
                    <input value={address[k]} onChange={e => setA(k,e.target.value)}
                      placeholder={placeholder} className="inp" />
                  </div>
                ))}
              </div>
              <button onClick={saveProfile} disabled={loading}
                className="btn-gold w-full h-12 rounded-2xl font-bold text-sm gap-2 mt-2">
                {loading ? <><span className="spinner" /> Saving…</> : <><Save size={16} /> Save Address</>}
              </button>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {tab === 'security' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm animate-fade-in" style={{ border:'1px solid rgba(232,228,220,0.6)' }}>
            <h2 className="font-black text-sm text-[#1C1C1C] mb-5 uppercase tracking-widest">Change Password</h2>
            <div className="space-y-4">
              {[
                { k:'currentPassword', label:'Current Password', show:'current' },
                { k:'newPassword',     label:'New Password',     show:'new'     },
                { k:'confirmNew',      label:'Confirm Password', show:'confirm' },
              ].map(({ k, label, show }) => (
                <div key={k}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#6B6B6B] mb-2">{label}</label>
                  <div className="inp-wrap">
                    <Lock className="inp-icon" />
                    <input
                      type={showPw[show] ? 'text' : 'password'}
                      value={passwords[k]}
                      onChange={e => setPw(k,e.target.value)}
                      placeholder="••••••••"
                      className="inp"
                      style={{ paddingRight: 44 }}
                    />
                    <button type="button" className="inp-icon-right"
                      onClick={() => setShowPw(p=>({...p,[show]:!p[show]}))}>
                      {showPw[show] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={changePassword} disabled={loading}
                className="btn-gold w-full h-12 rounded-2xl font-bold text-sm gap-2 mt-2">
                {loading ? <><span className="spinner" /> Updating…</> : <><Lock size={16} /> Change Password</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
