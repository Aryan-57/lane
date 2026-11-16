import { SNAPSHOT } from "@/data/snapshot";
import { extractInitialData, parseChannelPage } from "@/lib/parse-channel";
import type { Catalog, Channel, Video } from "@/lib/types";
import { createServerFn } from "@tanstack/react-start";

const TTL_MS = 20 * 60 * 1000;

let memory: { at: number; catalog: Catalog } | null = null;

const HANDLES = [
  "rajshamaniclips",
  "thinkwithshamani",
  "iamparitoshanand",
  "CompileFuture",
  "vaibhavsisinty",
] as const;

async function fetchHandle(
  handle: string,
  now: number,
): Promise<{ channel: Channel; videos: Video[] } | null> {
  const response = await fetch(`https://www.youtube.com/@${handle}/videos`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(18_000),
  });
  if (!response.ok) return null;
  const html = await response.text();
  const data = extractInitialData(html);
  if (!data) return null;
  const parsed = parseChannelPage(data, handle, now);
  if (!parsed || parsed.videos.length === 0) return null;
  return parsed;
}

async function loadLive(): Promise<Catalog> {
  const now = Date.now();
  if (memory && now - memory.at < TTL_MS) return memory.catalog;

  const pages = await Promise.all(
    HANDLES.map(async (handle) => {
      try {
        return await fetchHandle(handle, now);
      } catch {
        return null;
      }
    }),
  );

  const channels: Channel[] = [];
  const videos: Video[] = [];
  let liveCount = 0;
  for (const [index, handle] of HANDLES.entries()) {
    const page = pages[index];
    if (page) {
      liveCount += 1;
      channels.push(page.channel);
      videos.push(...page.videos);
      continue;
    }
    const fallback = SNAPSHOT.channels.find((channel) => channel.handle === handle);
    if (fallback) channels.push(fallback);
    videos.push(...SNAPSHOT.videos.filter((video) => video.handle === handle));
  }

  videos.sort((a, b) => b.publishedAt - a.publishedAt);
  const catalog: Catalog = {
    fetchedAt: now,
    source: liveCount > 0 ? "live" : "snapshot",
    channels: channels.length ? channels : SNAPSHOT.channels,
    videos: videos.length ? videos : SNAPSHOT.videos,
  };
  memory = { at: now, catalog };
  return catalog;
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await loadLive();
  } catch {
    return SNAPSHOT;
  }
});
