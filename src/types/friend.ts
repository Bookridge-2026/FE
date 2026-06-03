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

export interface FriendUser {
  userId: number;
  nickname: string;
  userCode: string;
  profileImageUrl: string | null;
}

export interface FriendRequestItem {
  friendRequestId: number;
  sender: FriendUser;
  createdAt: string;
}

export interface FriendItem {
  friendId: number;
  userId: number;
  nickname: string;
  userCode: string;
  profileImageUrl: string | null;
  createdAt: string;
}