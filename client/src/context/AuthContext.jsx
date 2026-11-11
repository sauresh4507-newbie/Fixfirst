import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('fixfirst_token'));

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      setVendorProfile(data.vendorProfile);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('fixfirst_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setVendorProfile(data.vendorProfile);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('fixfirst_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('fixfirst_token');
    localStorage.removeItem('fixfirst_user');
    setToken(null);
    setUser(null);
    setVendorProfile(null);
  }, []);

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const updateVendorProfile = (profile) => {
    setVendorProfile(profile);
  };

  const isAuthenticated = !!token && !!user;

  const getRedirectPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'vendor': return '/vendor';
      default: return '/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vendorProfile,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        updateVendorProfile,
        getRedirectPath,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
