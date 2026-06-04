// src/types/room.ts
export interface MemberProfile {
  profileImage: string;
  color: string;
}

export interface RoomBook {
  title: string;
  author: string;
  publisher: string;
  thumbnail: string;
}

export interface JoinedRoom {
  roomId: number;
  state: 'ongoing' | 'waiting';
  book: RoomBook;
  period: number;
  daysLeft?: number;
  minMembers: number;
  progressRate: number;
  maxReadPage: number;
  totalPages: number;
  memberProfiles: MemberProfile[];
}