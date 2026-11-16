import { Avatar } from "@/components/avatar";
import { useCatalog } from "@/lib/catalog";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/channels")({
  component: ChannelsPage,
});

function ChannelsPage() {
  const catalog = useCatalog();

  return (
    <main className="px-4 pt-5">
      <header>
        <h1 className="font-display text-4xl leading-none font-semibold tracking-tight">Channels</h1>
        <p className="mt-2 text-sm text-pretty text-muted">
          These five are the whole app. No other channel can appear here.
        </p>
      </header>
      <ul className="mt-6 flex flex-col gap-3">
        {catalog.channels.map((channel) => (
          <li key={channel.handle}>
            <Link
              to="/"
              search={{ channel: channel.handle }}
              className="flex gap-3 rounded-2xl bg-surface p-3"
            >
              <Avatar
                src={channel.avatar}
                name={channel.name}
                className="size-16 shrink-0 rounded-full text-xl"
              />
              <span className="min-w-0 py-0.5">
                <span className="block truncate text-base font-medium text-fg">{channel.name}</span>
                <span className="mt-0.5 block text-sm text-muted">
                  {[channel.subscribers, channel.videoCount].filter(Boolean).join(" · ")}
                </span>
                {channel.blurb ? (
                  <span className="mt-1 line-clamp-2 block text-sm text-pretty text-muted">
                    {channel.blurb}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
