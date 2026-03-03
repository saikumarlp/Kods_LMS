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
// BUT skip auth endpoints so login/register errors bubble up to the form
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

        if (error.response?.status === 401 && !isAuthRoute) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (logoutCallback) logoutCallback();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
