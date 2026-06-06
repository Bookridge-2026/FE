export type MemberRole = "leader" | "member";

export interface RoomMember {
  memberId: number;
  userId: number;
  color: string;
  role: MemberRole;
  maxPage: number;
  state: string;
  pokeCount: number;
  poke: number;
  canKick: boolean;
  user: {
    nickname: string;
    profileImageUrl: string;
  };
}

export interface GetRoomMembersResponse {
  success: boolean;
  data: RoomMember[];
}

export interface PokeMemberData {
  memberId: number;
  pokeCount: number;
  poke: number;
  canKick: boolean;
}

export interface PokeMemberResponse {
  success: boolean;
  message: string;
  data: PokeMemberData;
}

export interface KickMemberResponse {
  success: boolean;
  message: string;
}