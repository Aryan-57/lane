import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useCatalog } from "./router-CF7vsqhF.mjs";
import { t as Avatar } from "./avatar-c6AzgOfu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/channels-Y593vSso.js
var import_jsx_runtime = require_jsx_runtime();
function ChannelsPage() {
	const catalog = useCatalog();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-4 pt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl leading-none font-semibold tracking-tight",
			children: "Channels"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-pretty text-muted",
			children: "These five are the whole app. No other channel can appear here."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-6 flex flex-col gap-3",
			children: catalog.channels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				search: { channel: channel.handle },
				className: "flex gap-3 rounded-2xl bg-surface p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					src: channel.avatar,
					name: channel.name,
					className: "size-16 shrink-0 rounded-full text-xl"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 py-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-base font-medium text-fg",
							children: channel.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-sm text-muted",
							children: [channel.subscribers, channel.videoCount].filter(Boolean).join(" · ")
						}),
						channel.blurb ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 line-clamp-2 block text-sm text-pretty text-muted",
							children: channel.blurb
						}) : null
					]
				})]
			}) }, channel.handle))
		})]
	});
}
//#endregion
export { ChannelsPage as component };
