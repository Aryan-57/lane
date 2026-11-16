import { readProgress, resumeSeconds, writeProgress } from "@/lib/progress";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type YtPlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
};

type YtStateEvent = { data: number };

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId?: string;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: YtStateEvent) => void;
          };
        },
      ) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const ENDED = 0;
const PLAYING = 1;

function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("player")), 12_000);
    const finish = () => {
      window.clearTimeout(timer);
      if (window.YT?.Player) resolve();
      else reject(new Error("player"));
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
        reject(new Error("player"));
      };
      document.body.appendChild(script);
    }
  });
}

export function Player({
  videoId,
  fallbackDuration,
  onFinished,
}: {
  videoId: string;
  fallbackDuration: number;
  onFinished?: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const durationRef = useRef(fallbackDuration);
  const finishedRef = useRef(onFinished);
  durationRef.current = fallbackDuration;
  finishedRef.current = onFinished;
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
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
      if (seconds > 0.4 && duration > 0) writeProgress(videoId, seconds, duration);
    };

    const arm = (player: YtPlayer) => {
      window.clearInterval(timer);
      timer = window.setInterval(persist, 4000);
      playerRef.current = player;
    };

    loadApi()
      .then(() => {
        if (cancelled || !mountRef.current || !window.YT?.Player) return;
        const params = new URLSearchParams({
          enablejsapi: "1",
          rel: "0",
          modestbranding: "1",
          iv_load_policy: "3",
          playsinline: "1",
          fs: "1",
          controls: "1",
          origin: window.location.origin,
        });
        if (startAt > 0) params.set("start", String(startAt));
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
        iframe.title = "Video";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.className = "h-full w-full border-0";
        mountRef.current.replaceChildren(iframe);
        const player = new window.YT.Player(iframe, {
          events: {
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
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
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
      } catch {
        /* already gone */
      }
      playerRef.current = null;
    };
  }, [videoId, attempt]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface">
      <div ref={mountRef} className="h-full w-full" />
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
          <p className="text-sm text-muted">The player didn’t load. Your place is still saved.</p>
          <button
            type="button"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-bg"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      ) : null}
      {ended ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-bg/95 px-6 text-center">
          <p className="font-display text-3xl text-fg">Finished.</p>
          <p className="max-w-xs text-sm text-pretty text-muted">
            Nothing is queued. This screen does not suggest another video.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-bg"
            onClick={() => {
              const player = playerRef.current;
              setEnded(false);
              if (!player) return;
              const duration = player.getDuration?.() || fallbackDuration;
              writeProgress(videoId, 0, duration);
              player.seekTo(0, true);
              player.playVideo();
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Play again
          </button>
        </div>
      ) : null}
    </div>
  );
}
