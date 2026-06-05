export interface SongRecommendation {
  songRecommendationId: number;
  title: string;
  artist: string;
  url: string;
}

export interface CreateSongRecommendationsResponse {
  success: boolean;
  data: {
    roomId: string;
    recommendations: SongRecommendation[];
  };
}