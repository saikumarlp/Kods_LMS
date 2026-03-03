import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Allow AuthContext to register its logout function so React state is cleared on 401
let logoutCallback = null;
export const setLogoutCallback = (fn) => { logoutCallback = fn; };

// Request interceptor — attach Bearer token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — on 401, clear session and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (logoutCallback) logoutCallback();          // clear React state
            window.location.href = '/login';               // redirect to login
        }
        return Promise.reject(error);
    }
);

export default api;
