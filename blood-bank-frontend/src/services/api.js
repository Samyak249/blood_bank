import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Service
export const authService = {
  login: async (name, password) => {
    const response = await api.post('/admins/login', { name, password });
    return response.data;
  },
  
  register: async (adminData) => {
    const response = await api.post('/admins', adminData);
    return response.data;
  },
};

// Donor Service
export const donorService = {
  getAll: async () => {
    const response = await api.get('/donors');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/donors/${id}`);
    return response.data;
  },
  
  create: async (donorData) => {
    const response = await api.post('/donors', donorData);
    return response.data;
  },
};

// Blood Service
export const bloodService = {
  getAll: async () => {
    const response = await api.get('/blood');
    return response.data;
  },
  
  create: async (bloodData) => {
    const response = await api.post('/blood', bloodData);
    return response.data;
  },
};

// Drive Service
export const driveService = {
  getAll: async () => {
    const response = await api.get('/drives');
    return response.data;
  },
  
  create: async (driveData) => {
    const response = await api.post('/drives', driveData);
    return response.data;
  },
};

// Admin Service
export const adminService = {
  getAll: async () => {
    const response = await api.get('/admins');
    return response.data;
  },
  
  create: async (adminData) => {
    const response = await api.post('/admins', adminData);
    return response.data;
  },
};

export default api;