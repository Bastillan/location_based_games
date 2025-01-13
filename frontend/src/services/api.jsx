import axios from "axios";

// Used for user authentications in API requests
const api = axios.create({
  baseURL: "",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Session refresh
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
          throw new Error("Log in again");
        }

        // Request to API to refresh session
        const response = await axios.post(
          "/auth/jwt/refresh/",
          { refresh: refreshToken }
        );

        // Storaging access data in local storage
        localStorage.setItem("access", response.data.access);

        originalRequest.headers.Authorization = `JWT ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
