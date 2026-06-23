import { CheckCircle2, AlertTriangle, Clock, Hash, ScanText } from "lucide-react";
import type { DetectResponse } from "@/lib/api";
import { getPlate, plateQuality, labelForType } from "@/lib/history";

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

  // Sort so the best-detected number plates surface first, then by confidence.
  const violations = [...(result.violations ?? [])].sort((a, b) => {
    const pq = plateQuality(b) - plateQuality(a);
    if (pq !== 0) return pq;
    return (Number(b.confidence) || 0) - (Number(a.confidence) || 0);
  });

  // Unique, best-first list of recognised plates for the summary strip.
  const plateMap = new Map<string, { plate: string; type: string; confidence?: number }>();
  for (const v of violations) {
    const plate = getPlate(v);
    if (plate && !plateMap.has(plate)) {
      plateMap.set(plate, {
        plate,
        type: String(v.type ?? ""),
        confidence: typeof v.confidence === "number" ? v.confidence : undefined,
      });
    }
  }
  const plates = [...plateMap.values()];

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

        {/* Recognised license plates, best read first. */}
        {plates.length > 0 && (
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <ScanText className="size-4 text-primary" />
              <div className="text-sm font-medium">Recognised Plates</div>
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary text-mono">
                {plates.length}
              </span>
            </div>
            <div className="p-3 grid gap-2">
              {plates.map((p, i) => (
                <div
                  key={p.plate}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2"
                >
                  {/* Number-plate styled chip */}
                  <span className="inline-flex items-center rounded-md border-2 border-foreground/70 bg-foreground/[0.06] px-2.5 py-1 text-base font-semibold tracking-[0.12em] text-mono text-foreground">
                    {p.plate}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{labelForType(p.type)}</div>
                    {i === 0 && (
                      <div className="text-[10px] uppercase tracking-wider text-success">
                        Best match
                      </div>
                    )}
                  </div>
                  {typeof p.confidence === "number" && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary text-mono">
                      {(p.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
              violations.map((v, i) => {
                const plate = getPlate(v);
                return (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <AlertTriangle className="size-4 mt-0.5 text-warning" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{labelForType(String(v.type))}</div>
                      {plate ? (
                        <div className="mt-1 inline-flex items-center gap-1.5 rounded border border-border bg-background/60 px-1.5 py-0.5 text-xs text-mono tracking-wider">
                          <ScanText className="size-3 text-primary" />
                          {plate}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground mt-0.5">No plate read</div>
                      )}
                    </div>
                    {typeof v.confidence === "number" && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary text-mono">
                        {(v.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
