import React, { createContext, useState, useEffect } from 'react';
import api, { setLogoutCallback } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Load user from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, [token]);

    // Register logout with api.js interceptor so React state clears on global 401
    useEffect(() => {
        setLogoutCallback(() => {
            setToken(null);
            setUser(null);
        });
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });

        // Temporary debug — shows response shape in browser console
        console.log('Login Response:', data);

        // Backend returns accessToken; accept either field name for safety
        const jwt = data.accessToken || data.token;

        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        }));

        setToken(jwt);
        setUser({ id: data.id, name: data.name, email: data.email, role: data.role });

        return data;
    };

    const register = async (name, email, password, role) => {
        const { data } = await api.post('/auth/register', { name, email, password, role });

        const jwt = data.accessToken || data.token;

        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        }));

        setToken(jwt);
        setUser({ id: data.id, name: data.name, email: data.email, role: data.role });

        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
