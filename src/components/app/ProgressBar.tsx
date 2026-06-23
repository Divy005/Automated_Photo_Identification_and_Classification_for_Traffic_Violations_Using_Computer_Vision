import { useEffect, useState } from "react";

/** A smooth "ease-toward" progress bar driven by an estimated duration in ms. */
export function ProgressBar({
  running,
  estimateMs,
  label,
}: {
  running: boolean;
  estimateMs: number;
  label: string;
}) {
  const [pct, setPct] = useState(0);
  const [start, setStart] = useState<number | null>(null);

  useEffect(() => {
    if (!running) {
      setPct(0);
      setStart(null);
      return;
    }
    const t0 = performance.now();
    setStart(t0);
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - t0;
      // Asymptote at 95% so it only completes when we say so.
      const p = 95 * (1 - Math.exp(-elapsed / (estimateMs * 0.6)));
      setPct(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, estimateMs]);

  if (!running) return null;
  const elapsedSec = start ? Math.round((performance.now() - start) / 1000) : 0;
  const etaSec = Math.max(0, Math.round(estimateMs / 1000 - elapsedSec));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{label}</span>
        <span className="text-mono">
          ~{etaSec}s remaining · est. {Math.round(estimateMs / 1000)}s
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
