import axios from 'axios';

// ============================================
// 1. SIMPLIFIED API CONFIGURATION
// ============================================
const getBaseURL = () => {
  // Priority 1: Explicit environment variable (overrides everything)
  if (process.env.REACT_APP_API_URL) {
    console.log(`⚙️ Using explicit API URL from env: ${process.env.REACT_APP_API_URL}`);
    return process.env.REACT_APP_API_URL;
  }

  // Priority 2: Production with custom API domain
  if (process.env.NODE_ENV === 'production') {
    // Use your custom API subdomain
    const productionURL = 'https://api.rudapaints.com/api';
    console.log(`🌍 Production: Using custom API domain: ${productionURL}`);
    return productionURL;
  }

  // Priority 3: Default development (localhost)
  const devURL = 'http://localhost:5000/api';
  console.log(`💻 Development: Using local API: ${devURL}`);
  return devURL;
};

// ============================================
// 2. AXIOS INSTANCE
// ============================================
const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// ============================================
// 3. REQUEST INTERCEPTOR
// ============================================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rudapaints_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Clean logs only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📨 API ${config.method?.toUpperCase()}: ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error.message);
    return Promise.reject(error);
  }
);

// ============================================
// 4. RESPONSE INTERCEPTOR
// ============================================
API.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const errorMessage = error.message || 'Unknown error occurred';
    
    // User-friendly messages
    let userMessage = 'An error occurred. Please try again later.';
    
    if (error.code === 'ECONNABORTED') {
      userMessage = 'Request timeout. Please check your connection.';
    } else if (error.code === 'ERR_NETWORK') {
      userMessage = 'Network error. Please check your internet connection.';
    } else if (error.response) {
      switch (error.response.status) {
        case 400: userMessage = error.response.data?.message || 'Invalid request.'; break;
        case 401: 
          userMessage = 'Session expired. Please login again.';
          localStorage.removeItem('rudapaints_admin_token');
          localStorage.removeItem('rudapaints_admin');
          break;
        case 403: userMessage = 'You do not have permission.'; break;
        case 404: userMessage = 'Requested resource not found.'; break;
        case 500: userMessage = 'Server error. Please try again later.'; break;
        default: userMessage = error.response.data?.message || `Error ${error.response.status}`;
      }
    }
    
    // Console error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error:`, {
        message: errorMessage,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    return Promise.reject({
      status: error.response?.status || 0,
      message: userMessage,
      originalError: error
    });
  }
);

// ============================================
// 5. BACKEND CONNECTION TEST - FIXED
// ============================================
export const testBackendConnection = async () => {
  // Get the correct base URL dynamically
  const baseURL = getBaseURL();
  
  // The health endpoint is at /api/health (baseURL already ends with /api)
  const healthURL = `${baseURL}/health`;
  
  try {
    console.log(`🔗 Testing backend connection at: ${healthURL}`);
    const response = await fetch(healthURL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Backend connection successful:`, data);
      
      return {
        connected: true,
        database: data.database?.status || 'connected',
        uptime: data.uptime,
        message: 'Backend is operational.',
        url: baseURL
      };
    } else {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Backend connection test failed:', error.message);
    
    return {
      connected: false,
      database: 'unknown',
      message: `Cannot connect to backend: ${error.message}`,
      url: baseURL
    };
  }
};

// ============================================
// 6. API ENDPOINT GROUPS
// ============================================

// Products API
export const productsAPI = {
  getAll: (params = {}) => API.get('/paints', { params }),
  getById: (id) => API.get(`/paints/${id}`),
  create: (paintData) => {
    const formData = new FormData();
    Object.keys(paintData).forEach(key => {
      if (paintData[key] != null) formData.append(key, paintData[key]);
    });
    return API.post('/paints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, paintData) => {
    const formData = new FormData();
    Object.keys(paintData).forEach(key => {
      if (paintData[key] != null) formData.append(key, paintData[key]);
    });
    return API.put(`/paints/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => API.delete(`/paints/${id}`),
  search: (term) => API.get('/paints', { params: { search: term } }),
  getStats: () => API.get('/paints/stats')
};

// Price List API
export const priceListAPI = {
  get: (params = {}) => API.get('/price-list', { params }),
  download: (format = 'csv') => API.get(`/price-list/download?format=${format}`, {
    responseType: 'blob'
  }),
  getStats: () => API.get('/price-list/stats')
};

// Contact API
export const contactAPI = {
  sendMessage: (data) => API.post('/contact', data),
  getAll: (params = {}) => API.get('/contact', { params }),
  getById: (id) => API.get(`/contact/${id}`),
  updateStatus: (id, status) => API.put(`/contact/${id}/status`, { status }),
  respond: (id, response) => API.put(`/contact/${id}/respond`, { response }),
  getStats: () => API.get('/contact/stats/summary'),
  delete: (id) => API.delete(`/contact/${id}`)
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (data) => API.post('/newsletter/subscribe', data),
  unsubscribe: (data) => API.post('/newsletter/unsubscribe', data),
  check: (email) => API.get(`/newsletter/check/${encodeURIComponent(email)}`),
  getSubscribers: (params = {}) => API.get('/newsletter/subscribers', { params }),
  getStats: () => API.get('/newsletter/stats')
};

// Admin API
export const adminAPI = {
  login: (credentials) => API.post('/admin/login', credentials),
  create: (adminData) => API.post('/admin/create', adminData),
  getDashboard: () => API.get('/admin/dashboard'),
  getProfile: () => API.get('/admin/profile'),
  updateProfile: (data) => API.put('/admin/profile', data),
  changePassword: (data) => API.put('/admin/change-password', data),
  checkAuth: () => {
    const token = localStorage.getItem('rudapaints_admin_token');
    const admin = localStorage.getItem('rudapaints_admin');
    return !!(token && admin);
  },
  getToken: () => localStorage.getItem('rudapaints_admin_token'),
  storeAuthData: (token, adminData) => {
    localStorage.setItem('rudapaints_admin_token', token);
    localStorage.setItem('rudapaints_admin', JSON.stringify(adminData));
  },
  clearAuthData: () => {
    localStorage.removeItem('rudapaints_admin_token');
    localStorage.removeItem('rudapaints_admin');
  },
  logout: () => {
    adminAPI.clearAuthData();
    return Promise.resolve({ success: true, message: 'Logged out' });
  }
};

// ============================================
// 7. UTILITY FUNCTIONS (UPDATED)
// ============================================
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Determine base URL for images
  let baseURL;
  if (process.env.NODE_ENV === 'production') {
    // In production, images are served from your API domain
    baseURL = 'https://api.rudapaints.com'; // UPDATED: Use API domain, not frontend
  } else {
    baseURL = 'http://localhost:5000'; // Backend in development
  }
  
  // Ensure imagePath starts with /
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseURL}${cleanPath}`;
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default API;