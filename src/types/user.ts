export interface UserProfile {
  nickname: string;
  profileImageUrl: string;
}

export interface UserInfo {
  userId: number;
  googleId: string;
  email: string;
  nickname: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
  userCode: string;
}

export interface MyPageResponse {
  message: string;
  user: UserInfo;
}

export interface UpdateNicknameData {
  nickname: string;
}

export interface UpdateProfileImageData {
  profileImageUrl: string;
}