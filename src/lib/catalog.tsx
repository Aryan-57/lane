import { SNAPSHOT } from "@/data/snapshot";
import { getCatalog } from "@/lib/catalog.functions";
import type { Catalog } from "@/lib/types";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const CACHE_KEY = "lane.catalog.v1";

const CatalogContext = createContext<Catalog>(SNAPSHOT);

function isCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== "object") return false;
  const catalog = value as Catalog;
  return Array.isArray(catalog.videos) && catalog.videos.length > 0 && Array.isArray(catalog.channels);
}

function readCache(): Catalog | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCatalog(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>(SNAPSHOT);

  useEffect(() => {
    const cached = readCache();
    if (cached && cached.fetchedAt >= SNAPSHOT.fetchedAt) setCatalog(cached);

    let cancelled = false;
    getCatalog()
      .then((next) => {
        if (cancelled || !isCatalog(next)) return;
        setCatalog(next);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {
          /* cache is optional */
        }
      })
      .catch(() => {
        /* snapshot or the last cache stays on screen */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  return useContext(CatalogContext);
}
