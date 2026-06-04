import axios from "axios";
import { getToken, clearToken } from "./auth";

// 일반 API 요청용
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  withCredentials: true,
  headers: { accept: "*/*" },
});

// 요청마다 accessToken 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 → 토큰 만료/무효 → 로그인으로
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);

// 토큰 재발급 전용 (인터셉터 없음)
export const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  withCredentials: true,
});

export default api;