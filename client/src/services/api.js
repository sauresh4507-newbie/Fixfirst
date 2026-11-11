import axios from 'axios';

const isCapacitorNative = typeof window !== 'undefined' && (window.Capacitor?.isNativePlatform?.() || window.location.protocol === 'capacitor:');
const API_BASE = import.meta.env.VITE_API_URL || (isCapacitorNative ? 'http://10.0.2.2:5000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fixfirst_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth data
      localStorage.removeItem('fixfirst_token');
      localStorage.removeItem('fixfirst_user');
      // Only redirect if not already on auth pages
      const publicPaths = ['/login', '/register', '/forgot-password', '/'];
      if (!publicPaths.some((p) => window.location.pathname.startsWith(p))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// ─── Customer ────────────────────────────────────────────────────────────────
export const customerAPI = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
  changePassword: (data) => api.put('/customer/change-password', data),
};

// ─── Repairs ─────────────────────────────────────────────────────────────────
export const repairAPI = {
  create: (formData) =>
    api.post('/repairs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyRequests: (params) => api.get('/repairs/my-requests', { params }),
  getById: (id) => api.get(`/repairs/${id}`),
  close: (id) => api.post(`/repairs/${id}/close`),
  cancel: (id, reason) => api.post(`/repairs/${id}/cancel`, { reason }),
  escalate: (id) => api.post(`/repairs/${id}/escalate`),
  getQuotations: (id, params) => api.get(`/repairs/${id}/quotations`, { params }),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiAPI = {
  analyze: (data) => api.post('/ai/analyze-issue', data),
  troubleshoot: (data) => api.post('/ai/troubleshoot', data),
};

// ─── Vendors ─────────────────────────────────────────────────────────────────
export const vendorAPI = {
  register: (formData) =>
    api.post('/vendors/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getProfile: () => api.get('/vendors/profile'),
  updateProfile: (formData) =>
    api.put('/vendors/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getRepairRequests: (params) => api.get('/vendors/repair-requests', { params }),
  getPublicProfile: (id) => api.get(`/vendors/${id}/public`),
};

// ─── Quotations ──────────────────────────────────────────────────────────────
export const quotationAPI = {
  submit: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  withdraw: (id) => api.delete(`/quotations/${id}`),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  getVendors: (params) => api.get('/admin/vendors', { params }),
  verifyVendor: (id, data) => api.put(`/admin/vendors/${id}/verify`, data),
  getRepairs: (params) => api.get('/admin/repairs', { params }),
  getComplaints: (params) => api.get('/admin/complaints', { params }),
  updateComplaint: (id, data) => api.put(`/admin/complaints/${id}`, data),
};
