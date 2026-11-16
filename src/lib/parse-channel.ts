import type { Channel, Video } from "@/lib/types";

type Obj = Record<string, unknown>;

export type RawVideo = {
  id: string;
  title: string;
  viewsLabel: string;
  publishedLabel: string;
  durationLabel: string;
  durationSec: number;
};

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function contentText(node: unknown): string {
  if (typeof node === "string") return node;
  if (!isObj(node)) return "";
  if (typeof node.content === "string") return node.content;
  if (typeof node.simpleText === "string") return node.simpleText;
  if (Array.isArray(node.runs)) {
    return node.runs
      .map((run) => (isObj(run) && typeof run.text === "string" ? run.text : ""))
      .join("");
  }
  return "";
}

export function estimatePublishedAt(label: string, now: number): number {
  const s = label.toLowerCase();
  if (s.includes("yesterday")) return now - 86_400_000;
  const long = s.match(/(\d+)\s*(second|minute|hour|day|week|month|year)/);
  let amount: number | null = null;
  let unit: string | null = null;
  if (long?.[1] && long[2]) {
    amount = Number(long[1]);
    unit = long[2];
  } else {
    const short = s.match(/(\d+)\s*(sec|min|h|d|w|mo|yr|y)\b/);
    const mapped: Record<string, string> = {
      sec: "second",
      min: "minute",
      h: "hour",
      d: "day",
      w: "week",
      mo: "month",
      yr: "year",
      y: "year",
    };
    if (short?.[1] && short[2] && mapped[short[2]]) {
      amount = Number(short[1]);
      unit = mapped[short[2]];
    }
  }
  if (amount === null || !unit) return 0;
  const mult: Record<string, number> = {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000,
    year: 31_536_000_000,
  };
  return now - amount * (mult[unit] ?? 0);
}

function durationSec(label: string): number {
  if (!/\d:\d/.test(label)) return 0;
  const nums = label.split(":").map((part) => Number(part));
  if (nums.some((n) => Number.isNaN(n))) return 0;
  return nums.reduce((total, n) => total * 60 + n, 0);
}

function cleanBlurb(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function avatarFrom(data: Obj): string {
  const meta = isObj(data.metadata) ? data.metadata : null;
  const renderer =
    meta && isObj(meta.channelMetadataRenderer) ? meta.channelMetadataRenderer : null;
  const avatar = renderer && isObj(renderer.avatar) ? renderer.avatar : null;
  const thumbs = avatar && Array.isArray(avatar.thumbnails) ? avatar.thumbnails : [];
  const last = thumbs.at(-1);
  if (isObj(last) && typeof last.url === "string") {
    return last.url.replace(/=s\d+/, "=s240");
  }
  return "";
}

function parseLockup(lock: Obj): RawVideo | null {
  const vid = typeof lock.contentId === "string" ? lock.contentId : "";
  if (!/^[\w-]{11}$/.test(vid)) return null;
  const metadata = isObj(lock.metadata) ? lock.metadata : {};
  const view = isObj(metadata.lockupMetadataViewModel) ? metadata.lockupMetadataViewModel : {};
  const title = contentText(view.title).trim() || "Untitled";
  let views = "";
  let published = "";
  const inner = isObj(view.metadata) ? view.metadata : {};
  const rowsModel = isObj(inner.contentMetadataViewModel) ? inner.contentMetadataViewModel : {};
  const rows = Array.isArray(rowsModel.metadataRows) ? rowsModel.metadataRows : [];
  for (const row of rows) {
    if (!isObj(row) || !Array.isArray(row.metadataParts)) continue;
    for (const part of row.metadataParts) {
      if (!isObj(part)) continue;
      const label =
        typeof part.accessibilityLabel === "string"
          ? part.accessibilityLabel
          : contentText(part.text);
      const short = contentText(part.text);
      const blob = `${short} ${label}`.toLowerCase();
      if (blob.includes("view") && !views) {
        views = label.toLowerCase().includes("view") ? label : short;
      } else if (
        ["ago", "hour", "day", "week", "month", "year", "yesterday", "stream", "premier"].some(
          (key) => blob.includes(key),
        )
      ) {
        published = label || short;
      }
    }
  }
  let duration = "";
  const image = isObj(lock.contentImage) ? lock.contentImage : {};
  const thumb = isObj(image.thumbnailViewModel) ? image.thumbnailViewModel : {};
  const overlays = Array.isArray(thumb.overlays) ? thumb.overlays : [];
  for (const overlay of overlays) {
    if (!isObj(overlay) || !isObj(overlay.thumbnailBottomOverlayViewModel)) continue;
    const badges = overlay.thumbnailBottomOverlayViewModel.badges;
    if (!Array.isArray(badges)) continue;
    for (const badge of badges) {
      if (!isObj(badge) || !isObj(badge.thumbnailBadgeViewModel)) continue;
      const text = badge.thumbnailBadgeViewModel.text;
      if (typeof text === "string" && /\d:\d/.test(text)) duration = text;
    }
  }
  return {
    id: vid,
    title,
    viewsLabel: views,
    publishedLabel: published,
    durationLabel: duration,
    durationSec: durationSec(duration),
  };
}

function walkVideos(node: unknown, out: RawVideo[]): void {
  if (Array.isArray(node)) {
    for (const item of node) walkVideos(item, out);
    return;
  }
  if (!isObj(node)) return;
  if (isObj(node.lockupViewModel) && node.lockupViewModel.contentType === "LOCKUP_CONTENT_TYPE_VIDEO") {
    const parsed = parseLockup(node.lockupViewModel);
    if (parsed) out.push(parsed);
  }
  if (isObj(node.videoRenderer) && typeof node.videoRenderer.videoId === "string") {
    const length = contentText(node.videoRenderer.lengthText);
    out.push({
      id: node.videoRenderer.videoId,
      title: contentText(node.videoRenderer.title).trim() || "Untitled",
      viewsLabel: contentText(node.videoRenderer.viewCountText),
      publishedLabel: contentText(node.videoRenderer.publishedTimeText),
      durationLabel: length,
      durationSec: durationSec(length),
    });
  }
  for (const value of Object.values(node)) walkVideos(value, out);
}

function collectLabels(node: unknown, acc: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectLabels(item, acc);
    return;
  }
  if (!isObj(node)) return;
  if (typeof node.content === "string") acc.push(node.content);
  else if ("text" in node) {
    const text = contentText(node.text);
    if (text) acc.push(text);
  }
  for (const value of Object.values(node)) collectLabels(value, acc);
}

