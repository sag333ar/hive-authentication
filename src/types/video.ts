/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ThreeSpeakVideo {
  encoding?: Record<string, boolean>;
  updateSteem?: boolean;
  lowRc?: boolean;
  needsBlockchainUpdate?: boolean;
  status?: string;
  encodingPriceSteem?: string;
  paid?: boolean;
  encodingProgress?: number;
  created?: Date;
  is3CjContent?: boolean;
  isVod?: boolean;
  isNsfwContent?: boolean;
  declineRewards?: boolean;
  rewardPowerup?: boolean;
  language?: string;
  category?: string;
  firstUpload?: boolean;
  community?: string;
  indexed?: boolean;
  views?: number;
  hive?: string;
  upvoteEligible?: boolean;
  publishType?: string;
  beneficiaries?: string;
  votePercent?: number;
  reducedUpvote?: boolean;
  donations?: boolean;
  postToHiveBlog?: boolean;
  tagsV2?: string[];
  fromMobile?: boolean;
  isReel?: boolean;
  width?: number;
  height?: number;
  isAudio?: boolean;
  jsonMetaDataAppName?: any;
  id?: string;
  originalFilename?: string;
  permlink?: string;
  duration?: number;
  size?: number;
  owner?: string;
  uploadType?: string;
  title?: string;
  description?: string;
  tags?: string;
  v?: number;
  filename?: string;
  localFilename?: string;
  thumbnail?: string;
  video_v2?: string;
  badges?: any[];
  curationComplete?: boolean;
  hasAudioOnlyVersion?: boolean;
  hasTorrent?: boolean;
  isB2?: boolean;
  needsHiveUpdate?: boolean;
  pinned?: boolean;
  publishFailed?: boolean;
  recommended?: boolean;
  score?: number;
  steemPosted?: boolean;
  jobId?: string;
}

export interface VideoFeedItem {
  title: string;
  author: string;
  permlink: string;
  created: Date;
  category: string;
  numOfUpvotes?: number;
  numOfComments?: number;
  hiveValue?: number;
  duration?: number;
  thumbnail?: string;
}

export const ApiVideoFeedType = {
  HOME: 'home',
  TRENDING: 'trending',
  NEW_VIDEOS: 'newVideos',
  FIRST_UPLOADS: 'firstUploads',
  USER: 'user',
  COMMUNITY: 'community',
  RELATED: 'related',
  TAG_FEED: 'tag_feed',
  SEARCH: 'search',
} as const;

export type ApiVideoFeedType =
  (typeof ApiVideoFeedType)[keyof typeof ApiVideoFeedType];

export interface LoginModel {
  challenge: string;
  proof: string;
  publicKey: string;
  username: string;
}

export interface ActiveVote {
  voter: string;
  rshares: number;
  percent?: number;
  reputation?: number;
  time?: string;
  weight?: number;
}