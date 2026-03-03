import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Use full backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration/401s
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // We could handle refresh token logic here if we wanted auto-refresh
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login if unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login'; // Optional: Redirect to login
        }
        return Promise.reject(error);
    }
);

export default api;
