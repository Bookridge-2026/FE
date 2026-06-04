import { api } from "@/api/client";
import type { MyBooksResponse } from '@/types/book';
import type { UserProfile } from '@/types/user';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getMyBooks = () =>
  api.get<ApiResponse<MyBooksResponse>>('/api/rooms/my/books');

export const getMyProfile = () =>
  api.get<ApiResponse<UserProfile>>('/api/users/me');