import { api, refreshApi } from "@/api/client";
import type { MyPageResponse } from "@/types/user";

interface RegisterRequest {
  tempToken: string;
  nickname: string;
}

interface RegisterResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  success: boolean;
  accessToken: string;
}

export const registerOAuthUser = async (body: RegisterRequest) => {
  const response = await api.post<RegisterResponse>("/api/oauth2/register", body);
  return response.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await refreshApi.post<RefreshResponse>("/api/oauth2/refresh", {
    refreshToken,
  });

  return response.data.accessToken;
};

export const getMyPage = async () => {
  const { data } = await api.get<MyPageResponse>("/api/oauth2/mypage");
  return data;
};