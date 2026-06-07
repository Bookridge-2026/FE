import { api } from '@/api/client';
import type { JoinedRoom } from '@/types/room';

// 공통 fetch 래퍼
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// ─── 타입 정의 ─────────────────────────────────────────────────────────────

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
  book: {
    isbn: string;
    title: string;
    totalPage: number;
  };
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

export interface RoomDetail {
  roomId: number;
  state: string;
  startDate: string;
  period: number;
  atLeastPeople: number;
  detail: string | null;
  book: {
    title: string;
    author: string;
    publisher: string;
    thumbnail: string;
    totalPage: number;
  };
}

export interface MemberProfile {
  memberId: number;
  userId: number;
  role: string;
  color: string;
  nickname: string;
}

export interface MemberProgress {
  memberId: number;
  userId: number;
  nickname: string;
  color: string;
  currentPage: number;
  progressRate: number;
}


export interface MyRoomsResult {
  invitedRooms?: {
    type: string;
    roomId: number;
    memberId: number;
    book: { title: string; publisher: string };
    invitedBy: string;
  }[];
  leaderRooms: {
    type: string;
    roomId: number;
    memberId: number;
    book: { title: string; publisher: string };
    currentMembers?: number;
    atLeastPeople?: number;
    pendingMembers?: { memberId: number; userId: number; nickname: string }[];
  }[];
  otherRooms: {
    type: string;
    roomId: number;
    memberId: number;
    book: { title: string; publisher: string };
    currentMembers?: number;
    atLeastPeople?: number;
    myState?: string;
    myNickname?: string;
  }[];
}

export interface MyBooksResult {
  closedCount: number;
  books: {
    roomId: number;
    state: string;
    startDate: string;
    book: { title: string; publisher: string };
  }[];
}

// ─── API 함수 ──────────────────────────────────────────────────────────────

// 도서 검색 (카카오 API)
export async function searchBooks(
  keyword: string,
  page = 1,
  size = 10,
): Promise<BookSearchResult> {
  const res = await api.get<{ success: boolean; data: BookSearchResult }>(
    "/api/books/search",
    { params: { keyword, page, size } },
  );
  return res.data.data;
}

// 방 목록 조회
export async function getRooms(params: {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<RoomListResult> {
  const res = await api.get<{ success: boolean; data: RoomListResult }>(
    "/api/rooms",
    { params },
  );
  return res.data.data;
}

// 방 생성
export async function createRoom(
  payload: CreateRoomPayload,
): Promise<CreateRoomResult> {
  const res = await api.post<{ success: boolean; data: CreateRoomResult }>(
    "/api/rooms",
    payload,
  );
  return res.data.data;
}

// 방 참여
export async function joinRoom(
  roomId: number,
): Promise<{ memberId: number; role: string; color: string }> {
  const res = await api.post<{
    success: boolean;
    data: { memberId: number; role: string; color: string };
  }>(`/api/rooms/${roomId}/join`);
  return res.data.data;
}

// 방 시작
export async function startRoom(roomId: number): Promise<{ roomId: number; state: string; startDate: string }> {
  const res = await api.patch<{ success: boolean; data: { roomId: number; state: string; startDate: string } }>(
    `/api/rooms/${roomId}/start`,
  );
  return res.data.data;
}

// 초대 코드 생성
export async function createInviteCode(
  roomId: number,
): Promise<{ inviteCode: string; roomId: number }> {
  const res = await api.post<{
    success: boolean;
    data: { inviteCode: string; roomId: number };
  }>(`/api/rooms/${roomId}/invite`);
  return res.data.data;
}

// 초대 코드로 방 정보 조회
export async function getRoomByInviteCode(
  inviteCode: string,
): Promise<InviteInfo> {
  const res = await api.get<{ success: boolean; data: InviteInfo }>(
    `/api/invite/${inviteCode}`,
  );
  return res.data.data;
}

// 방 기본 정보 조회
export async function getRoomDetail(roomId: number): Promise<RoomDetail> {
  const res = await api.get<{ success: boolean; data: RoomDetail }>(
    `/api/rooms/${roomId}`,
  );
  return res.data.data;
}

// 방 멤버 목록 조회
export async function getMembers(roomId: number): Promise<MemberProfile[]> {
  const res = await api.get<{ success: boolean; data: MemberProfile[] }>(
    `/api/rooms/${roomId}/members`,
  );
  return res.data.data;
}

// 멤버 진행률 조회
export async function getMembersProgress(
  roomId: number,
): Promise<MemberProgress[]> {
  const res = await api.get<{ success: boolean; data: MemberProgress[] }>(
    `/api/rooms/${roomId}/members/progress`,
  );
  return res.data.data;
}


// 초대 수락
export async function acceptInvite(
  roomId: number,
): Promise<{ memberId: number; userId: number; state: string }> {
  const res = await api.patch<{
    success: boolean;
    data: { memberId: number; userId: number; state: string };
  }>(`/api/rooms/${roomId}/invite/accept`);
  return res.data.data;
}

// 초대 거절
export async function rejectInvite(roomId: number): Promise<void> {
  await api.patch(`/api/rooms/${roomId}/invite/reject`);
}

// 입장 요청 수락 (방장)
export async function acceptMember(
  roomId: number,
  userId: number,
): Promise<{ memberId: number; userId: number; state: string }> {
  const res = await api.patch<{
    success: boolean;
    data: { memberId: number; userId: number; state: string };
  }>(`/api/rooms/${roomId}/users/${userId}/accept`);
  return res.data.data;
}

// 입장 요청 거절 (방장)
export async function rejectMember(
  roomId: number,
  userId: number,
): Promise<void> {
  await api.patch(`/api/rooms/${roomId}/users/${userId}/reject`);
}

// 내 책 모아보기
export async function getMyBooks(): Promise<MyBooksResult> {
  const res = await api.get<{ success: boolean; data: MyBooksResult }>(
    "/api/rooms/my/books",
  );
  return res.data.data;
}

// 내 방 목록 조회
export async function getMyRooms(
  state: "waiting" | "ongoing" | "closed",
): Promise<MyRoomsResult> {
  const res = await api.get<{ success: boolean; data: MyRoomsResult }>(
    "/api/rooms/my",
    { params: { state } },
  );
  return res.data.data;
}
// 내가 참여한 방 목록 조회
export const getJoinedRooms = () =>
  api.get<{ success: boolean; data: JoinedRoom[] }>('/api/rooms/joined');
