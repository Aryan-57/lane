import type { ProgressEntry, ProgressMap } from "@/lib/types";
import { useEffect, useState } from "react";

const KEY = "lane.progress.v1";
const EVENT = "lane-progress";

export function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as ProgressMap;
  } catch {
    return {};
  }
}

export function writeProgress(videoId: string, seconds: number, duration: number) {
  if (typeof window === "undefined") return;
  const map = readProgress();
  const t = Math.max(0, seconds);
  const d = Math.max(0, duration);
  map[videoId] = { t, d, at: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* private mode or a full disk — playback still works this session */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useProgressMap(): ProgressMap {
  const [map, setMap] = useState<ProgressMap>({});
  useEffect(() => {
    const sync = () => setMap(readProgress());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return map;
}

export function progressRatio(entry: ProgressEntry | undefined): number {
  if (!entry || entry.d <= 0) return 0;
  return Math.min(1, Math.max(0, entry.t / entry.d));
}

export function isInProgress(entry: ProgressEntry | undefined): boolean {
  const ratio = progressRatio(entry);
  return ratio > 0.02 && ratio < 0.92;
}

export function isFinished(entry: ProgressEntry | undefined): boolean {
  return progressRatio(entry) >= 0.92;
}

/** Where playback should open. Finished videos start over. */
export function resumeSeconds(entry: ProgressEntry | undefined): number {
  if (!entry || isFinished(entry) || entry.t < 3) return 0;
  if (entry.d > 0 && entry.t > entry.d - 8) return 0;
  return Math.floor(entry.t);
}
