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

// Variável para controlar se já está fazendo refresh
let isRefreshing = false;
let failedQueue = [];

// Função para processar fila de requisições
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

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

    // Se o token expirou ou é inválido (401)
    if (error.response?.status === 401 && 
        (error.response?.data?.code === 'TOKEN_EXPIRED' || 
         error.response?.data?.error?.includes('Token expirado') ||
         error.response?.data?.code === 'TOKEN_INVALID') &&
        !originalRequest._retry) {
      
      if (isRefreshing) {
        // Se já está fazendo refresh, adicionar à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        
        // Atualizar tokens no localStorage
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }


        // Processar fila de requisições pendentes
        processQueue(null, accessToken);

        // Repetir a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Verificar se o erro é por inatividade
        const isInactivityError = 
          refreshError.response?.data?.code === 'SESSION_INACTIVE' ||
          refreshError.response?.data?.error?.includes('inatividade');

        // Processar fila com erro
        processQueue(refreshError, null);
        
        // Limpar dados de autenticação
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Disparar evento customizado para logout com razão específica
        window.dispatchEvent(new CustomEvent('auth:logout', { 
          detail: { 
            reason: isInactivityError ? 'inactivity' : 'refresh_failed',
            message: isInactivityError ? 
              'Sua sessão expirou por inatividade' : 
              'Não foi possível renovar sua sessão'
          } 
        }));
        
        // Redirecionar para login se não estiver já lá
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Para outros erros 401 (token inválido, usuário inativo, etc.)
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      window.dispatchEvent(new CustomEvent('auth:logout', { 
        detail: { reason: 'unauthorized' } 
      }));
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Para erros 404 em requisições autenticadas (API indisponível)
    if (error.response?.status === 404 && localStorage.getItem('accessToken')) {
      // Tentar refresh token uma vez
      if (!originalRequest._retry404) {
        originalRequest._retry404 = true;
        
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Tentar renovar o token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          
          // Atualizar tokens no localStorage
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }



          // Repetir a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Se falhar, tratar como erro normal
        }
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
  updateStatus: (id) => api.patch(`/companies/${id}/toggle-status`),
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
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (id, data) => api.patch(`/users/${id}/change-password`, data),
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
  getStats: (params) => api.get('/drivers/stats', { params }),
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

// Serviços de passeios
export const tripService = {
  getAll: (params) => api.get('/trips', { params }),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => {
    const payload = { color: '#99CD85', ...data };
    return api.post('/trips', payload);
  },
  update: (id, data) => {
    const payload = { ...data };
    if (!payload.color) payload.color = '#99CD85';
    return api.put(`/trips/${id}`, payload);
  },
  delete: (id) => api.delete(`/trips/${id}`),
  updateStatus: (id, data) => api.patch(`/trips/${id}/status`, data),
};

// Serviços de vendas
export const saleService = {
  list: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  getCustomers: (saleId) => api.get(`/sales/${saleId}/customers`),
  addCustomer: (saleId, data) => api.post(`/sales/${saleId}/customers`, data),
  removeCustomer: (saleId, customerId) =>
    api.delete(`/sales/${saleId}/customers/${customerId}`),
  getPayments: (saleId) => api.get(`/sales/${saleId}/payments`),
  addPayment: (saleId, data) => api.post(`/sales/${saleId}/payments`, data),
  removePayment: (saleId, paymentId) =>
    api.delete(`/sales/${saleId}/payments/${paymentId}`),
  getStats: (params) => api.get('/sales/stats', { params }),
  downloadVoucher: (id) => api.get(`/sales/${id}/voucher`, { responseType: 'blob' }),
};

export const salePaymentService = {
  list: (saleId) => api.get(`/sales/${saleId}/payments`),
  add: (saleId, data) => api.post(`/sales/${saleId}/payments`, data),
  remove: (saleId, paymentId) => api.delete(`/sales/${saleId}/payments/${paymentId}`),
};

export const saleAccessoryService = {
  list: (saleId) => api.get(`/sales/${saleId}/accessories`),
  add: (saleId, data) => api.post(`/sales/${saleId}/accessories`, data),
  remove: (saleId, id) => api.delete(`/sales/${saleId}/accessories/${id}`),
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

// Serviços de acessórios
export const accessoryService = {
  getAll: (params) => api.get('/accessories', { params }),
  getById: (id) => api.get(`/accessories/${id}`),
  create: (data) => api.post('/accessories', data),
  update: (id, data) => api.put(`/accessories/${id}`, data),
  delete: (id) => api.delete(`/accessories/${id}`),
};

// Serviços de configurações gerais
export const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  create: (data) => api.post('/settings', data), 
  remove: (id) => api.delete(`/settings/${id}`), 
};

// Serviços de atividades
export const activityService = {
  getRecent: (params) => api.get('/activities/recent', { params }),
};
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

// Serviços de configurações gerais
export const settingService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Serviços de notificações
export const notificationService = {
  list: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  unreadCount: () => api.get('/notifications/unread-count'),
};

export default api;
