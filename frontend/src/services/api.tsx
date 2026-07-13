import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
class ApiClient {
    constructor() {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/auth/login';
            }
            return Promise.reject(error);
        });
    }
    async request(config) {
        try {
            const response = await this.client(config);
            return response.data;
        }
        catch (error) {
            throw error.response?.data || error;
        }
    }
    async get(url, config) {
        return this.request({ ...config, method: 'GET', url });
    }
    async post(url, data, config) {
        return this.request({ ...config, method: 'POST', url, data });
    }
    async put(url, data, config) {
        return this.request({ ...config, method: 'PUT', url, data });
    }
    async delete(url, config) {
        return this.request({ ...config, method: 'DELETE', url });
    }
}
export const apiClient = new ApiClient();
export const authApi = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    verifyEmail: (data) => apiClient.post('/auth/verify-email', data),
    logout: () => apiClient.post('/auth/logout'),
};
