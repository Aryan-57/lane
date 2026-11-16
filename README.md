# LANE

A private video desk. Five channels. One video at a time. Nothing else is recommended.

LANE is a phone-shaped web app, not a YouTube clone and not a Play Store package. The home feed only shows videos from a fixed list of channels. Opening a video does not queue another one, and the watch screen does not offer other videos. Leave halfway, close the tab, and come back: playback resumes on that same phone.

Playback uses YouTube’s official player. LANE does not download, rehost, or strip the video file. A creator’s pre-roll can still appear inside that player. The app itself inserts no ads and no “up next” rail.

## The five channels

These handles are the whole catalog. They are fixed in `src/lib/catalog.functions.ts`.

| Channel | Handle | Page |
| --- | --- | --- |
| Raj Shamani Clips | `rajshamaniclips` | https://www.youtube.com/@rajshamaniclips/videos |
| Think with shamani | `thinkwithshamani` | https://www.youtube.com/@thinkwithshamani |
| I AM PARITOSH ANAND | `iamparitoshanand` | https://www.youtube.com/@iamparitoshanand/videos |
| Compile Future | `CompileFuture` | https://www.youtube.com/@CompileFuture |
| Vaibhav Sisinty | `vaibhavsisinty` | https://www.youtube.com/@vaibhavsisinty |

Search and the channel chips only look inside this list. A video that is not from these channels never enters the feed.

## What you can do

- **Feed.** Latest uploads from all five channels, newest first. About thirty videos per channel, taken from each channel’s public Videos tab.
- **Search.** Title and channel name only. It does not search the rest of YouTube.
- **Channel chip.** Narrows the feed to one channel. “All five” clears that filter.
- **Watch.** One player. When the video ends, LANE covers YouTube’s end screen. Replay starts the same video over. Nothing is queued.
- **Continue.** Videos you left between about 2% and 92% watched, most recently touched first.
- **Channels.** The five channels, with subscriber count and a short blurb, each linking back into its filtered feed.

## Resume

Progress lives in `localStorage` on this device, under the key `lane.progress.v1`. There is no account.

- While a video plays, the position is saved about every four seconds, and again on pause, when the tab hides, and when you leave the page.
- A video counts as in progress after 2% and before 92%. At 92% or more it is marked watched and the next open starts at the beginning.
- Opening a half-watched video puts `start` on the embed URL, so pressing play continues from that second. The watch page also prints “Resumes at …”.
- Finished videos are not listed on Continue.

The catalog cache is a separate key, `lane.catalog.v1`. It only remembers the video list so the next open is fast. It is not your watch history.

## How the catalog is loaded

1. The app paints immediately from `src/data/snapshot.ts`, a seeded copy of the five channels’ recent videos.
2. In the browser, `useCatalog` then calls `getCatalog`.
3. `getCatalog` (`src/lib/catalog.functions.ts`) fetches each channel’s public `/videos` page on the server, reads `ytInitialData`, and parses the Videos tab (`src/lib/parse-channel.ts`).
4. A channel that fails to load falls back to its rows in the snapshot. The merged list is cached in memory for twenty minutes and written to `lane.catalog.v1`.
5. Relative times such as “2 days ago” are turned into an estimated `publishedAt` at fetch time, then shown again as relative time in the UI.

Refresh the seed (optional, from a machine that can reach YouTube):

```bash
python3 scripts/seed-catalog.py
```

That rewrites `src/data/snapshot.ts`. It is a one-shot scraper, not part of the running app.

## Playback details

`src/components/player.tsx` embeds `https://www.youtube.com/embed/VIDEO_ID` with the IFrame API so LANE can read the current time.

- `rel=0`, no playlist, so YouTube does not advance to another video.
- `autoplay` is left off. Turning it on makes the player report the video as unavailable in some browsers.
- The iframe sends a referrer (`strict-origin-when-cross-origin`). YouTube returns player error 153 if that header is missing.
- On the ended state, a cover sits on top of the iframe so the suggested-video end screen cannot be tapped.

## Project map

| Path | Role |
| --- | --- |
| `src/routes/index.tsx` | Feed, search, channel chips |
| `src/routes/watch.$videoId.tsx` | Watch page |
| `src/routes/continue.tsx` | Half-watched shelf |
| `src/routes/channels.tsx` | The five channels |
| `src/routes/__root.tsx` | Document shell |
| `src/components/app-shell.tsx` | Centered column and bottom nav. Nav is hidden while watching |
| `src/components/video-card.tsx` | Thumbnail, progress bar, “Left at” / “Watched” |
| `src/components/player.tsx` | YouTube embed, save position, end cover |
| `src/lib/catalog.tsx` | Snapshot first, then live refresh |
| `src/lib/catalog.functions.ts` | Server fetch of the five channels |
| `src/lib/parse-channel.ts` | Turns a channel page into videos |
| `src/lib/progress.ts` | Read and write resume points |
| `src/data/snapshot.ts` | Offline seed of the catalog |
| `scripts/seed-catalog.py` | Regenerates that seed |

## Run

```bash
npm install
npm run dev
```

`npm run dev` serves the app on port **8080**. Then:

```bash
npm run typecheck
npm run build
```

Stack: React 19, TanStack Start, Tailwind CSS v4. Progress and the catalog cache stay in the browser. There is no sign-in.

## Limits

- Only the latest page of each channel’s Videos tab (about thirty videos). Shorts, live, and older uploads are not pulled in.
- Resume does not sync across phones or browsers.
- This is a website you open on a phone. It is not an Android APK.
- Titles and thumbnails come from YouTube and can change. The snapshot lags until the live refresh, or until the seed script is run again.
