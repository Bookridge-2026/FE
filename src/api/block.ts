import { api } from "@/api/client";
import type { BlockedUser } from "@/types/block.ts";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getBlockedUsers = async () => {
  const response = await api.get<ApiResponse<{ blockedUsers: BlockedUser[] }>>(
    "/api/blocks"
  );

  return response.data.data.blockedUsers;
};

export const unblockUser = async (userId: number) => {
  const response = await api.delete<ApiResponse<unknown>>(
    `/api/blocks/${userId}`
  );

  return response.data;
};