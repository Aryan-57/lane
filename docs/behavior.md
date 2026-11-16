# Behavior contract

This is the product rule for LANE. If a change breaks one of these, it is a bug.

## Feed

- The only videos that may appear are from the five handles in `HANDLES` inside `src/lib/catalog.functions.ts`.
- Sort is newest estimated publish time first.
- Search matches the video title or the channel name. It never calls YouTube search.
- A channel chip sets `?channel=<handle>`. “All five” clears it. Search and channel filter combine.
- The feed does not show a recommendation row, a “related” row, or videos from any other channel.

## Watch

- The route is `/watch/$videoId`.
- The player loads that one id. It does not set a playlist and it does not autoplay the next video.
- The page copy and layout must not list other videos.
- When the player reports ended, and the playhead is within 1.5 seconds of the duration, LANE covers the frame. The only actions on that cover are replay of the same video, or leaving the page.
- Replay seeks to 0 and clears the saved position for that id.
- An id that is not in the catalog can still play if it is eleven characters of a YouTube id. It still must not offer other videos.

## Resume

Stored per video as `{ t, d, at }` in `localStorage` key `lane.progress.v1`.

| Ratio `t / d` | Meaning | Next open |
| --- | --- | --- |
| under 2%, or `t` under 3 seconds | barely started | start at 0, not listed on Continue |
| 2% to 92% | in progress | `start=<t>` on the embed, listed on Continue |
| 92% or more, or within the last 8 seconds | watched | start at 0, not listed on Continue |

Continue sorts by `at`, newest first.

Saves happen on a 4 second timer while the player exists, on pause, on `visibilitychange` when the tab hides, on `pagehide`, and when the watch page unmounts. A save is skipped when the current time is under 0.4 seconds or the duration is unknown.

## Catalog failure

- First paint uses `src/data/snapshot.ts` so the feed is never blank on a cold open.
- If a live channel fetch fails, that channel’s snapshot rows are kept and the others can still be live.
- If every live fetch fails, the snapshot is the catalog.
- Live data is reused for 20 minutes in the server process, then fetched again.

## Out of scope

- Accounts, sync across devices, comments, likes, subscriptions, and downloads.
- Removing ads that YouTube places inside its own player.
- Any channel that is not in the list of five.
