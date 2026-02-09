import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // If 401 and not already retried, try refreshing token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed - logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

// API Services
export const authService = {
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    getProfile: () => apiClient.get('/auth/profile')
};

export const vendorService = {
    getAll: (params?: any) => apiClient.get('/vendors', { params }),
    getById: (id: string) => apiClient.get(`/vendors/${id}`),
    create: (data: any) => apiClient.post('/vendors', data),
    update: (id: string, data: any) => apiClient.patch(`/vendors/${id}`, data),
    delete: (id: string) => apiClient.delete(`/vendors/${id}`),
    getInvoices: (id: string, params?: any) => apiClient.get(`/vendors/${id}/invoices`, { params }),

    // Vendor Services
    getServices: (vendorId: string) => apiClient.get(`/vendors/${vendorId}/services`),
    assignService: (vendorId: string, data: any) => apiClient.post(`/vendors/${vendorId}/services`, data),
    updateService: (vendorId: string, vendorServiceId: string, data: any) =>
        apiClient.patch(`/vendors/${vendorId}/services/${vendorServiceId}`, data),
    removeService: (vendorId: string, vendorServiceId: string) =>
        apiClient.delete(`/vendors/${vendorId}/services/${vendorServiceId}`)
};

export const serviceService = {
    getAll: (params?: any) => apiClient.get('/services', { params }),
    getById: (id: string) => apiClient.get(`/services/${id}`),
    create: (data: any) => apiClient.post('/services', data),
    update: (id: string, data: any) => apiClient.patch(`/services/${id}`, data),
    delete: (id: string) => apiClient.delete(`/services/${id}`),
    getCategories: () => apiClient.get('/services/categories')
};

export const invoiceService = {
    getAll: (params?: any) => apiClient.get('/invoices', { params }),
    getById: (id: string) => apiClient.get(`/invoices/${id}`),
    create: (data: any) => apiClient.post('/invoices', data),
    update: (id: string, data: any) => apiClient.patch(`/invoices/${id}`, data),
    delete: (id: string) => apiClient.delete(`/invoices/${id}`),
    generatePDF: (id: string, templateId?: string) => apiClient.post(`/invoices/${id}/pdf`, {}, { params: { templateId } }),
    downloadPDF: (id: string) => apiClient.get(`/invoices/${id}/pdf/download`, { responseType: 'blob' }),
    updateStatus: (id: string, status: string) => apiClient.patch(`/invoices/${id}/status`, { status }),
    duplicate: (id: string) => apiClient.post(`/invoices/${id}/duplicate`),
    sendEmail: (id: string, data: { templateId: string }) => apiClient.post(`/invoices/${id}/send`, data),
    getStats: () => apiClient.get('/invoices/stats')
};

export const aiService = {
    generate: (data: any) => apiClient.post('/ai/generate', data),
    getUsage: () => apiClient.get('/ai/usage')
};

export const userService = {
    getAll: (params?: any) => apiClient.get('/users', { params }),
    getById: (id: string) => apiClient.get(`/users/${id}`),
    create: (data: any) => apiClient.post('/users', data),
    update: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),
    deactivate: (id: string) => apiClient.delete(`/users/${id}`),
    changeRole: (id: string, role: string) => apiClient.patch(`/users/${id}/role`, { role }),
    changePassword: (id: string, data: any) => apiClient.patch(`/users/${id}/password`, data)
};

export const tenantService = {
    getCurrent: () => apiClient.get('/tenants/me'),
    updateBranding: (data: any) => apiClient.patch('/tenants/me/branding', data),
    updateSettings: (data: any) => apiClient.patch('/tenants/me/settings', data),
    updateProfile: (data: any) => apiClient.patch('/tenants/me/profile', data),
    getSubscription: () => apiClient.get('/tenants/me/subscription')
};

export const uploadService = {
    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};
