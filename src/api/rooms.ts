import { api } from '@/api/client';
import type { JoinedRoom } from '@/types/room';

// 공통 fetch 래퍼
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const getToken = () => localStorage.getItem("accessToken");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "서버 오류가 발생했습니다.");
  return data;
}

// 타입 정의
export interface BookSummary {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  translator?: string;
  thumbnail: string;
  url: string;
  datetime: string;
  totalPage: number;
}

export interface BookSearchMeta {
  totalCount: number;
  pageableCount: number;
  isEnd: boolean;
  currentPage: number;
}

export interface BookSearchResult {
  books: BookSummary[];
  meta: BookSearchMeta;
}

export interface RoomSummary {
  roomId: number;
  state: "waiting" | "ongoing" | "closed" | "expired";
  period: number;
  atLeastPeople: number;
  poke: number;
  detail: string | null;
  startDate: string;
  currentMembers: number;
  book: BookSummary;
}

export interface RoomListMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface RoomListResult {
  rooms: RoomSummary[];
  meta: RoomListMeta;
}

export interface CreateRoomPayload {
  isbn: string;
  period: number;
  atLeastPeople: number;
  poke?: number;
  detail?: string;
  totalPage?: number;
}

export interface CreateRoomResult {
  roomId: number;
  state: string;
  period: number;
  atLeastPeople: number;
  poke: number;
  detail: string | null;
  member: { memberId: number; role: string; color: string };
}

export interface InviteInfo {
  roomId: number;
  state: string;
  period: number;
  atLeastPeople: number;
  currentMembers: number;
  detail: string | null;
  book: BookSummary;
}

// 도서 검색 (카카오 API)
export async function searchBooks(
  keyword: string,
  page = 1,
  size = 10,
): Promise<BookSearchResult> {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });
  const res = await request<{ success: boolean; data: BookSearchResult }>(
    `/api/books/search?${params}`,
  );
  return res.data;
}

// 방 목록 조회
export async function getRooms(params: {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<RoomListResult> {
  const q = new URLSearchParams();
  if (params.keyword) q.set("keyword", params.keyword);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.size) q.set("size", String(params.size));
  const res = await request<{ success: boolean; data: RoomListResult }>(
    `/api/rooms?${q}`,
  );
  return res.data;
}

// 방 생성
export async function createRoom(
  payload: CreateRoomPayload,
): Promise<CreateRoomResult> {
  const res = await request<{ success: boolean; data: CreateRoomResult }>(
    "/api/rooms",
    { method: "POST", body: JSON.stringify(payload) },
  );
  return res.data;
}

// 방 참여
export async function joinRoom(
  roomId: number,
): Promise<{ memberId: number; role: string; color: string }> {
  const res = await request<{
    success: boolean;
    data: { memberId: number; role: string; color: string };
  }>(`/api/rooms/${roomId}/join`, { method: "POST" });
  return res.data;
}

// 초대 코드로 방 정보 조회
export async function getRoomByInviteCode(
  inviteCode: string,
): Promise<InviteInfo> {
  const res = await request<{ success: boolean; data: InviteInfo }>(
    `/api/invite/${inviteCode}`,
  );
  return res.data;
}

// 내가 참여한 방 목록 조회
export const getJoinedRooms = () =>
  api.get<{ success: boolean; data: JoinedRoom[] }>('/api/rooms/joined');