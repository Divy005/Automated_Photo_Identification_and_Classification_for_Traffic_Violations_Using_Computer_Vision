// API clients for the two backends used by this demo.
export const IMAGE_API_BASE =
  (import.meta as any).env?.VITE_IMAGE_API_URL ??
  "https://dv000005-girdlockdeployment.hf.space";

export const VIDEO_API_BASE =
  (import.meta as any).env?.VITE_VIDEO_API_URL ??
  "https://hiraku12-trafficlinedetector.hf.space";

export type Violation = {
  type: string;
  confidence?: number;
  bbox?: number[];
  plate?: string;
  details?: Record<string, unknown>;
  [k: string]: unknown;
};

export type DetectResponse = {
  image_id: string;
  timestamp: string;
  processing_time_ms: number;
  vehicles_detected: Record<string, number> | number;
  violations: Violation[];
  illegal_parking?: Violation[];
  annotated_image_base64?: string;
  annotated_image_path?: string;
};

// ── Image (Gridlock) ───────────────────────────────────────────────────────
export async function detectImage(file: File): Promise<DetectResponse> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(
    `${IMAGE_API_BASE}/detect?return_annotated_image=true&save_annotated=false`,
    { method: "POST", body: fd },
  );
  if (!res.ok) throw new Error(`Detect failed (${res.status}): ${await res.text()}`);
  return res.json();
}

export async function getImageStats(): Promise<any> {
  const res = await fetch(`${IMAGE_API_BASE}/stats`);
  if (!res.ok) throw new Error(`Stats failed (${res.status})`);
  return res.json();
}

export async function listViolations(params: Record<string, string | number> = {}) {
  const q = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((a, [k, v]) => {
      if (v !== undefined && v !== "") a[k] = String(v);
      return a;
    }, {}),
  );
  const res = await fetch(`${IMAGE_API_BASE}/violations?${q.toString()}`);
  if (!res.ok) throw new Error(`List failed (${res.status})`);
  return res.json();
}

// ── Video (Red-light / Stop-line) ──────────────────────────────────────────
export type VideoPreview = {
  /** Object URL to a PNG preview frame with coordinate grid. */
  imageUrl: string;
  width?: number;
  height?: number;
};

/** Fetch the first-frame preview PNG with coordinate grid for ROI selection. */
export async function previewVideo(file: File): Promise<VideoPreview> {
  const fd = new FormData();
  fd.append("video", file);
  const res = await fetch(`${VIDEO_API_BASE}/api/preview`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Preview failed (${res.status}): ${await res.text()}`);
  const ct = res.headers.get("content-type") ?? "";
  if (ct.startsWith("image/")) {
    const blob = await res.blob();
    return { imageUrl: URL.createObjectURL(blob) };
  }
  // Some deployments return JSON with a base64 image instead.
  const j = await res.json();
  const b64 = j.image_base64 ?? j.preview_base64 ?? j.image ?? null;
  if (!b64) throw new Error("Preview response missing image data");
  return { imageUrl: `data:image/png;base64,${b64}`, width: j.width, height: j.height };
}

export type VideoDetectResult = {
  /** Object URL to the annotated MP4 if return_video is true. */
  videoUrl?: string;
  /** Parsed JSON report (from headers when video is returned, body otherwise). */
  report: any;
};

export async function detectVideo(
  file: File,
  lineCoords: string,
  roiCoords: string,
  returnVideo: boolean = true,
): Promise<VideoDetectResult> {
  const fd = new FormData();
  fd.append("video", file);
  fd.append("line_coords", lineCoords);
  fd.append("roi_coords", roiCoords);
  fd.append("return_video", String(returnVideo));

  const path = returnVideo ? "/api/detect" : "/api/detect/json";
  const res = await fetch(`${VIDEO_API_BASE}${path}`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Video detect failed (${res.status}): ${await res.text()}`);

  const ct = res.headers.get("content-type") ?? "";
  if (ct.startsWith("video/")) {
    const blob = await res.blob();
    const videoUrl = URL.createObjectURL(blob);
    // Try to read the JSON report from headers (common keys this API uses).
    const reportHeader =
      res.headers.get("x-report") ??
      res.headers.get("x-violation-report") ??
      res.headers.get("x-detection-report");
    let report: any = null;
    if (reportHeader) {
      try {
        report = JSON.parse(reportHeader);
      } catch {
        report = { raw: reportHeader };
      }
    }
    return { videoUrl, report };
  }
  // JSON response
  const report = await res.json();
  return { report };
}

// ── Helpers ───────────────────────────────────────────────────────────────
// Short, sortable unique detection id: DET-<base36 time>-<rand>
export function newDetectionId(prefix = "DET") {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${t}-${r}`;
}
