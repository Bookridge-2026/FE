import { api } from "@/api/client";
import type { CreateSongRecommendationsResponse } from "@/types/song";

export const createSongRecommendations = async (roomId: number) => {
  const { data } =
    await api.post<CreateSongRecommendationsResponse>(
      `/api/rooms/${roomId}/songs/recommendations`
    );

  return data.data;
};