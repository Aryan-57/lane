import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useCatalog } from "./router-CF7vsqhF.mjs";
import { c as useProgressMap, i as isInProgress } from "./time-BezPjm6o.mjs";
import { t as VideoCard } from "./video-card-BLzNI_Jx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/continue-so_r8gbJ.js
var import_jsx_runtime = require_jsx_runtime();
function ContinuePage() {
	const catalog = useCatalog();
	const progress = useProgressMap();
	const videos = catalog.videos.filter((video) => isInProgress(progress[video.id])).sort((a, b) => (progress[b.id]?.at ?? 0) - (progress[a.id]?.at ?? 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-4 pt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl leading-none font-semibold tracking-tight",
			children: "Continue"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-pretty text-muted",
			children: "Half-watched videos wait here. Close the app and they pick up where you left them."
		})] }), videos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-10 rounded-2xl bg-surface px-5 py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base text-pretty text-fg",
					children: "Nothing in progress."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-pretty text-muted",
					children: "Start a video, leave it, and come back. It will not jump to something else."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-5 inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-bg",
					children: "Back to the feed"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 flex flex-col gap-8",
			children: videos.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
				video,
				avatar: catalog.channels.find((channel) => channel.handle === video.handle)?.avatar ?? "",
				progress: progress[video.id]
			}, video.id))
		})]
	});
}
//#endregion
export { ContinuePage as component };
