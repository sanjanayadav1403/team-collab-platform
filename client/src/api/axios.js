import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

//Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//Request Interceptor
api.interceptors.request.use((config) => {
        const accessToken = localStorage.getItem('accessToken');
        if(accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//Response Interceptor

let isRefreshing = false;
// Queue of failed requests waiting for token refresh
let failedQueue = [];
 
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
 
    // If 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is already in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
 
      originalRequest._retry = true;
      isRefreshing = true;
 
      const refreshToken = localStorage.getItem('refreshToken');
 
      if (!refreshToken) {
        // No refresh token — force logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
 
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
 
        const newAccessToken = response.data.data.accessToken;
 
        // Save new token
        localStorage.setItem('accessToken', newAccessToken);
 
        // Update default header
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
 
        // Process queued requests
        processQueue(null, newAccessToken);
 
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
 
    return Promise.reject(error);
  }
);
 
export default api;