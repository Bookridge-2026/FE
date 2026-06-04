import { api } from "@/api/client";
import type { FriendItem, FriendRequestItem, SearchedUser, UserProfile } from "@/types/friend.ts";

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

export const getReceivedFriendRequests = async () => {
  const response = await api.get<
    ApiResponse<{ requests: FriendRequestItem[] }>
  >("/api/friends/requests");

  return response.data.data.requests;
};

export const acceptFriendRequest = async (friendRequestId: number) => {
  const response = await api.patch<ApiResponse<unknown>>(
    `/api/friends/requests/${friendRequestId}/accept`
  );

  return response.data;
};

export const rejectFriendRequest = async (friendRequestId: number) => {
  const response = await api.patch<ApiResponse<unknown>>(
    `/api/friends/requests/${friendRequestId}/reject`
  );

  return response.data;
};

export const getFriends = async () => {
  const response = await api.get<ApiResponse<{ friends: FriendItem[] }>>(
    "/api/friends"
  );

  return response.data.data.friends;
};

export const deleteFriend = async (userId: number) => {
  const response = await api.delete<ApiResponse<unknown>>(
    `/api/friends/users/${userId}`
  );

  return response.data;
};

export const blockUser = async (userId: number) => {
  const response = await api.post<ApiResponse<unknown>>(
    `/api/blocks/${userId}`
  );

  return response.data;
};

export const getUserProfile = async (userId: number) => {
  const response = await api.get<ApiResponse<UserProfile>>(
    `/api/users/${userId}/profile`
  );

  return response.data.data;
};