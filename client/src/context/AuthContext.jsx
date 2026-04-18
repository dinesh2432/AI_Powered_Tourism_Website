import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * BUG-02 FIX: Client-side subscription expiry check.
 * Mirrors the backend getEffectivePlan() from planConfig.js.
 * If a user's PRO/PREMIUM has expired, returns 'FREE'.
 */
export const getClientEffectivePlan = (user) => {
  if (!user) return 'FREE';
  const { subscription, subscriptionEndDate } = user;
  if (!subscription || subscription === 'FREE') return 'FREE';
  if (!subscriptionEndDate) return 'FREE'; // paid plan but no end date — treat as free
  return new Date(subscriptionEndDate) > new Date() ? subscription : 'FREE';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Auto-refresh user from DB on app load so admin plan overrides are immediately reflected
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/auth/me').then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }).catch(() => {
      // Token invalid or expired — let normal auth flow handle it
    });
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async (token) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { token });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Google login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  // Manually re-fetch user from server (useful after admin plan changes)
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (_) {}
  }, []);

  // BUG-02 FIX: derive effectivePlan on every user state change
  // Use this EVERYWHERE instead of user.subscription to handle expiry correctly
  const effectivePlan = useMemo(() => getClientEffectivePlan(user), [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUser, refreshUser, effectivePlan }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
