export interface TrendingTag {
  score: number;
  tag: string;
}

export interface TrendingTagsResponse {
  data?: {
    trendingTags?: {
      tags?: TrendingTag[];
    };
  };
}
