import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, TrafficCone, Hash, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { UploadDropzone } from "./UploadDropzone";
import { ProgressBar } from "./ProgressBar";
import {
  detectVideo,
  newDetectionId,
  previewVideo,
  type VideoDetectResult,
  type VideoPreview,
} from "@/lib/api";
import { recordDetection, getPlate } from "@/lib/history";

const VIDEO_ETA_MS = 5 * 60_000;

// Coordinates are entered relative to the preview frame the backend returns.
// Defaults match a typical intersection layout — adjust to your own scene.
const DEFAULT_LINE = "100,440,900,500";
const DEFAULT_ROI = "870,120,930,200";

export function VideoInference() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [lineCoords, setLineCoords] = useState(DEFAULT_LINE);
  const [roiCoords, setRoiCoords] = useState(DEFAULT_ROI);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoDetectResult | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [ts, setTs] = useState<string | null>(null);

  // Auto-fetch preview frame as soon as a file is selected.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setPreview(null);
    setPreviewing(true);
    setError(null);
    previewVideo(file)
      .then((p) => {
        if (!cancelled) setPreview(p);
      })
      .catch((e) => {
        if (!cancelled) setError(`Preview failed: ${e?.message ?? e}`);
      })
      .finally(() => {
        if (!cancelled) setPreviewing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const run = async () => {
    if (!file) return;
    const detId = newDetectionId("VID");
    const detTs = new Date().toISOString();
    setError(null);
    setResult(null);
    setRunning(true);
    setId(detId);
    setTs(detTs);
    try {
      const r = await detectVideo(file, lineCoords.trim(), roiCoords.trim(), true);
      setResult(r);
      // Persist to local history so Analytics reflects this run.
      const vios = extractViolations(r.report);
      recordDetection({
        id: detId,
        timestamp: detTs,
        source: "video",
        fileName: file.name,
        vehicles: 0,
        violations: vios.map((v) => ({
          type: String(v.type ?? v.violation ?? v.label ?? "violation"),
          confidence: typeof v.confidence === "number" ? v.confidence : undefined,
          plate: getPlate(v) ?? undefined,
        })),
      });
    } catch (e: any) {
      setError(e?.message ?? "Video detection failed");
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setId(null);
    setTs(null);
  };

  const violations = extractViolations(result?.report);

  return (
    <div className="grid gap-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/20">
              <TrafficCone className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Video Inference</h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                Stop-line and red-light violation detection from short surveillance clips.
                Estimated processing time:{" "}
                <span className="text-foreground font-medium">~5 minutes</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              disabled={running || (!file && !result)}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-sm hover:bg-accent disabled:opacity-50"
            >
              <RotateCcw className="size-4" /> Reset
            </button>
            <button
              onClick={run}
              disabled={!file || running || !lineCoords || !roiCoords}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Play className="size-4" />
              {running ? "Processing…" : "Run Detection"}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <UploadDropzone
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
            file={file}
            onFile={setFile}
            onClear={reset}
            disabled={running}
            hint="MP4, MOV, AVI or WEBM · intersection clip"
          />
        </div>

        {file && (
          <div className="mt-5 grid gap-5 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-lg border border-border bg-background/40 overflow-hidden">
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border flex items-center justify-between">
                <span>Reference frame (use coordinate grid to set ROIs)</span>
                {previewing && <span className="text-mono">loading…</span>}
              </div>
              {preview ? (
                <PreviewWithROI
                  src={preview.imageUrl}
                  lineCoords={lineCoords}
                  roiCoords={roiCoords}
                />
              ) : (
                <div className="grid h-64 place-items-center text-sm text-muted-foreground">
                  {previewing ? "Fetching preview frame…" : "Preview will appear here"}
                </div>
              )}
            </div>
            <div className="lg:col-span-2 grid gap-3 content-start">
              <Field
                label="Stop-line coordinates"
                hint="Format: x1,y1,x2,y2"
                value={lineCoords}
                onChange={setLineCoords}
                disabled={running}
              />
              <Field
                label="Traffic-light ROI(s)"
                hint="Format: x1,y1,x2,y2  ·  separate multiple with ;"
                value={roiCoords}
                onChange={setRoiCoords}
                disabled={running}
              />
              <div className="rounded-md border border-border bg-background/40 p-3 text-xs text-muted-foreground leading-relaxed">
                Use the grid overlay on the preview frame to read pixel coordinates.
                Pre-filled defaults match a typical intersection — tweak them to fit your scene.
              </div>
            </div>
          </div>
        )}

        {running && (
          <div className="mt-4">
            <ProgressBar
              running={running}
              estimateMs={VIDEO_ETA_MS}
              label="Analyzing video for stop-line and red-light violations"
            />
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive break-all">
            {error}
          </div>
        )}
      </div>

      {result ? (
        <ResultBlock detectionId={id} timestamp={ts} result={result} violations={violations} />
      ) : (
        <div className="grid place-items-center rounded-xl border border-dashed border-border bg-card/30 py-16 text-sm text-muted-foreground">
          Upload a clip, adjust the stop-line and traffic-light coordinates, then run detection.
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-foreground">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1.5 w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-mono focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-60"
      />
    </label>
  );
}

function PreviewWithROI({
  src,
  lineCoords,
  roiCoords,
}: {
  src: string;
  lineCoords: string;
  roiCoords: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  const line = parseLine(lineCoords);
  const rois = parseRois(roiCoords);

  return (
    <div className="relative">
      <img
        ref={imgRef}
        src={src}
        alt="Video preview frame"
        className="block w-full"
        onLoad={(e) => {
          const t = e.currentTarget;
          setDims({ w: t.naturalWidth, h: t.naturalHeight });
        }}
      />
      {dims && (
        <svg
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          className="pointer-events-none absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {line && (
            <line
              x1={line[0]}
              y1={line[1]}
              x2={line[2]}
              y2={line[3]}
              stroke="oklch(0.78 0.15 75)"
              strokeWidth={Math.max(2, dims.w / 320)}
              strokeDasharray={`${dims.w / 80} ${dims.w / 160}`}
            />
          )}
          {rois.map((r, i) => (
            <rect
              key={i}
              x={r[0]}
              y={r[1]}
              width={r[2] - r[0]}
              height={r[3] - r[1]}
              fill="none"
              stroke="oklch(0.72 0.16 252)"
              strokeWidth={Math.max(2, dims.w / 320)}
            />
          ))}
        </svg>
      )}
    </div>
  );
}

function parseLine(s: string): number[] | null {
  const p = s.split(",").map((n) => Number(n.trim()));
  return p.length === 4 && p.every((n) => Number.isFinite(n)) ? p : null;
}
function parseRois(s: string): number[][] {
  return s
    .split(";")
    .map((part) => part.split(",").map((n) => Number(n.trim())))
    .filter((arr) => arr.length === 4 && arr.every((n) => Number.isFinite(n)));
}

function extractViolations(report: any): any[] {
  if (!report) return [];
  if (Array.isArray(report.violations)) return report.violations;
  if (Array.isArray(report.events)) return report.events;
  if (Array.isArray(report.detections)) return report.detections;
  return [];
}

function ResultBlock({
  detectionId,
  timestamp,
  result,
  violations,
}: {
  detectionId: string | null;
  timestamp: string | null;
  result: VideoDetectResult;
  violations: any[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-medium">Annotated Video</div>
        {result.videoUrl ? (
          <video src={result.videoUrl} controls className="w-full bg-black max-h-[560px]" />
        ) : (
          <div className="grid h-72 place-items-center text-sm text-muted-foreground">
            No annotated video returned (JSON-only response).
          </div>
        )}
      </div>

      <div className="lg:col-span-2 grid gap-4 content-start">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Hash className="size-3.5" /> Detection ID
          </div>
          <div className="mt-1 text-mono text-sm font-semibold tracking-tight break-all">
            {detectionId}
          </div>
          {timestamp && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {new Date(timestamp).toLocaleString()}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="text-sm font-medium">Violations</div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-md ${
                violations.length
                  ? "bg-destructive/15 text-destructive"
                  : "bg-success/15 text-success"
              }`}
            >
              {violations.length} found
            </span>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-auto">
            {violations.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-success" />
                No violations detected.
              </div>
            ) : (
              violations.map((v, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <AlertTriangle className="size-4 mt-0.5 text-warning" />
                  <div className="flex-1 min-w-0 text-sm">
                    <div className="font-medium">
                      {String(v.type ?? v.violation ?? v.label ?? "Violation").replace(
                        /_/g,
                        " ",
                      )}
                    </div>
                    {(v.frame ?? v.timestamp ?? v.time) !== undefined && (
                      <div className="text-xs text-muted-foreground text-mono mt-0.5">
                        {v.frame !== undefined ? `frame ${v.frame}` : String(v.timestamp ?? v.time)}
                      </div>
                    )}
                  </div>
                  {typeof v.confidence === "number" && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary text-mono">
                      {(v.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <details className="rounded-xl border border-border bg-card">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
            Raw JSON report
          </summary>
          <pre className="px-4 pb-4 text-[11px] text-mono text-muted-foreground overflow-auto max-h-80">
            {JSON.stringify(result.report ?? {}, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
