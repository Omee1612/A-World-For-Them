import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Axios instance
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('straypaws_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('straypaws_token');
      localStorage.removeItem('straypaws_user');
    }
    return Promise.reject(err);
  }
);

export { api };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('straypaws_token');
    const savedUser = localStorage.getItem('straypaws_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setAuthError('');
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('straypaws_token', token);
    localStorage.setItem('straypaws_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const register = async (name, email, password, phone) => {
    setAuthError('');
    const res = await api.post('/auth/register', { name, email, password, phone });
    const { token, user: userData } = res.data;
    localStorage.setItem('straypaws_token', token);
    localStorage.setItem('straypaws_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('straypaws_token');
    localStorage.removeItem('straypaws_user');
    setUser(null);
  }, []);

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('straypaws_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, register, logout, updateUser, api }}>
      {children}
    </AuthContext.Provider>
  );
};
