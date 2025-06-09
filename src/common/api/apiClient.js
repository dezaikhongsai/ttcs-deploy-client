import axios from 'axios';
import Cookies from 'js-cookie';
import { store } from '../redux/store';
import { logoutSuccess } from '../redux/authSlice';

// Tạo instance của axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Biến để theo dõi trạng thái refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    console.log('Token:', token); // Log token để kiểm tra
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang trong quá trình refresh token, thêm request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Lưu access token mới vào cookie
        Cookies.set('token', data.accessToken);

        // Gắn access token mới vào header
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // Xử lý các request đang chờ
        processQueue(null, data.accessToken);

        // Gửi lại request gốc
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại, logout
        processQueue(refreshError, null);
        Cookies.remove('token');
        store.dispatch(logoutSuccess());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden - Permission denied
    if (error.response?.status === 403) {
      console.error('Permission denied');
      window.location.href = '/dashboard';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;