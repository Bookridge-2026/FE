import { api } from "@/api/client";
import type { UpdateNicknameData, UpdateProfileImageData } from "@/types/user";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const updateNickname = (nickname: string) =>
  api.patch<ApiResponse<UpdateNicknameData>>("/api/users/me/nickname", { nickname });

export const updateProfileImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.patch<ApiResponse<UpdateProfileImageData>>("/api/users/me/profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
