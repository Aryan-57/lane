import { i as __toESM } from "../_runtime.mjs";
import { X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/time-BezPjm6o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "lane.progress.v1";
var EVENT = "lane-progress";
function readProgress() {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return {};
		return parsed;
	} catch {
		return {};
	}
}
function writeProgress(videoId, seconds, duration) {
	if (typeof window === "undefined") return;
	const map = readProgress();
	map[videoId] = {
		t: Math.max(0, seconds),
		d: Math.max(0, duration),
		at: Date.now()
	};
	try {
		localStorage.setItem(KEY, JSON.stringify(map));
	} catch {}
	window.dispatchEvent(new Event(EVENT));
}
function useProgressMap() {
	const [map, setMap] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		const sync = () => setMap(readProgress());
		sync();
		window.addEventListener(EVENT, sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	return map;
}
function progressRatio(entry) {
	if (!entry || entry.d <= 0) return 0;
	return Math.min(1, Math.max(0, entry.t / entry.d));
}
function isInProgress(entry) {
	const ratio = progressRatio(entry);
	return ratio > .02 && ratio < .92;
}
function isFinished(entry) {
	return progressRatio(entry) >= .92;
}
/** Where playback should open. Finished videos start over. */
function resumeSeconds(entry) {
	if (!entry || isFinished(entry) || entry.t < 3) return 0;
	if (entry.d > 0 && entry.t > entry.d - 8) return 0;
	return Math.floor(entry.t);
}
function formatAgo(publishedAt, now = Date.now()) {
	if (!publishedAt) return "";
	const delta = Math.max(0, now - publishedAt);
	const minutes = Math.round(delta / 6e4);
	if (minutes < 1) return "just now";
	if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
	const days = Math.round(hours / 24);
	if (days < 14) return days === 1 ? "1 day ago" : `${days} days ago`;
	const weeks = Math.round(days / 7);
	if (weeks < 8) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
	const months = Math.round(days / 30);
	if (months < 18) return months === 1 ? "1 month ago" : `${months} months ago`;
	const years = Math.max(1, Math.round(days / 365));
	return years === 1 ? "1 year ago" : `${years} years ago`;
}
function formatClock(totalSeconds) {
	if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
	const seconds = Math.floor(totalSeconds % 60);
	const minutes = Math.floor(totalSeconds / 60) % 60;
	const hours = Math.floor(totalSeconds / 3600);
	const pad = (value) => value.toString().padStart(2, "0");
	if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
	return `${minutes}:${pad(seconds)}`;
}
//#endregion
export { progressRatio as a, useProgressMap as c, isInProgress as i, writeProgress as l, formatClock as n, readProgress as o, isFinished as r, resumeSeconds as s, formatAgo as t };
