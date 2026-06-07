export interface BlockedUser {
  userId: number;
  nickname: string;
  userCode: string;
  profileImageUrl: string | null;
  blockedAt: string;
}