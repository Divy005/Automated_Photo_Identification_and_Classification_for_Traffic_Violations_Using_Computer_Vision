import { useEffect, useRef, useState } from "react";

/**
 * Smooth, ease-toward progress bar driven by an estimated duration.
 *
 * The fill width is animated by a single CSS transition on the compositor, so
 * it stays perfectly smooth even while the main thread is busy or React isn't
 * re-rendering. A lightweight interval only updates the small % / ETA text.
 */
export function ProgressBar({
  running,
  estimateMs,
  label,
}: {
  running: boolean;
  estimateMs: number;
  label: string;
}) {
  const startRef = useRef<number>(0);
  const [width, setWidth] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!running) return;

    startRef.current = performance.now();
    setWidth(0);
    setPct(0);

    // Kick the CSS transition on the next frame so the browser animates from
    // 0% → 92% over the estimated duration on its own thread.
    const raf = requestAnimationFrame(() => setWidth(92));

    // Only the numeric readout is updated here, a few times a second.
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startRef.current;
      const p = 92 * (1 - Math.exp(-elapsed / (estimateMs * 0.55)));
      setPct(p);
    }, 250);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(interval);
    };
  }, [running, estimateMs]);

  if (!running) return null;

  const elapsedSec = Math.round((performance.now() - startRef.current) / 1000);
  const etaSec = Math.max(0, Math.round(estimateMs / 1000 - elapsedSec));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          {label}
        </span>
        <span className="text-mono tabular-nums">
          {Math.round(pct)}% · ~{etaSec}s left
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/50"
          style={{
            width: `${width}%`,
            transitionProperty: "width",
            transitionDuration: `${estimateMs}ms`,
            transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}
