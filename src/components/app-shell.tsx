import { useRouterState } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Clapperboard, History, House } from "lucide-react";
import type { ReactNode } from "react";

const TABS = [
  { to: "/", label: "Feed", icon: House, exact: true },
  { to: "/continue", label: "Continue", icon: History, exact: false },
  { to: "/channels", label: "Channels", icon: Clapperboard, exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const watching = path.startsWith("/watch");

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className={`mx-auto w-full max-w-lg ${watching ? "min-h-dvh" : "lane-pad min-h-dvh"}`}>
        {children}
      </div>
      {watching ? null : (
        <nav className="lane-nav fixed inset-x-0 bottom-0 z-20 border-t border-fg/10 bg-bg/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg">
            {TABS.map((tab) => {
              const active = tab.exact ? path === tab.to : path.startsWith(tab.to);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