export function parseChannelPage(
  data: unknown,
  handle: string,
  now: number,
): { channel: Channel; videos: Video[] } | null {
  if (!isObj(data)) return null;
  const metaWrap = isObj(data.metadata) ? data.metadata : {};
  const meta = isObj(metaWrap.channelMetadataRenderer) ? metaWrap.channelMetadataRenderer : {};
  const name = (typeof meta.title === "string" ? meta.title : handle).trim() || handle;
  const id = typeof meta.externalId === "string" ? meta.externalId : "";
  const description = typeof meta.description === "string" ? meta.description : "";
  const labels: string[] = [];
  collectLabels(data.header, labels);
  const subscribers = labels.find((label) => label.toLowerCase().includes("subscriber")) ?? "";
  const videoCount =
    labels.find((label) => /\bvideos\b/i.test(label) && !label.toLowerCase().includes("subscriber")) ??
    "";

  const contents = isObj(data.contents) ? data.contents : {};
  const browse = isObj(contents.twoColumnBrowseResultsRenderer)
    ? contents.twoColumnBrowseResultsRenderer
    : {};
  const tabs = Array.isArray(browse.tabs) ? browse.tabs : [];
  let videoTab: unknown = null;
  for (const tab of tabs) {
    if (!isObj(tab) || !isObj(tab.tabRenderer)) continue;
    if (tab.tabRenderer.title === "Videos" && tab.tabRenderer.content) {
      videoTab = tab.tabRenderer.content;
      break;
    }
  }

  const raw: RawVideo[] = [];
  walkVideos(videoTab ?? {}, raw);
  const seen = new Set<string>();
  const videos: Video[] = [];
  for (const video of raw) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    videos.push({
      ...video,
      channelId: id,
      channelName: name,
      handle,
      thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
      publishedAt: estimatePublishedAt(video.publishedLabel, now),
    });
  }

  return {
    channel: {
      id,
      handle,
      name,
      avatar: avatarFrom(data),
      subscribers,
      videoCount,
      blurb: cleanBlurb(description),
    },
    videos,
  };
}

export function extractInitialData(html: string): unknown | null {
  const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]) as unknown;
  } catch {
    return null;
  }
}
