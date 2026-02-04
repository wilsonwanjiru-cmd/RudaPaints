import axios from 'axios';

// Create axios instance with base URL - FIXED VERSION
// Ensure we have the correct API URL structure
const getBaseURL = () => {
  // If environment variable is set, use it
  const envURL = process.env.REACT_APP_API_URL;
  
  if (envURL) {
    // If it already ends with /api, use as is
    if (envURL.endsWith('/api')) {
      return envURL;
    }
    // If it ends with slash, add api
    if (envURL.endsWith('/')) {
      return envURL + 'api';
    }
    // Otherwise add /api
    return envURL + '/api';
  }
  
  // Default production URL with /api
  return 'https://ruda-paints-backend.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rudapaints_admin_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug log - always show in production to help troubleshooting
    console.log(`📨 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorMessage = error.message || 'Unknown error occurred';
    const errorCode = error.code || 'UNKNOWN';
    const fullURL = error.config?.baseURL + error.config?.url;
    
    console.error(`❌ API Error [${errorCode}]: ${errorMessage} at ${fullURL}`);
    
    if (error.response) {
      console.error(`📊 Server Response: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    
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
          if (localStorage.getItem('rudapaints_admin_token')) {
            localStorage.removeItem('rudapaints_admin_token');
            localStorage.removeItem('rudapaints_admin');
          }
          break;
        case 403:
          userMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          userMessage = 'The requested resource was not found. Please check the URL.';
          break;
        case 500:
          userMessage = 'Server error. Our team has been notified. Please try again later.';
          break;
        default:
          userMessage = error.response.data?.message || `Error ${error.response.status}`;
      }
    }
    
    return Promise.reject({
      status: error.response?.status || 0,
      message: userMessage,
      type: errorType,
      originalError: error,
      url: fullURL,
      data: error.response?.data
    });
  }
);

// Test backend connection - FIXED
export const testBackendConnection = async () => {
  const backendURL = process.env.REACT_APP_API_URL || 'https://ruda-paints-backend.onrender.com';
  
  try {
    console.log(`🔗 Testing backend connection to: ${backendURL}/api/health`);
    
    // Try the health endpoint
    const response = await fetch(`${backendURL}/api/health`, {
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
      
      return {
        connected: true,
        database: data.database?.status || 'unknown',
        uptime: data.uptime?.seconds || 0,
        url: backendURL,
        data: data
      };
    } else {
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

// Products API - UPDATED to use correct endpoints
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
  
  const cleanImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseURL}${cleanImagePath}`;
};

// Export API instance for direct use
export default API;