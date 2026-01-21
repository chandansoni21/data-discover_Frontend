
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000'; // Default to localhost if not set

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to generate UUIDs
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// ID Manager for Session and Trace IDs
export const IDManager = {
    // Session ID: Generated once per login/session, persists in sessionStorage
    getSessionId: () => {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = generateUUID();
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    },

    // Trace ID: Generated per component/page/context switch
    // Stored in memory as it changes frequently and is context-specific
    _currentTraceId: null,

    getTraceId: () => {
        if (!IDManager._currentTraceId) {
            IDManager._currentTraceId = generateUUID();
        }
        return IDManager._currentTraceId;
    },

    // Explicitly generate a new Trace ID (called on route/DB change)
    generateNewTraceId: () => {
        IDManager._currentTraceId = generateUUID();
        return IDManager._currentTraceId;
    },

    reset: () => {
        sessionStorage.removeItem('session_id');
        IDManager._currentTraceId = null;
    }
};

// Request interceptor to add token and IDs to headers
apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add Session ID (persists for entire session)
        config.headers['session-id'] = IDManager.getSessionId();

        // Generate a NEW unique Trace ID for EVERY request
        config.headers['trace-id'] = generateUUID();

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
        connectSql: (formData) => apiClient.post('/api/upload/database/connect-sql', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    },
    sql: {
        getTables: (db_name, visibility, file_type = 'sql') =>
            apiClient.get(`/api/sql/tables?db_name=${db_name}&visibility=${visibility}&file_type=${file_type}`),
        storeSelectTable: (db_name, table_name, visibility = 'local') =>
            apiClient.post(`/api/sql/store-select-table?db_name=${db_name}&table_name=${table_name}&visibility=${visibility}`),
        getSelectedTables: (db_name) =>
            apiClient.get(`/api/sql/selected-tables?db_name=${db_name}`),
        getTablePreview: (db_name, table_name, row_number = 5, visibility = 'local') =>
            apiClient.get(`/api/sql/table/preview?db_name=${db_name}&table_name=${table_name}&row_number=${row_number}&visibility=${visibility}`),
        removeSelectTable: (db_name, table_name) =>
            apiClient.delete(`/api/sql/remove-select-table?db_name=${db_name}&table_name=${table_name}`),
    }
};

export default apiClient;
