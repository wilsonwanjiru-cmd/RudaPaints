import axios from 'axios';

// Create axios instance with base URL - UPDATED FOR PRODUCTION
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://ruda-paints-backend.onrender.com/api',
  timeout: 15000, // Increased timeout for production
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Keep withCredentials for authentication if needed
  withCredentials: false, // Set to false for cross-domain requests
});

// Request interceptor - SIMPLIFIED FOR PRODUCTION
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('rudapaints_admin_token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`📨 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - PRODUCTION READY
API.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Production-friendly error logging
    const errorMessage = error.message || 'Unknown error occurred';
    const errorCode = error.code || 'UNKNOWN';
    const requestUrl = error.config?.url || 'Unknown URL';
    
    console.error(`❌ API Error [${errorCode}]: ${errorMessage} at ${requestUrl}`);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(`📊 Server Response: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('🌐 No response received from server');
    }
    
    // User-friendly error messages for production
    let userMessage = 'An error occurred. Please try again later.';
    let errorType = 'unknown';
    
    if (error.code === 'ECONNABORTED') {
      userMessage = 'The request took too long. Please check your connection and try again.';
      errorType = 'timeout';
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      userMessage = 'Unable to connect to the server. Please check your internet connection.';
      errorType = 'network';
    } else if (error.response) {
      errorType = 'server';
      switch (error.response.status) {
        case 400:
          userMessage = error.response.data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          userMessage = 'Please login again to continue.';
          // Clear auth data if token is invalid
          if (localStorage.getItem('rudapaints_admin_token')) {
            localStorage.removeItem('rudapaints_admin_token');
            localStorage.removeItem('rudapaints_admin');
          }
          break;
        case 403:
          userMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          userMessage = 'The requested resource was not found.';
          break;
        case 500:
          userMessage = 'Server error. Our team has been notified. Please try again later.';
          break;
        default:
          userMessage = error.response.data?.message || `Error ${error.response.status}`;
      }
    }
    
    // Return formatted error
    return Promise.reject({
      status: error.response?.status || 0,
      message: userMessage,
      type: errorType,
      originalError: error,
      url: requestUrl,
      data: error.response?.data
    });
  }
);

// Test backend connection - UPDATED FOR PRODUCTION
export const testBackendConnection = async () => {
  const backendURL = process.env.REACT_APP_API_URL || 'https://ruda-paints-backend.onrender.com/api';
  
  try {
    console.log(`🔗 Testing backend connection to: ${backendURL}/health`);
    
    // Try the health endpoint first
    const response = await fetch(`${backendURL}/health`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Backend connected successfully!`);
      console.log(`📊 Status: ${data.status}`);
      console.log(`🗄️ Database: ${data.database?.status || 'Unknown'}`);
      
      return {
        connected: true,
        database: data.database?.status || 'unknown',
        uptime: data.uptime?.seconds || 0,
        url: backendURL,
        data: data
      };
    } else {
      // Try the test endpoint as fallback
      console.log(`⚠️  Health endpoint failed, trying test endpoint...`);
      
      const testResponse = await fetch(`${backendURL}/test`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      });
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log(`✅ Backend test endpoint is working`);
        
        return {
          connected: true,
          database: 'test_success',
          uptime: 0,
          url: backendURL,
          data: testData
        };
      }
      
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Backend connection test failed:', error.message);
    
    return {
      connected: false,
      database: 'disconnected',
      message: `Cannot connect to backend: ${error.message}`,
      url: backendURL,
      suggestion: 'Please ensure the backend server is running and accessible.'
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
    const adminData = localStorage.getItem('rudapaints_admin');
    return !!(token && adminData);
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
  
  // For production, use your Render backend URL
  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://ruda-paints-backend.onrender.com'
    : 'http://localhost:5000';
  
  // Remove '/api' if present in baseURL
  const cleanBaseURL = baseURL.replace('/api', '');
  const cleanImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${cleanBaseURL}${cleanImagePath}`;
};

// Export API instance for direct use
export default API;