import { api as client } from "../api/client";

export type NotifType =
  | "comment"
  | "reply"
  | "emoji"
  | "ocr"
  | "friend_request"
  | "friend_accepted"
  | "poke";   

export interface NotificationUser {
  userId: string;
  nickname: string;
  roomColor: string | null;
}

export interface NotificationBook {
  isbn: string;
  title: string;
  roomId: string;
  page: number | null; 
}

export interface NotificationItem {
  notificationId: string;
  type: NotifType;
  isRead: boolean;
  createdAt: string;
  user: NotificationUser;
  book: NotificationBook | null;
  preview: string | null;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: {
    newNotifications: NotificationItem[];
    oldNotifications: NotificationItem[];
  };
}

export async function fetchNotifications(): Promise<GetNotificationsResponse> {
  const res = await client.get("/api/notifications");
  return res.data;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await client.patch(`/api/notifications/${notificationId}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await client.patch("/api/notifications/read-all");
}