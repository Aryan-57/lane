#!/usr/bin/env python3
"""One-shot seed of src/data/snapshot.ts from public YouTube channel pages."""
import json
import re
import time
import urllib.request

HANDLES = [
    "rajshamaniclips",
    "thinkwithshamani",
    "iamparitoshanand",
    "CompileFuture",
    "vaibhavsisinty",
]
UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "replace")


def initial(html: str) -> dict:
    match = re.search(r"var ytInitialData = (\{.*?\});</script>", html)
    if not match:
        raise RuntimeError("no ytInitialData")
    return json.loads(match.group(1))


def content_text(node) -> str:
    if not node:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, dict):
        if isinstance(node.get("content"), str):
            return node["content"]
        if isinstance(node.get("simpleText"), str):
            return node["simpleText"]
        runs = node.get("runs")
        if isinstance(runs, list):
            return "".join((r.get("text") or "") for r in runs if isinstance(r, dict))
    return ""


def estimate_ms(label: str, now_ms: int) -> int:
    s = (label or "").lower()
    if "yesterday" in s:
        return now_ms - 86_400_000
    match = re.search(r"(\d+)\s*(second|minute|hour|day|week|month|year)", s)
    n = None
    unit = None
    if match:
        n = int(match.group(1))
        unit = match.group(2)
    else:
        short = re.search(r"(\d+)\s*(sec|min|h|d|w|mo|yr|y)\b", s)
        if short:
            n = int(short.group(1))
            unit = {
                "sec": "second",
                "min": "minute",
                "h": "hour",
                "d": "day",
                "w": "week",
                "mo": "month",
                "yr": "year",
                "y": "year",
            }[short.group(2)]
    if n is None:
        return now_ms
    mult = {
        "second": 1000,
        "minute": 60_000,
        "hour": 3_600_000,
        "day": 86_400_000,
        "week": 604_800_000,
        "month": 2_592_000_000,
        "year": 31_536_000_000,
    }[unit]
    return now_ms - n * mult


def duration_sec(label: str) -> int:
    if not label or not re.search(r"\d:\d", label):
        return 0
    try:
        nums = [int(p) for p in label.strip().split(":")]
    except ValueError:
        return 0
    sec = 0
    for n in nums:
        sec = sec * 60 + n
    return sec


def find_urls(node, acc=None):
    if acc is None:
        acc = []
    if isinstance(node, dict):
        url = node.get("url")
        if isinstance(url, str) and url.startswith("http"):
            acc.append(url)
        for value in node.values():
            find_urls(value, acc)
    elif isinstance(node, list):
        for value in node:
            find_urls(value, acc)
    return acc


def avatar_from(data: dict) -> str:
    thumbs = (
        data.get("metadata", {})
        .get("channelMetadataRenderer", {})
        .get("avatar", {})
        .get("thumbnails")
        or []
    )
    if thumbs and isinstance(thumbs[-1], dict):
        url = thumbs[-1].get("url") or ""
        if isinstance(url, str) and url:
            return re.sub(r"=s\d+", "=s240", url)
    return ""


def parse_lockup(lock: dict):
    vid = lock.get("contentId") or ""
    if not re.fullmatch(r"[\w-]{11}", vid):
        return None
    title = content_text(
        lock.get("metadata", {}).get("lockupMetadataViewModel", {}).get("title")
    ).strip()
    if not title:
        title = "Untitled"
    views = ""
    published = ""
    rows = (
        lock.get("metadata", {})
        .get("lockupMetadataViewModel", {})
        .get("metadata", {})
        .get("contentMetadataViewModel", {})
        .get("metadataRows")
        or []
    )
    for row in rows:
        for part in row.get("metadataParts") or []:
            label = part.get("accessibilityLabel") or content_text(part.get("text"))
            short = content_text(part.get("text"))
            blob = f"{short} {label}".lower()
            if "view" in blob and not views:
                views = label if "view" in (label or "").lower() else short
            elif any(
                k in blob
                for k in (
                    "ago",
                    "hour",
                    "day",
                    "week",
                    "month",
                    "year",
                    "yesterday",
                    "stream",
                    "premier",
                )
            ):
                published = label or short
    duration = ""
    overlays = (
        lock.get("contentImage", {})
        .get("thumbnailViewModel", {})
        .get("overlays")
        or []
    )
    for overlay in overlays:
        badges = overlay.get("thumbnailBottomOverlayViewModel", {}).get("badges") or []
        for badge in badges:
            text = badge.get("thumbnailBadgeViewModel", {}).get("text")
            if isinstance(text, str) and re.search(r"\d:\d", text):
                duration = text
    return {
        "id": vid,
        "title": title,
        "viewsLabel": views,
        "publishedLabel": published,
        "durationLabel": duration,
        "durationSec": duration_sec(duration),
    }


