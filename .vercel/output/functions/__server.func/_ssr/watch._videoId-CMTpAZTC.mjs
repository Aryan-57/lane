import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as ChevronLeft, i as RotateCcw } from "../_libs/lucide-react.mjs";
import { i as useCatalog, n as Route } from "./router-CF7vsqhF.mjs";
import { t as Avatar } from "./avatar-c6AzgOfu.mjs";
import { l as writeProgress, n as formatClock, o as readProgress, s as resumeSeconds, t as formatAgo } from "./time-BezPjm6o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watch._videoId-CMTpAZTC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ENDED = 0;
var PLAYING = 1;
function loadApi() {
	if (window.YT?.Player) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const timer = window.setTimeout(() => reject(/* @__PURE__ */ new Error("player")), 12e3);
		const finish = () => {
			window.clearTimeout(timer);
			if (window.YT?.Player) resolve();
			else reject(/* @__PURE__ */ new Error("player"));
		};
		const previous = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			previous?.();
			finish();
		};
		if (!document.querySelector("script[data-lane-yt]")) {
			const script = document.createElement("script");
			script.src = "https://www.youtube.com/iframe_api";
			script.dataset.laneYt = "1";
			script.onerror = () => {
				window.clearTimeout(timer);
				reject(/* @__PURE__ */ new Error("player"));
			};
			document.body.appendChild(script);
		}
	});
}
function Player({ videoId, fallbackDuration, onFinished }) {
	const mountRef = (0, import_react.useRef)(null);
	const playerRef = (0, import_react.useRef)(null);
	const durationRef = (0, import_react.useRef)(fallbackDuration);
	const finishedRef = (0, import_react.useRef)(onFinished);
	durationRef.current = fallbackDuration;
	finishedRef.current = onFinished;
	const [ended, setEnded] = (0, import_react.useState)(false);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!mountRef.current) return;
		let cancelled = false;
		let timer = 0;
		setEnded(false);
		setFailed(false);
		const startAt = resumeSeconds(readProgress()[videoId]);
		const persist = () => {
			const player = playerRef.current;
			if (!player) return;
			const seconds = player.getCurrentTime?.() ?? 0;
			const duration = player.getDuration?.() || durationRef.current;
			if (seconds > .4 && duration > 0) writeProgress(videoId, seconds, duration);
		};
		const arm = (player) => {
			window.clearInterval(timer);
			timer = window.setInterval(persist, 4e3);
			playerRef.current = player;
		};
		loadApi().then(() => {
			if (cancelled || !mountRef.current || !window.YT?.Player) return;
			const params = new URLSearchParams({
				enablejsapi: "1",
				rel: "0",
				modestbranding: "1",
				iv_load_policy: "3",
				playsinline: "1",
				fs: "1",
				controls: "1",
				origin: window.location.origin
			});
			if (startAt > 0) params.set("start", String(startAt));
			const iframe = document.createElement("iframe");
			iframe.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
			iframe.title = "Video";
			iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
			iframe.allowFullscreen = true;
			iframe.referrerPolicy = "strict-origin-when-cross-origin";
			iframe.className = "h-full w-full border-0";
			mountRef.current.replaceChildren(iframe);
			const player = new window.YT.Player(iframe, { events: {
				onReady: () => {
					if (cancelled) return;
					arm(player);
				},
				onStateChange: (event) => {
					if (cancelled) return;
					if (event.data === PLAYING) arm(player);
					else persist();
					if (event.data === ENDED) {
						const duration = player.getDuration?.() || durationRef.current;
						const seconds = player.getCurrentTime?.() ?? 0;
						if (duration > 0 && seconds >= duration - 1.5) {
							writeProgress(videoId, duration, duration);
							setEnded(true);
							finishedRef.current?.();
						}
					}
				}
			} });
			playerRef.current = player;
		}).catch(() => {
			if (!cancelled) setFailed(true);
		});
		const onHide = () => {
			if (document.hidden) persist();
		};
		document.addEventListener("visibilitychange", onHide);
		window.addEventListener("pagehide", persist);
		return () => {
			cancelled = true;
			persist();
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", onHide);
			window.removeEventListener("pagehide", persist);
			try {
				playerRef.current?.destroy();
			} catch {}
			playerRef.current = null;
		};
	}, [videoId, attempt]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative aspect-video w-full overflow-hidden rounded-2xl bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: mountRef,
				className: "h-full w-full"
			}),
			failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg px-6 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "The player didn’t load. Your place is still saved."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-full bg-accent px-4 py-2 text-sm font-medium text-bg",
					onClick: () => setAttempt((value) => value + 1),
					children: "Try again"
				})]
			}) : null,
			ended ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-bg/95 px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl text-fg",
						children: "Finished."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xs text-sm text-pretty text-muted",
						children: "Nothing is queued. This screen does not suggest another video."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-bg",
						onClick: () => {
							const player = playerRef.current;
							setEnded(false);
							if (!player) return;
							const duration = player.getDuration?.() || fallbackDuration;
							writeProgress(videoId, 0, duration);
							player.seekTo(0, true);
							player.playVideo();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Play again"]
					})
				]
			}) : null
		]
	});
}
function WatchPage() {
	const { videoId } = Route.useParams();
	const navigate = useNavigate();
	const catalog = useCatalog();
	const video = catalog.videos.find((item) => item.id === videoId);
	const channel = catalog.channels.find((item) => item.handle === video?.handle);
	const [resumeLabel, setResumeLabel] = (0, import_react.useState)("");
	const valid = (0, import_react.useMemo)(() => /^[\w-]{11}$/.test(videoId), [videoId]);
	(0, import_react.useEffect)(() => {
		const seconds = resumeSeconds(readProgress()[videoId]);
		setResumeLabel(seconds > 0 ? formatClock(seconds) : "");
		if (video?.title) document.title = `${video.title} · LANE`;
		return () => {
			document.title = "LANE";
		};
	}, [videoId, video?.title]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-4 pt-3 pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mb-3 inline-flex min-h-11 items-center gap-1 text-sm text-muted",
				onClick: () => {
					if (window.history.length > 1) {
						window.history.back();
						return;
					}
					navigate({ to: "/" });
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-4",
					"aria-hidden": "true"
				}), "Back"]
			}),
			valid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {
				videoId,
				fallbackDuration: video?.durationSec ?? 0
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl bg-surface px-4 py-8 text-sm text-muted",
				children: "That video id isn’t valid."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-xl leading-snug font-medium text-balance text-fg",
				children: video?.title ?? "This video"
			}),
			video ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					video.viewsLabel,
					formatAgo(video.publishedAt) || video.publishedLabel,
					video.durationLabel
				].filter(Boolean).join(" · ")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "This one isn’t in the saved list, so it plays alone. It still won’t queue anything after."
			}),
			resumeLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-accent",
				children: [
					"Resumes at ",
					resumeLabel,
					"."
				]
			}) : null,
			channel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					src: channel.avatar,
					name: channel.name,
					className: "size-11 rounded-full"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-medium text-fg",
						children: channel.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: channel.subscribers || "On your list"
					})]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-2xl bg-surface px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "One video. Then stop."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-pretty text-muted",
					children: "Nothing plays next, and this page will not offer other videos. Leave halfway and LANE remembers the spot on this phone."
				})]
			})
		]
	});
}
//#endregion
export { WatchPage as component };
