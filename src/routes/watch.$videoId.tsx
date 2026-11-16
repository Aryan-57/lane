import { Avatar } from "@/components/avatar";
import { Player } from "@/components/player";
import { useCatalog } from "@/lib/catalog";
import { readProgress, resumeSeconds } from "@/lib/progress";
import { formatAgo, formatClock } from "@/lib/time";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/watch/$videoId")({
  component: WatchPage,
});

function WatchPage() {
  const { videoId } = Route.useParams();
  const navigate = useNavigate();
  const catalog = useCatalog();
  const video = catalog.videos.find((item) => item.id === videoId);
  const channel = catalog.channels.find((item) => item.handle === video?.handle);
  const [resumeLabel, setResumeLabel] = useState("");
  const valid = useMemo(() => /^[\w-]{11}$/.test(videoId), [videoId]);

  useEffect(() => {
    const seconds = resumeSeconds(readProgress()[videoId]);
    setResumeLabel(seconds > 0 ? formatClock(seconds) : "");
    if (video?.title) document.title = `${video.title} · LANE`;
    return () => {
      document.title = "LANE";
    };
  }, [videoId, video?.title]);

  return (
    <main className="px-4 pt-3 pb-10">
      <button
        type="button"
        className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm text-muted"
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
            return;
          }
          void navigate({ to: "/" });
        }}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back
      </button>

      {valid ? (
        <Player videoId={videoId} fallbackDuration={video?.durationSec ?? 0} />
      ) : (
        <p className="rounded-2xl bg-surface px-4 py-8 text-sm text-muted">That video id isn’t valid.</p>
      )}

      <h1 className="mt-4 text-xl leading-snug font-medium text-balance text-fg">
        {video?.title ?? "This video"}
      </h1>

      {video ? (
        <p className="mt-2 text-sm text-muted">
          {[video.viewsLabel, formatAgo(video.publishedAt) || video.publishedLabel, video.durationLabel]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          This one isn’t in the saved list, so it plays alone. It still won’t queue anything after.
        </p>
      )}

      {resumeLabel ? (
        <p className="mt-2 text-sm text-accent">Resumes at {resumeLabel}.</p>
      ) : null}

      {channel ? (
        <div className="mt-5 flex items-center gap-3">
          <Avatar src={channel.avatar} name={channel.name} className="size-11 rounded-full" />
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{channel.name}</p>
            <p className="text-sm text-muted">{channel.subscribers || "On your list"}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl bg-surface px-4 py-4">
        <p className="text-sm font-medium text-fg">One video. Then stop.</p>
        <p className="mt-1 text-sm text-pretty text-muted">
          Nothing plays next, and this page will not offer other videos. Leave halfway and LANE
          remembers the spot on this phone.
        </p>
      </div>
    </main>
  );
}