def walk_videos(node, out):
    if isinstance(node, dict):
        lock = node.get("lockupViewModel")
        if (
            isinstance(lock, dict)
            and lock.get("contentType") == "LOCKUP_CONTENT_TYPE_VIDEO"
        ):
            parsed = parse_lockup(lock)
            if parsed:
                out.append(parsed)
        renderer = node.get("videoRenderer")
        if isinstance(renderer, dict) and renderer.get("videoId"):
            length = content_text(renderer.get("lengthText"))
            out.append(
                {
                    "id": renderer["videoId"],
                    "title": content_text(renderer.get("title")).strip() or "Untitled",
                    "viewsLabel": content_text(renderer.get("viewCountText")),
                    "publishedLabel": content_text(renderer.get("publishedTimeText")),
                    "durationLabel": length,
                    "durationSec": duration_sec(length),
                }
            )
        for value in node.values():
            walk_videos(value, out)
    elif isinstance(node, list):
        for value in node:
            walk_videos(value, out)


def collect_labels(node, acc):
    if isinstance(node, dict):
        text = ""
        if isinstance(node.get("content"), str):
            text = node["content"]
        elif "text" in node:
            text = content_text(node.get("text"))
        if text:
            acc.append(text)
        for value in node.values():
            collect_labels(value, acc)
    elif isinstance(node, list):
        for value in node:
            collect_labels(value, acc)


def main():
    now = int(time.time() * 1000)
    channels = []
    videos = []
    for handle in HANDLES:
        html = fetch(f"https://www.youtube.com/@{handle}/videos")
        data = initial(html)
        meta = data.get("metadata", {}).get("channelMetadataRenderer", {})
        name = (meta.get("title") or handle).strip()
        cid = meta.get("externalId") or ""
        desc = re.sub(r"\s+", " ", meta.get("description") or "").strip()
        desc = re.sub(r"[^\w\s.,'’\"“”!?&:;/+@#%()\-–—]", "", desc).strip()
        header = data.get("header", {})
        labels = []
        collect_labels(header, labels)
        subs = next((t for t in labels if "subscriber" in t.lower()), "")
        count = next(
            (
                t
                for t in labels
                if re.search(r"\bvideos\b", t.lower()) and "subscriber" not in t.lower()
            ),
            "",
        )
        tabs = (
            data.get("contents", {})
            .get("twoColumnBrowseResultsRenderer", {})
            .get("tabs")
            or []
        )
        video_tab = None
        for tab in tabs:
            renderer = tab.get("tabRenderer") or {}
            if renderer.get("title") == "Videos" and renderer.get("content"):
                video_tab = renderer["content"]
                break
        raw = []
        walk_videos(video_tab or {}, raw)
        seen = set()
        clean = []
        for video in raw:
            if video["id"] in seen:
                continue
            seen.add(video["id"])
            clean.append(video)
        channels.append(
            {
                "id": cid,
                "handle": handle,
                "name": name,
                "avatar": avatar_from(data),
                "subscribers": subs,
                "videoCount": count,
                "blurb": desc[:180],
            }
        )
        for video in clean:
            videos.append(
                {
                    **video,
                    "channelId": cid,
                    "channelName": name,
                    "handle": handle,
                    "thumbnail": f"https://i.ytimg.com/vi/{video['id']}/hqdefault.jpg",
                    "publishedAt": estimate_ms(video["publishedLabel"], now),
                }
            )
        print(f"{handle}: {len(clean)} | {name} | {subs} | {count}")
    videos.sort(key=lambda video: video["publishedAt"], reverse=True)
    catalog = {
        "fetchedAt": now,
        "source": "snapshot",
        "channels": channels,
        "videos": videos,
    }
    body = (
        "/* Seeded from public channel pages. Live refresh replaces this. */\n"
        "import type { Catalog } from \"@/lib/types\";\n\n"
        "export const SNAPSHOT: Catalog = "
        + json.dumps(catalog, ensure_ascii=False, indent=2)
        + ";\n"
    )
    path = "/workspace/src/data/snapshot.ts"
    import os

    os.makedirs("/workspace/src/data", exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(body)
    print("TOTAL", len(videos), "->", path)


if __name__ == "__main__":
    main()
