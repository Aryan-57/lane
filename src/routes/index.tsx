import { Avatar } from "@/components/avatar";
import { VideoCard } from "@/components/video-card";
import { useCatalog } from "@/lib/catalog";
import { useProgressMap } from "@/lib/progress";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";

type FeedSearch = {
  channel?: string;
  q?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): FeedSearch => ({
    channel: typeof search.channel === "string" && search.channel ? search.channel : undefined,
    q: typeof search.q === "string" && search.q ? search.q : undefined,
  }),
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const catalog = useCatalog();
  const progress = useProgressMap();
  const query = (search.q ?? "").trim().toLowerCase();
  const active = catalog.channels.find((channel) => channel.handle === search.channel);

  const videos = catalog.videos.filter((video) => {
    if (search.channel && video.handle !== search.channel) return false;
    if (!query) return true;
    return (
      video.title.toLowerCase().includes(query) || video.channelName.toLowerCase().includes(query)
    );
  });

  return (
    <main className="px-4 pt-5">
      <header>
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-1 rounded-full bg-accent" aria-hidden="true" />
          <h1 className="font-display text-4xl leading-none font-semibold tracking-tight">LANE</h1>
        </div>
        <p className="mt-2 text-sm text-pretty text-muted">
          {active
            ? `${active.name}. Nothing from anywhere else.`
            : "Five channels. One video at a time. Nothing recommended."}
        </p>
      </header>

      <label className="mt-5 flex items-center gap-2 rounded-full bg-surface px-4 py-3 focus-within:ring-2 focus-within:ring-accent">
        <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
        <input
          value={search.q ?? ""}
          onChange={(event) => {
            const next = event.target.value;
            void navigate({
              search: (prev) => ({ ...prev, q: next.trim() ? next : undefined }),
              replace: true,
            });
          }}
          placeholder="Search only these channels"
          className="w-full bg-transparent text-base text-fg outline-none placeholder:text-muted"
          enterKeyHint="search"
        />
        {search.q ? (
          <button
            type="button"
            aria-label="Clear search"
            className="text-muted"
            onClick={() => {
              void navigate({ search: (prev) => ({ ...prev, q: undefined }), replace: true });
            }}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </label>

      <div className="lane-scroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link
          to="/"
          search={{ channel: undefined, q: search.q }}
          className={`inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium ${
            active ? "bg-surface text-fg" : "bg-accent text-bg"
          }`}
        >
          All five
        </Link>
        {catalog.channels.map((channel) => {
          const selected = channel.handle === search.channel;
          return (
            <Link
              key={channel.handle}
              to="/"
              search={{ channel: channel.handle, q: search.q }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 text-sm font-medium ${
                selected ? "bg-accent text-bg" : "bg-surface text-fg"
              }`}
            >
              <Avatar src={channel.avatar} name={channel.name} className="size-7 rounded-full" />
              {channel.name}
            </Link>
          );
        })}
      </div>

      <p className="mt-5 text-sm text-muted">
        {videos.length === 1 ? "1 video" : `${videos.length} videos`}
      </p>

      {videos.length === 0 ? (
        <p className="mt-8 text-base text-pretty text-muted">
          Nothing in these channels matches that. The rest of YouTube stays out.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-8">
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
