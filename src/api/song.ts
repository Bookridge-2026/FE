import { api } from "@/api/client";
import type { CreateSongRecommendationsResponse, GetRandomSongRecommendationResponse } from "@/types/song";

export const createSongRecommendations = async (roomId: number) => {
  const { data } =
    await api.post<CreateSongRecommendationsResponse>(
      `/api/rooms/${roomId}/songs/recommendations`
    );

  return data.data;
};

export const fetchRandomSongRecommendation = async (
  roomId: string
): Promise<GetRandomSongRecommendationResponse> => {
  const res = await api.get(`/api/rooms/${roomId}/songs/recommendations/random`);
  return res.data;
};