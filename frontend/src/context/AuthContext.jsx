import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Load user from local storage initially (or validate token against backend in a real app)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });

        // Save token and user details
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        }));

        setToken(data.accessToken);
        setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        });

        return data;
    };

    const register = async (name, email, password, role) => {
        const { data } = await api.post('/auth/register', { name, email, password, role });

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        }));

        setToken(data.accessToken);
        setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role
        });

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
