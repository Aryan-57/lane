import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Avatar } from "./avatar-c6AzgOfu.mjs";
import { a as progressRatio, i as isInProgress, n as formatClock, r as isFinished, t as formatAgo } from "./time-BezPjm6o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/video-card-BLzNI_Jx.js
var import_jsx_runtime = require_jsx_runtime();
function VideoCard({ video, progress, avatar }) {
	const ratio = progressRatio(progress);
	const underway = isInProgress(progress);
	const done = isFinished(progress);
	const ago = formatAgo(video.publishedAt) || video.publishedLabel;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/watch/$videoId",
		params: { videoId: video.id },
		className: "group block rounded-2xl outline-offset-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative overflow-hidden rounded-2xl bg-surface",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: video.thumbnail,
					alt: "",
					className: "aspect-video w-full object-cover",
					loading: "lazy"
				}),
				video.durationLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute right-2 bottom-2 rounded-md bg-bg/85 px-1.5 py-0.5 text-xs font-medium text-fg tabular-nums",
					children: video.durationLabel
				}) : null,
				ratio > .02 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute inset-x-0 bottom-0 h-1 bg-fg/15",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block h-full bg-accent",
						style: { width: `${Math.round(ratio * 100)}%` }
					})
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex gap-3 px-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				src: avatar,
				name: video.channelName,
				className: "mt-0.5 size-9 shrink-0 rounded-full text-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "line-clamp-2 text-base leading-snug font-medium text-balance text-fg group-hover:text-accent",
						children: video.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: video.channelName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							[video.viewsLabel, ago].filter(Boolean).join(" · "),
							underway ? ` · Left at ${formatClock(progress?.t ?? 0)}` : "",
							done ? " · Watched" : ""
						]
					})
				]
			})]
		})]
	}) });
}
//#endregion
export { VideoCard as t };
