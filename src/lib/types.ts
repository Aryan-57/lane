export type Channel = {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  subscribers: string;
  videoCount: string;
  blurb: string;
};

export type Video = {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  handle: string;
  thumbnail: string;
  durationLabel: string;
  durationSec: number;
  viewsLabel: string;
  publishedLabel: string;
  publishedAt: number;
};

export type Catalog = {
  fetchedAt: number;
  source: "snapshot" | "live";
  channels: Channel[];
  videos: Video[];
};

export type ProgressEntry = {
  /** Playback position in seconds. */
  t: number;
  /** Duration in seconds, when known. */
  d: number;
  /** Last write, epoch ms. */
  at: number;
};

export type ProgressMap = Record<string, ProgressEntry>;
