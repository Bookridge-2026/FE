import { api as client } from "../api/client";

export interface User { id: number; name: string; color: string; }
export interface Reply { id: number; author: User; text: string; }
export interface Comment {
  id: number; page: number; quote: string; author: User;
  text?: string; replyCount: number;
}
export interface PageReaction { id: number; user: User; emoji: string; }

export interface RoomDetail {
  roomId: number;
  state: string;
  startDate: string;
  period: number;
  atLeastPeople: number;
  detail: string;
  book: {
    title: string;
    author: string;
    publisher: string;
    thumbnail: string;
    totalPage: number;
  };
}

export interface OcrPage {
  page: number;
  imageUrl?: string;
  text: string;
}

interface ApiMember { memberId: number; nickname: string; color: string; }
interface ApiComment {
  commentId: number; comment: string; content: string | null;
  page: number; isDeleted: boolean; member: ApiMember | null; replyCount: number;
}
interface ApiReply { replyId: number; content: string; createdAt: string; member: ApiMember; }
interface ApiReaction {
  emojiId: number; page: number;
  emojiType: { emojiTypeId: number; emojiUrl: string }; member: ApiMember;
}

interface ApiMemberProgress {
  memberId: number;
  nickname: string;
  profileImageUrl: string;
  color: string;
  maxPage: number;
  totalPage: number;
  progressPercent: number;
}

export interface RoomProgress {
  readers: { user: User; page: number }[];
  totalPages: number;
}

export const EMOJI_TYPES = [
  { id: 1, char: "😮" },
  { id: 2, char: "😢" },
  { id: 3, char: "❤️" },
  { id: 4, char: "👍" },
  { id: 5, char: "🔥" },
];


export const createReply = (roomId: string, commentId: number, content: string) =>
  client.post(`/api/rooms/${roomId}/comments/${commentId}/replies`, { content });


const EMOJI_BY_TYPE: Record<number, string> =
  Object.fromEntries(EMOJI_TYPES.map((e) => [e.id, e.char]));

const toUser = (m: ApiMember): User => ({ id: m.memberId, name: m.nickname, color: m.color });

const toComment = (c: ApiComment): Comment => ({
  id: c.commentId,
  page: c.page,
  quote: c.content ?? "",
  text: c.isDeleted ? "삭제된 코멘트입니다" : c.comment,
  author: c.member ? toUser(c.member) : { id: 0, name: "(삭제됨)", color: "#ccc" },
  replyCount: c.replyCount,
});

const toReply = (r: ApiReply): Reply => ({
  id: r.replyId, author: toUser(r.member), text: r.content,
});

const toReaction = (r: ApiReaction): PageReaction => ({
  id: r.emojiId,
  user: toUser(r.member),
  emoji: EMOJI_BY_TYPE[r.emojiType.emojiTypeId] ?? "❓",
});

// ── API ──
export const fetchRoomDetail = (roomId: string): Promise<RoomDetail> =>
  client.get(`/api/rooms/${roomId}`).then((r) => r.data.data); 

export const fetchPages = (roomId: string) =>
  client.get(`/api/rooms/${roomId}/pages`).then((r) => r.data.data.pages as number[]);

export const fetchComments = (roomId: string, page: number) =>
  client.get(`/api/rooms/${roomId}/comments`, { params: { page } })
    .then((r) => (r.data.data as ApiComment[]).map(toComment));

export const fetchReactions = (roomId: string, page: number) =>
  client.get(`/api/rooms/${roomId}/reactions`, { params: { page } })
    .then((r) => (r.data.data as ApiReaction[]).map(toReaction));

export const fetchReplies = (roomId: string, commentId: number) =>
  client.get(`/api/rooms/${roomId}/comments/${commentId}/replies`)
    .then((r) => (r.data.data as ApiReply[]).map(toReply));

export const fetchOcrPage = (roomId: string, page: number): Promise<OcrPage> =>  
  client.get(`/api/rooms/${roomId}/ocr/${page}`).then((r) => r.data.data);

export const createComment = (roomId: string, page: number, quote: string, comment: string) =>
  client.post(`/api/rooms/${roomId}/comments`, { page, content: quote, comment });

export const addReaction = (roomId: string, page: number, emojiTypeId: number) =>
  client.post(`/api/rooms/${roomId}/reactions`, { page, emojiTypeId });

export const fetchProgress = (roomId: string): Promise<RoomProgress> =>
  client.get(`/api/rooms/${roomId}/members/progress`).then((r) => {
    const data = r.data.data as ApiMemberProgress[];
    return {
      readers: data.map((m) => ({
        user: { id: m.memberId, name: m.nickname, color: m.color },
        page: m.maxPage,
      })),
      totalPages: data[0]?.totalPage ?? 0,
    };
  });