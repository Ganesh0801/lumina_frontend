import React, { useState } from 'react';
import { User, MapPin, Lock, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Input, GoldButton } from '../components/UI';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [address, setAddress] = useState(user?.address || { street: '', city: '', state: '', pincode: '', country: 'India' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });

  const setP = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const setA = (k, v) => setAddress(p => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPasswords(p => ({ ...p, [k]: v }));

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name: profile.name, phone: profile.phone, address });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    setLoading(false);
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmNew) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  const TABS = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'address', label: 'Address', icon: MapPin },
    { key: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="glass rounded-2xl p-6 flex items-center gap-5 mb-8">
          <div className="w-20 h-20 bg-gold-gradient rounded-2xl flex items-center justify-center text-white font-display text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-dark-50">{user?.name}</h1>
            <p className="text-dark-400">{user?.email}</p>
            <p className="text-gold-400 text-sm capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === key ? 'bg-gold-gradient text-white shadow-lg' : 'glass text-dark-300 hover:text-gold-400'}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="glass rounded-2xl p-6 animate-fade-in space-y-4">
            <h2 className="font-semibold text-dark-100 text-lg mb-5">Personal Information</h2>
            <Input label="Full Name" value={profile.name} onChange={e => setP('name', e.target.value)} />
            <Input label="Email" value={user?.email} disabled className="opacity-50 cursor-not-allowed" />
            <Input label="Phone" value={profile.phone} onChange={e => setP('phone', e.target.value)} />
            <GoldButton onClick={saveProfile} loading={loading}>Save Changes</GoldButton>
          </div>
        )}

        {/* Address Tab */}
        {tab === 'address' && (
          <div className="glass rounded-2xl p-6 animate-fade-in space-y-4">
            <h2 className="font-semibold text-dark-100 text-lg mb-5">Delivery Address</h2>
            <Input label="Street / Flat / Area" value={address.street} onChange={e => setA('street', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={address.city} onChange={e => setA('city', e.target.value)} />
              <Input label="State" value={address.state} onChange={e => setA('state', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Pincode" value={address.pincode} onChange={e => setA('pincode', e.target.value)} />
              <Input label="Country" value={address.country} onChange={e => setA('country', e.target.value)} />
            </div>
            <GoldButton onClick={saveProfile} loading={loading}>Save Address</GoldButton>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <div className="glass rounded-2xl p-6 animate-fade-in space-y-4">
            <h2 className="font-semibold text-dark-100 text-lg mb-5">Change Password</h2>
            <Input label="Current Password" type="password" value={passwords.currentPassword} onChange={e => setPw('currentPassword', e.target.value)} />
            <Input label="New Password" type="password" value={passwords.newPassword} onChange={e => setPw('newPassword', e.target.value)} />
            <Input label="Confirm New Password" type="password" value={passwords.confirmNew} onChange={e => setPw('confirmNew', e.target.value)} />
            <GoldButton onClick={changePassword} loading={loading}>Change Password</GoldButton>
          </div>
        )}
      </div>
    </div>
  );
}
