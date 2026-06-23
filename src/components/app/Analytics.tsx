import { useEffect, useState } from "react";
import { getImageStats as getStats, listViolations } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { RefreshCw } from "lucide-react";

export function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r] = await Promise.all([
        getStats().catch(() => null),
        listViolations({ limit: 20 }).catch(() => ({ violations: [] })),
      ]);
      setStats(s);
      setRecent(r?.violations ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byType: { name: string; value: number }[] = stats?.violations_by_type
    ? Object.entries(stats.violations_by_type).map(([k, v]) => ({
        name: k.replace(/_/g, " "),
        value: Number(v),
      }))
    : [];

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Analytics & Reports</h2>
          <p className="text-sm text-muted-foreground">
            Live aggregates pulled from the detection backend.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-sm hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <KV label="Total Detections" value={stats?.total_detections ?? "—"} />
        <KV label="Total Violations" value={stats?.total_violations ?? "—"} />
        <KV
          label="Avg. Confidence"
          value={
            typeof stats?.average_confidence === "number"
              ? `${(stats.average_confidence * 100).toFixed(1)}%`
              : "—"
          }
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-medium mb-4">Violations by Type</div>
        <div className="h-64">
          {byType.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              No data yet — run a few detections to populate analytics.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-3 border-b border-border text-sm font-medium">Recent Violations</div>
        <div className="divide-y divide-border">
          {recent.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">No records yet.</div>
          ) : (
            recent.map((v, i) => (
              <div key={i} className="px-5 py-3 grid grid-cols-[1fr_auto_auto] items-center gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {String(v.violation_type ?? v.type ?? "violation").replace(/_/g, " ")}
                  </div>
                  <div className="text-xs text-muted-foreground text-mono truncate">
                    {v.plate ?? v.license_plate ?? "—"}
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary text-mono">
                  {typeof v.confidence === "number" ? `${(v.confidence * 100).toFixed(1)}%` : "—"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {v.timestamp ? new Date(v.timestamp).toLocaleString() : ""}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-mono">{String(value)}</div>
    </div>
  );
}
