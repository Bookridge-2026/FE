import { api } from "@/api/client";
import type {
  GetRoomMembersResponse,
  PokeMemberResponse,
  KickMemberResponse,
} from "@/types/member";

export const getRoomMembers = async (roomId: number) => {
  const { data } = await api.get<GetRoomMembersResponse>(
    `/api/rooms/${roomId}/members`
  );

  return data.data;
};

export const pokeMember = async (
  roomId: number,
  memberId: number
) => {
  const { data } = await api.post<PokeMemberResponse>(
    `/api/rooms/${roomId}/members/${memberId}/poke`
  );

  return data;
};

export const kickMember = async (
  roomId: number,
  memberId: number
) => {
  const { data } = await api.delete<KickMemberResponse>(
    `/api/rooms/${roomId}/members/${memberId}`
  );

  return data;
};