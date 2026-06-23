import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { RefreshCw, Trash2, ScanText, Activity, ShieldAlert, Gauge } from "lucide-react";
import {
  aggregate,
  clearHistory,
  getHistory,
  labelForType,
  onHistoryChange,
  type Aggregates,
} from "@/lib/history";

const EMPTY: Aggregates = {
  totalDetections: 0,
  totalViolations: 0,
  avgConfidence: null,
  byType: [],
  recent: [],
  plates: [],
};

export function Analytics() {
  // Start empty to keep SSR/first paint deterministic, then hydrate from
  // localStorage on the client so numbers survive refreshes.
  const [data, setData] = useState<Aggregates>(EMPTY);
  const [spin, setSpin] = useState(false);

  const refresh = () => setData(aggregate(getHistory()));

  useEffect(() => {
    refresh();
    return onHistoryChange(refresh);
  }, []);

  const onRefresh = () => {
    setSpin(true);
    refresh();
    window.setTimeout(() => setSpin(false), 400);
  };

  const onClear = () => {
    if (window.confirm("Clear all locally stored detection history?")) {
      clearHistory();
      refresh();
    }
  };

  const hasData = data.totalDetections > 0;

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Analytics &amp; Reports</h2>
          <p className="text-sm text-muted-foreground">
            Aggregated from detections you&apos;ve run on this device · stored locally.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-sm hover:bg-accent"
          >
            <RefreshCw className={`size-4 ${spin ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={onClear}
            disabled={!hasData}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-sm hover:bg-accent disabled:opacity-50"
          >
            <Trash2 className="size-4" /> Clear
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KV icon={Activity} label="Total Detections" value={data.totalDetections} />
        <KV icon={ShieldAlert} label="Total Violations" value={data.totalViolations} accent="destructive" />
        <KV icon={ScanText} label="Plates Read" value={data.plates.length} accent="primary" />
        <KV
          icon={Gauge}
          label="Avg. Confidence"
          value={
            typeof data.avgConfidence === "number"
              ? `${(data.avgConfidence * 100).toFixed(1)}%`
              : "—"
          }
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-medium mb-4">Violations by Type</div>
        <div className="h-64">
          {data.byType.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byType}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "color-mix(in oklab, var(--primary) 12%, transparent)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={64} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground text-center px-6">
              No data yet — run a detection on the Image or Video tab and the charts
              will populate here automatically.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recognised plates leaderboard */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
            <ScanText className="size-4 text-primary" />
            <div className="text-sm font-medium">Recognised Plates</div>
            <span className="ml-auto text-xs text-muted-foreground">{data.plates.length} total</span>
          </div>
          <div className="divide-y divide-border max-h-80 overflow-auto">
            {data.plates.length === 0 ? (
              <div className="px-5 py-6 text-sm text-muted-foreground">No plates read yet.</div>
            ) : (
              data.plates.map((p, i) => (
                <div key={`${p.plate}-${i}`} className="px-5 py-3 flex items-center gap-3">
                  <span className="inline-flex items-center rounded-md border-2 border-foreground/70 bg-foreground/[0.06] px-2.5 py-1 text-sm font-semibold tracking-[0.12em] text-mono">
                    {p.plate}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{labelForType(p.type)}</span>
                  <span className="ml-auto text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary text-mono">
                    {typeof p.confidence === "number" ? `${(p.confidence * 100).toFixed(1)}%` : "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent violations */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-3 border-b border-border text-sm font-medium">Recent Violations</div>
          <div className="divide-y divide-border max-h-80 overflow-auto">
            {data.recent.length === 0 ? (
              <div className="px-5 py-6 text-sm text-muted-foreground">No records yet.</div>
            ) : (
              data.recent.map((v, i) => (
                <div key={i} className="px-5 py-3 grid grid-cols-[1fr_auto] items-center gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{labelForType(v.type)}</div>
                    <div className="text-xs text-muted-foreground text-mono truncate">
                      {v.plate ?? "—"} · {v.source}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary text-mono">
                      {typeof v.confidence === "number" ? `${(v.confidence * 100).toFixed(1)}%` : "—"}
                    </span>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {v.timestamp ? new Date(v.timestamp).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: "primary" | "destructive";
}) {
  const accentClass =
    accent === "destructive"
      ? "text-destructive"
      : accent === "primary"
        ? "text-primary"
        : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold text-mono ${accentClass}`}>{String(value)}</div>
    </div>
  );
}
