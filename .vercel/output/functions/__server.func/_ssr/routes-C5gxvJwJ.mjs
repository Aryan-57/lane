import { C as require_jsx_runtime, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Search, t as X } from "../_libs/lucide-react.mjs";
import { i as useCatalog, r as Route$3 } from "./router-CF7vsqhF.mjs";
import { t as Avatar } from "./avatar-c6AzgOfu.mjs";
import { c as useProgressMap } from "./time-BezPjm6o.mjs";
import { t as VideoCard } from "./video-card-BLzNI_Jx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C5gxvJwJ.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const search = Route$3.useSearch();
	const navigate = useNavigate({ from: "/" });
	const catalog = useCatalog();
	const progress = useProgressMap();
	const query = (search.q ?? "").trim().toLowerCase();
	const active = catalog.channels.find((channel) => channel.handle === search.channel);
	const videos = catalog.videos.filter((video) => {
		if (search.channel && video.handle !== search.channel) return false;
		if (!query) return true;
		return video.title.toLowerCase().includes(query) || video.channelName.toLowerCase().includes(query);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-4 pt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "h-6 w-1 rounded-full bg-accent",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl leading-none font-semibold tracking-tight",
					children: "LANE"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-pretty text-muted",
				children: active ? `${active.name}. Nothing from anywhere else.` : "Five channels. One video at a time. Nothing recommended."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-5 flex items-center gap-2 rounded-full bg-surface px-4 py-3 focus-within:ring-2 focus-within:ring-accent",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "size-4 shrink-0 text-muted",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: search.q ?? "",
						onChange: (event) => {
							const next = event.target.value;
							navigate({
								search: (prev) => ({
									...prev,
									q: next.trim() ? next : void 0
								}),
								replace: true
							});
						},
						placeholder: "Search only these channels",
						className: "w-full bg-transparent text-base text-fg outline-none placeholder:text-muted",
						enterKeyHint: "search"
					}),
					search.q ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Clear search",
						className: "text-muted",
						onClick: () => {
							navigate({
								search: (prev) => ({
									...prev,
									q: void 0
								}),
								replace: true
							});
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lane-scroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					search: {
						channel: void 0,
						q: search.q
					},
					className: `inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-surface text-fg" : "bg-accent text-bg"}`,
					children: "All five"
				}), catalog.channels.map((channel) => {
					const selected = channel.handle === search.channel;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						search: {
							channel: channel.handle,
							q: search.q
						},
						className: `inline-flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 text-sm font-medium ${selected ? "bg-accent text-bg" : "bg-surface text-fg"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							src: channel.avatar,
							name: channel.name,
							className: "size-7 rounded-full"
						}), channel.name]
					}, channel.handle);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-sm text-muted",
				children: videos.length === 1 ? "1 video" : `${videos.length} videos`
			}),
			videos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-base text-pretty text-muted",
				children: "Nothing in these channels matches that. The rest of YouTube stays out."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-col gap-8",
				children: videos.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
					video,
					avatar: catalog.channels.find((channel) => channel.handle === video.handle)?.avatar ?? "",
					progress: progress[video.id]
				}, video.id))
			})
		]
	});
}
//#endregion
export { Home as component };
