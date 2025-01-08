import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const getUserData = async (access) => {
        try {
            const decoded = jwtDecode(access);
            console.log(decoded);
            const userId = decoded.user_id;
            console.log(userId);
            const response = await api.get('/api/users/');
            console.log(response.data);
            const response_user = response.data.filter((elem) => elem.user==userId);
            console.log(response_user);
            setUser(response_user[0]);
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
