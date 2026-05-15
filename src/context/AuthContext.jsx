import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lumina_user')); } catch { return null; }
  });

  // ── Step 1: Send OTP ──────────────────────────────────
  const sendOTP = async (name, email, phone) => {
    const { data } = await api.post('/auth/send-otp', { name, email, phone });
    return data; // { message, userId }
  };

  // ── Step 2: Verify OTP ────────────────────────────────
  const verifyOTP = async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data; // { message, email }
  };

  // ── Step 3: Complete registration ─────────────────────
  const register = async (email, password, confirmPassword) => {
    const { data } = await api.post('/auth/register', { email, password, confirmPassword });
    localStorage.setItem('lumina_token', data.token);
    localStorage.setItem('lumina_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  // ── Login ─────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('lumina_token', data.token);
    localStorage.setItem('lumina_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  // ── Logout ────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('lumina_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      updateUser(data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, sendOTP, verifyOTP, register,
      updateUser, refreshUser, isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
