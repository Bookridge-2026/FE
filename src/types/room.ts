// src/types/room.ts
export interface MemberProfile {
  profileImageUrl: string;
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
  myRole: 'leader' | 'member';
  book: RoomBook;
  period: number;
  daysLeft?: number;
  atLeastPeople: number;
  progressRate: number;
  maxReadPage: number;
  totalPages: number;
  memberProfiles: MemberProfile[];
}