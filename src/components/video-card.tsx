import { Avatar } from "@/components/avatar";
import { isFinished, isInProgress, progressRatio } from "@/lib/progress";
import { formatAgo, formatClock } from "@/lib/time";
import type { ProgressEntry, Video } from "@/lib/types";
import { Link } from "@tanstack/react-router";

export function VideoCard({
  video,
  progress,
  avatar,
}: {
  video: Video;
  progress: ProgressEntry | undefined;
  avatar: string;
}) {
  const ratio = progressRatio(progress);
  const underway = isInProgress(progress);
  const done = isFinished(progress);
  const ago = formatAgo(video.publishedAt) || video.publishedLabel;

  return (
    <article>
      <Link
        to="/watch/$videoId"
        params={{ videoId: video.id }}
        className="group block rounded-2xl outline-offset-4"
      >
        <div className="relative overflow-hidden rounded-2xl bg-surface">
          <img
            src={video.thumbnail}
            alt=""
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
          {video.durationLabel ? (
            <span className="absolute right-2 bottom-2 rounded-md bg-bg/85 px-1.5 py-0.5 text-xs font-medium text-fg tabular-nums">
              {video.durationLabel}
            </span>
          ) : null}
          {ratio > 0.02 ? (
            <span className="absolute inset-x-0 bottom-0 h-1 bg-fg/15" aria-hidden="true">
              <span className="block h-full bg-accent" style={{ width: `${Math.round(ratio * 100)}%` }} />
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex gap-3 px-0.5">
          <Avatar src={avatar} name={video.channelName} className="mt-0.5 size-9 shrink-0 rounded-full text-sm" />
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-base leading-snug font-medium text-balance text-fg group-hover:text-accent">
              {video.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{video.channelName}</p>
            <p className="text-sm text-muted">
              {[video.viewsLabel, ago].filter(Boolean).join(" · ")}
              {underway ? ` · Left at ${formatClock(progress?.t ?? 0)}` : ""}
              {done ? " · Watched" : ""}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
