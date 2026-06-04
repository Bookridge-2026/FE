//import { api as client } from "../api/client";

export type NotifType =
  | "comment"
  | "reply"
  | "emoji"
  | "ocr"
  | "friend_request"
  | "friend_accepted";

export interface NotificationUser {
  userId: string;
  nickname: string;
  roomColor: string | null;
}

export interface NotificationBook {
  isbn: string;
  title: string;
  roomId: string;
  page: number;
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

const BASE = "/api/notifications";

export async function fetchNotifications(): Promise<GetNotificationsResponse> {
  const res = await fetch(BASE, { credentials: "include" });
  if (!res.ok) throw new Error(`알림 조회 실패: ${res.status}`);
  return res.json();
}

export async function markAsRead(notificationId: string): Promise<void> {
  const res = await fetch(`${BASE}/${notificationId}/read`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`읽음 처리 실패: ${res.status}`);
}

export async function markAllAsRead(): Promise<void> {
  const res = await fetch(`${BASE}/read-all`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`전체 읽음 처리 실패: ${res.status}`);
}