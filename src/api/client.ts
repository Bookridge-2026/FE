// 로그인 연동 전까지 axios 인스턴스 통합하여 사용하면 됨

import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  withCredentials: true,
  headers: { accept: "*/*" },
});

// 일반 API 요청마다 accessToken 자동 첨부
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 토큰 재발급 전용: 기존 api 인터셉터를 타지 않음
export const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  withCredentials: true,
});
