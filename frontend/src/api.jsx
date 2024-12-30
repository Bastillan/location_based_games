import axios from 'axios';

const api = axios.create({
    baseURL: '/auth',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');

        if (token) {
            config.headers['Authorization'] = `JWT ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
