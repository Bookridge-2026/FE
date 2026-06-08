import { api as client } from "../api/client";

export interface User { id: number; name: string; color: string; }
export interface Reply { id: number; author: User; text: string; }
export interface Comment {
  id: number; page: number; quote: string; author: User;
  text?: string; replyCount: number;
}
export interface PageReaction { id: number; user: User; emoji: string; emojiTypeId: number; }

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
  memberId: number; nickname: string; profileImageUrl: string;
  color: string; maxPage: number; totalPage: number; progressPercent: number;
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

const EMOJI_BY_TYPE: Record<number, string> =
  Object.fromEntries(EMOJI_TYPES.map((e) => [e.id, e.char]));

const toUser  = (m: ApiMember): User  => ({ id: m.memberId, name: m.nickname, color: m.color });
const toReply = (r: ApiReply): Reply  => ({ id: r.replyId, author: toUser(r.member), text: r.content });
const toComment = (c: ApiComment): Comment => ({
  id:         c.commentId,
  page:       c.page,
  quote:      c.content ?? "",
  text:       c.isDeleted ? "삭제된 코멘트입니다" : c.comment,
  author:     c.member ? toUser(c.member) : { id: 0, name: "(삭제됨)", color: "#ccc" },
  replyCount: c.replyCount,
});
const toReaction = (r: ApiReaction): PageReaction => ({
  id:          r.emojiId,
  user:        toUser(r.member),
  emoji:       EMOJI_BY_TYPE[r.emojiType.emojiTypeId] ?? "❓",
  emojiTypeId: r.emojiType.emojiTypeId,
});

export const fetchRoomDetail = (roomId: string): Promise<RoomDetail> =>
  client.get(`/api/rooms/${roomId}`).then((r) => r.data.data);

export const fetchPages = (roomId: string): Promise<number[]> =>
  client.get(`/api/rooms/${roomId}/pages`).then((r) => r.data.data.pages as number[]);

export const fetchComments = (roomId: string, page: number): Promise<Comment[]> =>
  client.get(`/api/rooms/${roomId}/comments`, { params: { page } })
    .then((r) => (r.data.data as ApiComment[]).map(toComment));

export const fetchReactions = (roomId: string, page: number): Promise<PageReaction[]> =>
  client.get(`/api/rooms/${roomId}/reactions`, { params: { page } })
    .then((r) => (r.data.data as ApiReaction[]).map(toReaction));

export const fetchReplies = (roomId: string, commentId: number): Promise<Reply[]> =>
  client.get(`/api/rooms/${roomId}/comments/${commentId}/replies`)
    .then((r) => (r.data.data as ApiReply[]).map(toReply));

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

export const createComment = (roomId: string, page: number, quote: string, comment: string) =>
  client.post(`/api/rooms/${roomId}/comments`, { page, content: quote, comment });

export const createReply = (roomId: string, commentId: number, content: string) =>
  client.post(`/api/rooms/${roomId}/comments/${commentId}/replies`, { content });

export const toggleReaction = (
  roomId: string,
  page: number,
  emojiTypeId: number,
): Promise<{ toggled: boolean; emoji: { emojiId: number } | null }> =>
  client.post(`/api/rooms/${roomId}/reactions`, { page, emojiTypeId })
    .then((r) => r.data.data);

export const updateComment = (roomId: string, commentId: number, comment: string) =>
  client.patch(`/api/rooms/${roomId}/comments/${commentId}`, { comment });

export const deleteComment = (roomId: string, commentId: number) =>
  client.delete(`/api/rooms/${roomId}/comments/${commentId}`);

export const deleteReply = (roomId: string, commentId: number, replyId: number) =>
  client.delete(`/api/rooms/${roomId}/comments/${commentId}/replies/${replyId}`);

export const deleteReaction = (roomId: string, emojiId: number) =>
  client.delete(`/api/rooms/${roomId}/reactions/${emojiId}`);

export const fetchMyMemberId = async (roomId: string, userId: number): Promise<number> => {
  const res = await client.get(`/api/rooms/${roomId}/members`);
  const members = res.data.data as { memberId: number; userId: number }[];
  return members.find((m) => m.userId === userId)?.memberId ?? 0;
};

export const fetchOcrPages = (roomId: string): Promise<number[]> =>
  client.get(`/api/ocr/rooms/${roomId}`).then((r) => r.data.data as number[]);

export const fetchOcrEntriesByPage = (
  roomId: string,
  page: number
): Promise<{ ocrPageId: number; page: number }[]> =>
  client.get(`/api/ocr/rooms/${roomId}/page/${page}`)
    .then((r) => r.data.data as { ocrPageId: number; page: number }[]);