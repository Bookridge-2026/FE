import { api } from "@/api/client";
import type { MyBooksResponse } from '@/types/book';
import type { UserProfile } from '@/types/user';
import type { WaitingRoomsResponse, OngoingRoomsResponse } from '@/types/myrooms'

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getMyBooks = () =>
  api.get<ApiResponse<MyBooksResponse>>('/api/rooms/my/books');

export const getMyProfile = () =>
  api.get<ApiResponse<UserProfile>>('/api/users/me');

export const getMyRooms = (state: "waiting" | "ongoing" | "closed") =>
  api.get<ApiResponse<WaitingRoomsResponse>>(`/api/rooms/my?state=${state}`);

export const getOngoingRooms = () =>
  api.get<ApiResponse<OngoingRoomsResponse>>(`/api/rooms/my?state=ongoing`);

export const getClosedRooms = () =>
  api.get<ApiResponse<OngoingRoomsResponse>>(`/api/rooms/my?state=closed`);

export const acceptMember = (roomId: number, userId: number) =>
  api.patch(`/api/rooms/${roomId}/users/${userId}/accept`);

export const rejectMember = (roomId: number, userId: number) =>
  api.patch(`/api/rooms/${roomId}/users/${userId}/reject`);

export const acceptInvite = (roomId: number) =>
  api.patch(`/api/rooms/${roomId}/invite/accept`);

export const rejectInvite = (roomId: number) =>
  api.patch(`/api/rooms/${roomId}/invite/reject`);

export const startRoom = (roomId: number) =>
  api.patch(`/api/rooms/${roomId}/start`);