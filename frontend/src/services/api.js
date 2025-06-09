import axios from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o token expirou, tentar renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data.tokens;
          localStorage.setItem('accessToken', accessToken);

          // Repetir a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se não conseguir renovar, fazer logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Serviços de empresas
export const companyService = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
  updateStatus: (id, status) => api.patch(`/companies/${id}/status`, { status }),
  getStats: (id) => api.get(`/companies/${id}/stats`),
};

// Serviços de usuários
export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateStatus: (id, status) => api.patch(`/users/${id}/toggle-status`, { status }),
  getByCompany: (company_id, params) =>
    api.get('/users', { params: { company_id, ...params } }),
};

// Serviços de veículos
export const vehicleService = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  updateStatus: (id, status) => api.patch(`/vehicles/${id}/status`, { status }),
  getAvailable: (params) => api.get('/vehicles/available', { params }),
  getStats: (params) => api.get('/vehicles/stats', { params }),
};

// Serviços de motoristas
export const driverService = {
  getAll: (params) => api.get('/drivers', { params }),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
  updateStatus: (id, status) => api.patch(`/drivers/${id}/status`, { status }),
  getActive: (params) => api.get('/drivers/active', { params }),
  getExpiringLicenses: (params) => api.get('/drivers/expiring-licenses', { params }),
};

// Serviços de clientes
export const customerService = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  updateStatus: (id, status) => api.patch(`/customers/${id}/status`, { status }),
  getActive: (params) => api.get('/customers/active', { params }),
  getRecent: (params) => api.get('/customers/recent', { params }),
  getTop: (params) => api.get('/customers/top', { params }),
  getStats: (params) => api.get('/customers/stats', { params }),
};

// Serviços de vendedores
export const sellerService = {
  getAll: (params) => api.get('/sellers', { params }),
  getById: (id) => api.get(`/sellers/${id}`),
  create: (data) => api.post('/sellers', data),
  update: (id, data) => api.put(`/sellers/${id}`, data),
  delete: (id) => api.delete(`/sellers/${id}`),
};

// Serviços de passeios
export const tripService = {
  getAll: (params) => api.get('/trips', { params }),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  updateStatus: (id, data) => api.patch(`/trips/${id}/status`, data),
};

// Serviços de reservas
export const bookingService = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  confirmPayment: (id, data) => api.patch(`/bookings/${id}/payment`, data),
  getPending: (params) => api.get('/bookings/pending', { params }),
  getRevenue: (params) => api.get('/bookings/revenue', { params }),
};

export default api;

