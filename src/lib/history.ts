// Client-side detection history, persisted to localStorage so analytics stay
// consistent across reloads and survive navigation between tabs.
//
// Everything here is browser-only and guards against SSR (no `window`).

import type { DetectResponse, Violation } from "./api";

export type HistoryViolation = {
  type: string;
  confidence?: number;
  plate?: string;
};

export type DetectionRecord = {
  id: string;
  timestamp: string;
  source: "image" | "video";
  fileName?: string;
  processingMs?: number;
  vehicles: number;
  violations: HistoryViolation[];
};

const KEY = "trafficai.history.v1";
const EVENT = "trafficai:history";
const MAX_RECORDS = 200;

/** Pull a license-plate string out of a violation, wherever the backend put it. */
export function getPlate(v: Record<string, unknown> | Violation): string | null {
  const raw =
    (v as any)?.plate ??
    (v as any)?.license_plate ??
    (v as any)?.plate_number ??
    (v as any)?.number_plate ??
    (v as any)?.details?.plate ??
    (v as any)?.details?.license_plate ??
    null;
  if (raw == null) return null;
  const s = String(raw).trim();
  return s && s.toLowerCase() !== "unknown" && s !== "-" ? s : null;
}

/**
 * Heuristic "how good is this plate read" score, used to surface the
 * best-detected plates first. Higher is better; no plate scores 0.
 */
export function plateQuality(v: Record<string, unknown> | Violation): number {
  const plate = getPlate(v);
  if (!plate) return 0;
  const conf = typeof (v as any).confidence === "number" ? (v as any).confidence : 0.5;
  // Plates around 8–10 chars (typical Indian format) read as the most complete.
  const cleaned = plate.replace(/[^A-Za-z0-9]/g, "");
  const lengthScore = Math.min(cleaned.length, 10) / 10;
  return 1 + conf * 0.6 + lengthScore * 0.4; // always > any plate-less violation
}

function read(): DetectionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(records: DetectionRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* quota / private-mode — ignore, analytics just won't persist */
  }
}

export function getHistory(): DetectionRecord[] {
  return read();
}

export function clearHistory() {
  write([]);
}

/** Append an image detection result to the history. */
export function recordImageDetection(
  id: string,
  res: DetectResponse,
  fileName?: string,
): DetectionRecord {
  const vehicles =
    typeof res.vehicles_detected === "number"
      ? res.vehicles_detected
      : Object.values(res.vehicles_detected ?? {}).reduce((a, b) => a + Number(b || 0), 0);

  const violations: HistoryViolation[] = (res.violations ?? []).map((v) => ({
    type: String(v.type ?? "violation"),
    confidence: typeof v.confidence === "number" ? v.confidence : undefined,
    plate: getPlate(v) ?? undefined,
  }));

  const record: DetectionRecord = {
    id,
    timestamp: res.timestamp || new Date().toISOString(),
    source: "image",
    fileName,
    processingMs: typeof res.processing_time_ms === "number" ? res.processing_time_ms : undefined,
    vehicles,
    violations,
  };

  write([record, ...read()]);
  return record;
}

/** Append a generic record (used by video inference). */
export function recordDetection(record: DetectionRecord) {
  write([record, ...read()]);
}

/** Subscribe to history changes (same-tab via custom event, cross-tab via storage). */
export function onHistoryChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export type Aggregates = {
  totalDetections: number;
  totalViolations: number;
  avgConfidence: number | null;
  byType: { name: string; key: string; value: number }[];
  recent: { type: string; plate: string | null; confidence: number | null; timestamp: string; source: string }[];
  plates: { plate: string; type: string; confidence: number | null; timestamp: string }[];
};

const TYPE_LABELS: Record<string, string> = {
  no_helmet: "Helmet Non-compliance",
  helmet: "Helmet Detected",
  triple_riding: "Triple Riding",
  wrong_side: "Wrong-side Driving",
  stop_line: "Stop-line Violation",
  red_light: "Red-light Violation",
  illegal_parking: "Illegal Parking",
};

export function labelForType(t: string): string {
  return (
    TYPE_LABELS[t] ?? t.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())
  );
}

/** Compute analytics aggregates from the persisted history. */
export function aggregate(records: DetectionRecord[] = getHistory()): Aggregates {
  const byTypeMap = new Map<string, number>();
  const confidences: number[] = [];
  const recent: Aggregates["recent"] = [];
  const plates: Aggregates["plates"] = [];
  let totalViolations = 0;

  for (const rec of records) {
    for (const v of rec.violations) {
      totalViolations += 1;
      byTypeMap.set(v.type, (byTypeMap.get(v.type) ?? 0) + 1);
      if (typeof v.confidence === "number") confidences.push(v.confidence);
      recent.push({
        type: v.type,
        plate: v.plate ?? null,
        confidence: v.confidence ?? null,
        timestamp: rec.timestamp,
        source: rec.source,
      });
      if (v.plate) {
        plates.push({
          plate: v.plate,
          type: v.type,
          confidence: v.confidence ?? null,
          timestamp: rec.timestamp,
        });
      }
    }
  }

  const byType = [...byTypeMap.entries()]
    .map(([key, value]) => ({ key, name: labelForType(key), value }))
    .sort((a, b) => b.value - a.value);

  return {
    totalDetections: records.length,
    totalViolations,
    avgConfidence: confidences.length
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : null,
    byType,
    recent: recent.slice(0, 25),
    plates: plates
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
      .slice(0, 25),
  };
}
