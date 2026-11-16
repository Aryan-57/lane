import { VideoCard } from "@/components/video-card";
import { useCatalog } from "@/lib/catalog";
import { isInProgress, useProgressMap } from "@/lib/progress";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/continue")({
  component: ContinuePage,
});

function ContinuePage() {
  const catalog = useCatalog();
  const progress = useProgressMap();
  const videos = catalog.videos
    .filter((video) => isInProgress(progress[video.id]))
    .sort((a, b) => (progress[b.id]?.at ?? 0) - (progress[a.id]?.at ?? 0));

  return (
    <main className="px-4 pt-5">
      <header>
        <h1 className="font-display text-4xl leading-none font-semibold tracking-tight">Continue</h1>
        <p className="mt-2 text-sm text-pretty text-muted">
          Half-watched videos wait here. Close the app and they pick up where you left them.
        </p>
      </header>
      {videos.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-surface px-5 py-8">
          <p className="text-base text-pretty text-fg">Nothing in progress.</p>
          <p className="mt-2 text-sm text-pretty text-muted">
            Start a video, leave it, and come back. It will not jump to something else.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-bg"
          >
            Back to the feed
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              avatar={catalog.channels.find((channel) => channel.handle === video.handle)?.avatar ?? ""}
              progress={progress[video.id]}
            />
          ))}
        </div>
      )}
    </main>
  );
}
