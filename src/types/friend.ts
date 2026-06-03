export type FriendStatus =
  | "NONE"
  | "FRIENDS"
  | "REQUEST_SENT"
  | "REQUEST_RECEIVED"
  | "BLOCKED"
  | "ME";

export interface SearchedUser {
  userId: number;
  nickname: string;
  userCode: string;
  profileImageUrl: string | null;
  friendStatus: FriendStatus;
  isBlocked: boolean;
}