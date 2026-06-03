import { api } from "@/api/client";
import type { SearchedUser } from "@/types/friend.ts";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const searchUserByCode = async (userCode: string) => {
  const response = await api.get<ApiResponse<SearchedUser>>("/api/users/search", {
    params: { userCode },
  });

  return response.data.data;
};

export const sendFriendRequest = async (receiverId: number) => {
  const response = await api.post<ApiResponse<unknown>>(
    `/api/friends/requests`,
    { receiverId }
  );

  return response.data;
};