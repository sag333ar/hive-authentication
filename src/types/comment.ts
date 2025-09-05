/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ActiveVote } from "./video";

export interface DiscussionAsset {
  amount?: number;
  symbol?: string;
}

export interface BeneficiaryRoute {
  account?: string;
  weight?: number;
}

export interface Stats {
  flag_weight?: number;
  gray?: boolean;
  hide?: boolean;
  total_votes?: number;
}


export interface JsonMetadata {
  app?: string;
  format?: 'markdown' | 'markdown_html';
  image?: string[];
  links?: string[];
  tags?: string[];
  description?: string;
  users?: string[];
  imageRatios?: any[];
  thumbnails?: string[];
  type?: string;
  actiCrVal?: string;
  actifitUserId?: string[];
  activityDate?: string[];
  activityType?: string[];
  appType?: string;
  chestUnit?: string[];
  community?: string[];
  dataTrackingSource?: string[];
  detailedActivity?: string[];
  heightUnit?: string[];
  stepCount?: any[];
  thighsUnit?: string[];
  waistUnit?: string[];
  weightUnit?: string[];
  shortForm?: string;
  fitbitUserId?: string;
}

export interface Discussion {
  id?: number;
  author: string;
  permlink: string;
  category?: string;
  parent_author?: string;
  parent_permlink?: string;
  title?: string;
  body?: string;
  json_metadata?: string;
  last_update?: string;
  created: string;
  active?: string;
  last_payout?: string;
  depth?: number;
  children?: number;
  net_rshares?: number;
  abs_rshares?: number;
  vote_rshares?: string;
  children_abs_rshares?: string;
  cashout_time?: string;
  max_cashout_time?: string;
  total_vote_weight?: number;
  reward_weight?: number;
  total_payout_value?: string;
  curator_payout_value?: string;
  author_rewards?: string;
  net_votes?: number;
  root_comment?: number;
  max_accepted_payout?: string;
  percent_hbd?: number;
  allow_replies?: boolean;
  allow_votes?: boolean;
  allow_curation_rewards?: boolean;
  beneficiaries?: BeneficiaryRoute[];
  url?: string;
  root_title?: string;
  payout?: number;
  payout_at?: string;
  pending_payout_value?: string;
  total_pending_payout_value?: string;
  active_votes?: ActiveVote[];
  replies?: string[];
  author_reputation?: number;
  promoted?: string;
  first_reblogged_by?: any;
  first_reblogged_on?: any;
  reblogged_by?: string[];
  community?: string;
  community_title?: string;
  stats?: Stats;
  author_role?: string;
  author_title?: string;
  blacklists?: string[];
  is_paidout?: boolean;
  post_id?: number;
  reblogs?: number;
  updated?: string;

  // This will be added after parsing
  json_metadata_parsed?: JsonMetadata;
}