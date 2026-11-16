import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { t as SNAPSHOT } from "./snapshot-CvOjDrfD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog.functions-DseEiIyU.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function isObj(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function contentText(node) {
	if (typeof node === "string") return node;
	if (!isObj(node)) return "";
	if (typeof node.content === "string") return node.content;
	if (typeof node.simpleText === "string") return node.simpleText;
	if (Array.isArray(node.runs)) return node.runs.map((run) => isObj(run) && typeof run.text === "string" ? run.text : "").join("");
	return "";
}
function estimatePublishedAt(label, now) {
	const s = label.toLowerCase();
	if (s.includes("yesterday")) return now - 864e5;
	const long = s.match(/(\d+)\s*(second|minute|hour|day|week|month|year)/);
	let amount = null;
	let unit = null;
	if (long?.[1] && long[2]) {
		amount = Number(long[1]);
		unit = long[2];
	} else {
		const short = s.match(/(\d+)\s*(sec|min|h|d|w|mo|yr|y)\b/);
		const mapped = {
			sec: "second",
			min: "minute",
			h: "hour",
			d: "day",
			w: "week",
			mo: "month",
			yr: "year",
			y: "year"
		};
		if (short?.[1] && short[2] && mapped[short[2]]) {
			amount = Number(short[1]);
			unit = mapped[short[2]];
		}
	}
	if (amount === null || !unit) return 0;
	return now - amount * ({
		second: 1e3,
		minute: 6e4,
		hour: 36e5,
		day: 864e5,
		week: 6048e5,
		month: 2592e6,
		year: 31536e6
	}[unit] ?? 0);
}
function durationSec(label) {
	if (!/\d:\d/.test(label)) return 0;
	const nums = label.split(":").map((part) => Number(part));
	if (nums.some((n) => Number.isNaN(n))) return 0;
	return nums.reduce((total, n) => total * 60 + n, 0);
}
function cleanBlurb(text) {
	return text.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim().slice(0, 180);
}
function avatarFrom(data) {
	const meta = isObj(data.metadata) ? data.metadata : null;
	const renderer = meta && isObj(meta.channelMetadataRenderer) ? meta.channelMetadataRenderer : null;
	const avatar = renderer && isObj(renderer.avatar) ? renderer.avatar : null;
	const last = (avatar && Array.isArray(avatar.thumbnails) ? avatar.thumbnails : []).at(-1);
	if (isObj(last) && typeof last.url === "string") return last.url.replace(/=s\d+/, "=s240");
	return "";
}
function parseLockup(lock) {
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
			const label = typeof part.accessibilityLabel === "string" ? part.accessibilityLabel : contentText(part.text);
			const short = contentText(part.text);
			const blob = `${short} ${label}`.toLowerCase();
			if (blob.includes("view") && !views) views = label.toLowerCase().includes("view") ? label : short;
			else if ([
				"ago",
				"hour",
				"day",
				"week",
				"month",
				"year",
				"yesterday",
				"stream",
				"premier"
			].some((key) => blob.includes(key))) published = label || short;
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
		durationSec: durationSec(duration)
	};
}
function walkVideos(node, out) {
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
			durationSec: durationSec(length)
		});
	}
	for (const value of Object.values(node)) walkVideos(value, out);
}
function collectLabels(node, acc) {
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
function parseChannelPage(data, handle, now) {
	if (!isObj(data)) return null;
	const metaWrap = isObj(data.metadata) ? data.metadata : {};
	const meta = isObj(metaWrap.channelMetadataRenderer) ? metaWrap.channelMetadataRenderer : {};
	const name = (typeof meta.title === "string" ? meta.title : handle).trim() || handle;
	const id = typeof meta.externalId === "string" ? meta.externalId : "";
	const description = typeof meta.description === "string" ? meta.description : "";
	const labels = [];
	collectLabels(data.header, labels);
	const subscribers = labels.find((label) => label.toLowerCase().includes("subscriber")) ?? "";
	const videoCount = labels.find((label) => /\bvideos\b/i.test(label) && !label.toLowerCase().includes("subscriber")) ?? "";
	const contents = isObj(data.contents) ? data.contents : {};
	const browse = isObj(contents.twoColumnBrowseResultsRenderer) ? contents.twoColumnBrowseResultsRenderer : {};
	const tabs = Array.isArray(browse.tabs) ? browse.tabs : [];
	let videoTab = null;
	for (const tab of tabs) {
		if (!isObj(tab) || !isObj(tab.tabRenderer)) continue;
		if (tab.tabRenderer.title === "Videos" && tab.tabRenderer.content) {
			videoTab = tab.tabRenderer.content;
			break;
		}
	}
	const raw = [];
	walkVideos(videoTab ?? {}, raw);
	const seen = /* @__PURE__ */ new Set();
	const videos = [];
	for (const video of raw) {
		if (seen.has(video.id)) continue;
		seen.add(video.id);
		videos.push({
			...video,
			channelId: id,
			channelName: name,
			handle,
			thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
			publishedAt: estimatePublishedAt(video.publishedLabel, now)
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
			blurb: cleanBlurb(description)
		},
		videos
	};
}
function extractInitialData(html) {
	const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
	if (!match?.[1]) return null;
	try {
		return JSON.parse(match[1]);
	} catch {
		return null;
	}
}
var TTL_MS = 12e5;
var memory = null;
var HANDLES = [
	"rajshamaniclips",
	"thinkwithshamani",
	"iamparitoshanand",
	"CompileFuture",
	"vaibhavsisinty"
];
async function fetchHandle(handle, now) {
	const response = await fetch(`https://www.youtube.com/@${handle}/videos`, {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
			"Accept-Language": "en-US,en;q=0.9"
		},
		signal: AbortSignal.timeout(18e3)
	});
	if (!response.ok) return null;
	const data = extractInitialData(await response.text());
	if (!data) return null;
	const parsed = parseChannelPage(data, handle, now);
	if (!parsed || parsed.videos.length === 0) return null;
	return parsed;
}
async function loadLive() {
	const now = Date.now();
	if (memory && now - memory.at < TTL_MS) return memory.catalog;
	const pages = await Promise.all(HANDLES.map(async (handle) => {
		try {
			return await fetchHandle(handle, now);
		} catch {
			return null;
		}
	}));
	const channels = [];
	const videos = [];
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
	const catalog = {
		fetchedAt: now,
		source: liveCount > 0 ? "live" : "snapshot",
		channels: channels.length ? channels : SNAPSHOT.channels,
		videos: videos.length ? videos : SNAPSHOT.videos
	};
	memory = {
		at: now,
		catalog
	};
	return catalog;
}
var getCatalog_createServerFn_handler = createServerRpc({
	id: "2a45d9b79d4ba9547992f1eac18039c2bae0ddf7df7670a8638b3bf5e0a6962f",
	name: "getCatalog",
	filename: "src/lib/catalog.functions.ts"
}, (opts) => getCatalog.__executeServer(opts));
var getCatalog = createServerFn({ method: "GET" }).handler(getCatalog_createServerFn_handler, async () => {
	try {
		return await loadLive();
	} catch {
		return SNAPSHOT;
	}
});
//#endregion
export { getCatalog_createServerFn_handler };
