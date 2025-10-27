import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Check if admin bypass is enabled
    const adminBypass = sessionStorage.getItem('adminBypass');
    
    if (adminBypass === 'true') {
      // For admin, we need to use a special token or create an admin user in backend
      // For now, we'll use the regular token if available
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect admin on 401
    const adminBypass = sessionStorage.getItem('adminBypass');
    
    if (error.response?.status === 401 && adminBypass !== 'true') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateDetails: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  updateMedicalHistory: (data) => api.put('/auth/medical-history', data),
  addEmergencyContact: (data) => api.post('/auth/emergency-contact', data),
  removeEmergencyContact: (contactId) => api.delete(`/auth/emergency-contact/${contactId}`),
};

// Emergency APIs
export const emergencyAPI = {
  createEmergency: (data) => api.post('/emergency/create', data),
  createPrivateBooking: (data) => api.post('/emergency/private-booking', data),
  getRequest: (id) => api.get(`/emergency/${id}`),
  getMyRequests: (params) => api.get('/emergency/my-requests', { params }),
  getAllRequests: (params) => api.get('/emergency/all', { params }),
  assignAmbulance: (id, data) => api.put(`/emergency/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/emergency/${id}/status`, data),
  selectHospital: (id, data) => api.put(`/emergency/${id}/select-hospital`, data),
  cancelRequest: (id, data) => api.put(`/emergency/${id}/cancel`, data),
  rateService: (id, data) => api.put(`/emergency/${id}/rate`, data),
  getStats: () => api.get('/emergency/stats'),
};

// Ambulance APIs
export const ambulanceAPI = {
  register: (data) => api.post('/ambulance/register', data),
  getAmbulance: (id) => api.get(`/ambulance/${id}`),
  getAllAmbulances: (params) => api.get('/ambulance', { params }),
  getNearbyAmbulances: (params) => api.get('/ambulance/nearby', { params }),
  getAmbulancesInArea: (data) => api.post('/ambulance/in-area', data),
  updateAmbulance: (id, data) => api.put(`/ambulance/${id}`, data),
  updateLocation: (id, data) => api.put(`/ambulance/${id}/location`, data),
  updateStatus: (id, data) => api.put(`/ambulance/${id}/status`, data),
  getMyAmbulance: () => api.get('/ambulance/driver/my-ambulance'),
  getActiveRequests: () => api.get('/ambulance/driver/active-requests'),
  getRequestHistory: (params) => api.get('/ambulance/driver/request-history', { params }),
  getStats: (id) => api.get(`/ambulance/${id}/stats`),
  verifyAmbulance: (id) => api.put(`/ambulance/${id}/verify`),
  deleteAmbulance: (id) => api.delete(`/ambulance/${id}`),
};

// Hospital APIs
export const hospitalAPI = {
  register: (data) => api.post('/hospital/register', data),
  getHospital: (id) => api.get(`/hospital/${id}`),
  getAllHospitals: (params) => api.get('/hospital', { params }),
  getNearbyHospitals: (params) => api.get('/hospital/nearby', { params }),
  getSuggestions: (data) => api.post('/hospital/suggest', data),
  updateHospital: (id, data) => api.put(`/hospital/${id}`, data),
  updateAvailability: (id, data) => api.put(`/hospital/${id}/availability`, data),
  getStats: (id) => api.get(`/hospital/${id}/stats`),
  verifyHospital: (id) => api.put(`/hospital/${id}/verify`),
  deleteHospital: (id) => api.delete(`/hospital/${id}`),
  getMyHospital: () => api.get('/hospital/admin/my-hospital'),
};

// User APIs
export const userAPI = {
  getAllUsers: (params) => api.get('/user', { params }),
  getUser: (id) => api.get(`/user/${id}`),
  updateRole: (id, data) => api.put(`/user/${id}/role`, data),
  updateStatus: (id, data) => api.put(`/user/${id}/status`, data),
  deleteUser: (id) => api.delete(`/user/${id}`),
};

export default api;