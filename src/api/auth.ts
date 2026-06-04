import { api, refreshApi } from "@/api/client";

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