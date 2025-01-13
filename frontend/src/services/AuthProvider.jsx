import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

export const AuthContext = createContext(undefined);

// Used for managing loggind, registers, tokens
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const getUserData = async (access) => {
        try {
            const response = await api.get('/auth/users/me');
            console.log(response.data);
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            setUser(null);
        }
    };

    const login = (accessToken, refreshToken) => {
        localStorage.setItem('access', accessToken);
        localStorage.setItem('refresh', refreshToken);
        getUserData(accessToken);
    }

    const logout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
    }

    useEffect(() => {
        const accessToken = localStorage.getItem('access');
        const refreshToken = localStorage.getItem('refresh');

        if (accessToken && refreshToken) {
            getUserData();
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
