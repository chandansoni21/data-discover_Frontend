
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000'; // Default to localhost if not set

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 Unauthorized (session expired)
apiClient.interceptors.response.use(
    (response) => {
        // If response is successful, just return it
        return response;
    },
    (error) => {
        // Check if error response is 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Clear session storage
            sessionStorage.clear();
            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API Endpoints Organization
export const API = {
    auth: {
        login: (credentials) => apiClient.post('/api/auth/login', credentials),
        register: (userData) => apiClient.post('/api/auth/register', userData),
        forgotPassword: (email) => apiClient.post('/api/auth/forgot-password', { email }),
        verifyOtp: (data) => apiClient.post('/api/auth/verify-otp', data),
        resetPassword: (data) => apiClient.post('/api/auth/reset-password', data),
        logout: () => {
            // Optional: Call complete logout endpoint if exists, otherwise just client-side cleanup
            sessionStorage.clear();
        }
    },
    dashboard: {
        // defined based on user mention, waiting for specific routes
        getData: () => apiClient.get('/api/dashboard/data'),
    },
    chat: {
        // defined based on user mention, waiting for specific routes
        sendMessage: (message) => apiClient.post('/api/chat/message', message),
        getHistory: (dbName) => apiClient.get(`/api/chat/chat-history?db_name=${dbName}`),
        sendQuery: (queryData) => apiClient.post('/api/chat/query', queryData),
        getDbFiles: (dbName) => apiClient.get(`/api/chat/db/files?db_name=${dbName}`),
    },
    catalog: {
        // Fetch catalog list
        getCatalogs: () => apiClient.get('/api/catalog/get_catalog'),
        deleteDatabase: (dbName) => apiClient.delete(`/api/catalog/delete_database?db_name=${dbName}`),
    },
    upload: {
        createDatabase: (formData) => apiClient.post('/api/upload/database/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    },
    // Add other modules as needed
};

export default apiClient;
