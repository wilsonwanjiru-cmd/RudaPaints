import axios from 'axios';

// Create axios instance with base URL - SIMPLIFIED VERSION
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 seconds timeout (reduced for faster feedback)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Temporarily disable withCredentials to avoid CORS issues
  // withCredentials: true,
});

// Request interceptor - SIMPLIFIED
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('rudapaints_admin_token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📨 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - IMPROVED ERROR HANDLING
API.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.group('❌ API Error Details');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('URL:', error.config?.baseURL + error.config?.url);
    console.error('Method:', error.config?.method);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request made but no response received');
      console.error('Request:', error.request);
    }
    console.groupEnd();
    
    // User-friendly error messages
    let userMessage = 'An unexpected error occurred';
    let errorType = 'unknown';
    
    if (error.code === 'ECONNABORTED') {
      userMessage = 'Request timeout. The server is taking too long to respond.';
      errorType = 'timeout';
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      userMessage = 'Network error. Please check:';
      userMessage += '\n1. Is the backend server running? (npm start in backend folder)';
      userMessage += '\n2. Check browser console for CORS errors';
      userMessage += '\n3. Try visiting: http://localhost:5000/api/health';
      errorType = 'network';
    } else if (error.response) {
      // Server responded with error status
      errorType = 'server';
      switch (error.response.status) {
        case 400:
          userMessage = error.response.data?.message || 'Bad request. Please check your input.';
          break;
        case 401:
          userMessage = 'Unauthorized. Please login again.';
          break;
        case 403:
          userMessage = 'Access forbidden. You may need admin privileges.';
          break;
        case 404:
          userMessage = 'Resource not found. The endpoint may not exist.';
          break;
        case 500:
          userMessage = 'Server error. Please try again later.';
          break;
        default:
          userMessage = error.response.data?.message || `Error ${error.response.status}`;
      }
    } else if (error.request) {
      // No response received
      userMessage = 'No response from server. The backend might be down.';
      errorType = 'no_response';
    }
    
    // Return formatted error
    return Promise.reject({
      status: error.response?.status || 0,
      message: userMessage,
      type: errorType,
      originalError: error,
      url: error.config?.url,
      data: error.response?.data
    });
  }
);

// Test backend connection directly (bypassing axios instance for better debugging)
export const testBackendConnection = async () => {
  console.log('🔗 Testing backend connection...');
  const backendURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  try {
    // Test multiple endpoints
    const endpoints = [
      '/health',
      '/test',
      '/'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`🔄 Testing: ${backendURL}${endpoint}`);
      try {
        const response = await fetch(`${backendURL}${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint} is accessible`);
          return {
            connected: true,
            endpoint,
            data,
            url: backendURL
          };
        }
      } catch (err) {
        console.log(`⚠️  ${endpoint} failed: ${err.message}`);
      }
    }
    
    // If all endpoints fail, try direct fetch without /api
    const baseURL = backendURL.replace('/api', '');
    console.log(`🔄 Testing base URL: ${baseURL}/api/health`);
    
    try {
      const response = await fetch(`${baseURL}/api/health`, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          connected: true,
          endpoint: '/health',
          data,
          url: baseURL
        };
      }
    } catch (err) {
      console.log(`⚠️  Base URL also failed: ${err.message}`);
    }
    
    return {
      connected: false,
      error: 'All connection attempts failed',
      url: backendURL,
      suggestion: 'Please check if backend server is running on port 5000'
    };
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return {
      connected: false,
      error: error.message,
      url: backendURL,
      suggestion: 'Make sure backend is running: npm start in backend folder'
    };
  }
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => API.get('/paints', { params }),
  
  getById: (id) => API.get(`/paints/${id}`),
  
  create: (paintData) => {
    const formData = new FormData();
    Object.keys(paintData).forEach(key => {
      if (paintData[key] !== undefined && paintData[key] !== null) {
        formData.append(key, paintData[key]);
      }
    });
    return API.post('/paints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  update: (id, paintData) => {
    const formData = new FormData();
    Object.keys(paintData).forEach(key => {
      if (paintData[key] !== undefined && paintData[key] !== null) {
        formData.append(key, paintData[key]);
      }
    });
    return API.put(`/paints/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  delete: (id) => API.delete(`/paints/${id}`),
  
  search: (searchTerm) => API.get('/paints', { params: { search: searchTerm } }),
  
  getStats: () => API.get('/paints/stats'),
};

// Price List API
export const priceListAPI = {
  get: (params = {}) => API.get('/price-list', { params }),
  
  download: (format = 'csv') => 
    API.get(`/price-list/download?format=${format}`, {
      responseType: 'blob'
    }),
  
  getStats: () => API.get('/price-list/stats'),
};

// Contact API
export const contactAPI = {
  sendMessage: (data) => API.post('/contact', data),
  
  getAll: (params = {}) => API.get('/contact', { params }),
  
  getById: (id) => API.get(`/contact/${id}`),
  
  updateStatus: (id, status) => API.put(`/contact/${id}/status`, { status }),
  
  respond: (id, response) => API.put(`/contact/${id}/respond`, { response }),
  
  getStats: () => API.get('/contact/stats/summary'),
  
  delete: (id) => API.delete(`/contact/${id}`),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (data) => API.post('/newsletter/subscribe', data),
  
  unsubscribe: (data) => API.post('/newsletter/unsubscribe', data),
  
  check: (email) => API.get(`/newsletter/check/${encodeURIComponent(email)}`),
  
  getSubscribers: (params = {}) => API.get('/newsletter/subscribers', { params }),
  
  getStats: () => API.get('/newsletter/stats'),
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
    return !!token;
  },
  
  getToken: () => localStorage.getItem('rudapaints_admin_token'),
  
  storeAuthData: (token, adminData) => {
    localStorage.setItem('rudapaints_admin_token', token);
    localStorage.setItem('rudapaints_admin', JSON.stringify(adminData));
    localStorage.setItem('admin_email', adminData.email);
  },
  
  clearAuthData: () => {
    localStorage.removeItem('rudapaints_admin_token');
    localStorage.removeItem('rudapaints_admin');
    localStorage.removeItem('admin_email');
  },
  
  logout: () => {
    adminAPI.clearAuthData();
    return Promise.resolve({ success: true, message: 'Logged out successfully' });
  },
};

// System API
export const systemAPI = {
  healthCheck: () => API.get('/health'),
  
  testConnection: () => API.get('/test'),
  
  getDocs: () => API.get('/docs'),
};

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
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

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, construct URL from base
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const cleanBaseURL = baseURL.replace('/api', '');
  const cleanImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${cleanBaseURL}${cleanImagePath}`;
};

// Export API instance for direct use
export default API;