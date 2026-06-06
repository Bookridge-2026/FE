export interface SongRecommendation {
  songRecommendationId: number;
  title: string;
  artist: string;
  url: string;
}

export interface SongRecommendationWithCreatedAt extends SongRecommendation {
  createdAt: string;
}

export interface CreateSongRecommendationsResponse {
  success: boolean;
  data: {
    roomId: string;
    recommendations: SongRecommendation[];
  };
}

export interface GetRandomSongRecommendationResponse {
  success: boolean;
  data: SongRecommendationWithCreatedAt;
}