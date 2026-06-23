import { CheckCircle2, AlertTriangle, Clock, Hash } from "lucide-react";
import type { DetectResponse } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  no_helmet: "Helmet Non-compliance",
  helmet: "Helmet Detected",
  triple_riding: "Triple Riding",
  wrong_side: "Wrong-side Driving",
  stop_line: "Stop-line Violation",
  red_light: "Red-light Violation",
  illegal_parking: "Illegal Parking",
};

const fmtType = (t: string) =>
  TYPE_LABELS[t] ?? t.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

export function ResultPanel({
  detectionId,
  result,
  annotatedUrl,
  emptyText = "Run a detection to see results here.",
}: {
  detectionId?: string | null;
  result: DetectResponse | null;
  annotatedUrl?: string | null;
  emptyText?: string;
}) {
  if (!result) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-border bg-card/30 py-16 text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  const violations = result.violations ?? [];
  const annotated =
    annotatedUrl ??
    (result.annotated_image_base64
      ? `data:image/jpeg;base64,${result.annotated_image_base64}`
      : null);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="text-sm font-medium">Annotated Evidence</div>
          <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {result.processing_time_ms?.toFixed?.(0) ?? result.processing_time_ms} ms
          </span>
        </div>
        {annotated ? (
          <img src={annotated} alt="Annotated detection" className="w-full object-contain max-h-[520px] bg-black" />
        ) : (
          <div className="grid h-72 place-items-center text-sm text-muted-foreground">
            No annotated image returned.
          </div>
        )}
      </div>

      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Hash className="size-3.5" /> Detection ID
          </div>
          <div className="mt-1 text-mono text-sm font-semibold tracking-tight break-all">
            {detectionId ?? result.image_id}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> {new Date(result.timestamp).toLocaleString()}
          </div>
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
          <div className="divide-y divide-border">
            {violations.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-success" />
                No violations detected.
              </div>
            ) : (
              violations.map((v, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <AlertTriangle className="size-4 mt-0.5 text-warning" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{fmtType(String(v.type))}</div>
                    {v.plate && (
                      <div className="text-xs text-muted-foreground text-mono mt-0.5">
                        Plate · {String(v.plate)}
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
      </div>
    </div>
  );
}
