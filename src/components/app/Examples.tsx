const EXAMPLES = [
  {
    id: "EX-HELMET-01",
    title: "Helmet Non-compliance",
    desc: "Rider detected without helmet on two-wheeler at urban intersection.",
    violations: [{ type: "no_helmet", confidence: 0.962 }],
    plate: "DL-04-CN-5566",
  },
  {
    id: "EX-TRIPLE-02",
    title: "Triple Riding",
    desc: "Three riders identified on a single motorcycle during evening hours.",
    violations: [
      { type: "triple_riding", confidence: 0.941 },
      { type: "no_helmet", confidence: 0.873 },
    ],
    plate: "MH-12-AB-9876",
  },
  {
    id: "EX-WRONG-03",
    title: "Wrong-side Driving",
    desc: "Vehicle moving against traffic flow on a one-way arterial road.",
    violations: [{ type: "wrong_side", confidence: 0.918 }],
    plate: "TS-09-PA-1122",
  },
  {
    id: "EX-STOP-04",
    title: "Stop-line Violation",
    desc: "Vehicle crossed stop line during red phase — extracted from CCTV clip.",
    violations: [{ type: "stop_line", confidence: 0.889 }],
    plate: "KA-05-MX-3340",
  },
  {
    id: "EX-RED-05",
    title: "Red-light Violation",
    desc: "Two-wheeler entered intersection after signal turned red.",
    violations: [{ type: "red_light", confidence: 0.934 }],
    plate: "DL-08-QR-7781",
  },
  {
    id: "EX-PARK-06",
    title: "Illegal Parking",
    desc: "Sedan parked in a no-stopping zone adjacent to a bus bay.",
    violations: [{ type: "illegal_parking", confidence: 0.901 }],
    plate: "UP-16-CD-4421",
  },
];

export function Examples() {
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Inference Examples</h2>
        <p className="text-sm text-muted-foreground">
          A reference set of detections produced by our pipeline on prior evaluation data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {EXAMPLES.map((ex) => (
          <article
            key={ex.id}
            className="rounded-xl border border-border bg-card overflow-hidden flex flex-col"
          >
            <div className="relative aspect-video grid-bg bg-background border-b border-border">
              <div className="absolute inset-0 grid place-items-center">
                <div className="rounded-md border-2 border-destructive/80 bg-destructive/20 px-2 py-1 text-[10px] font-medium tracking-wider uppercase text-destructive">
                  {ex.violations[0].type.replace(/_/g, " ")}
                </div>
              </div>
              <div className="absolute top-2 left-2 text-[10px] text-mono text-muted-foreground tracking-wider">
                {ex.id}
              </div>
              <div className="absolute bottom-2 right-2 text-[10px] text-mono text-muted-foreground">
                {ex.plate}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">{ex.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{ex.desc}</p>
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {ex.violations.map((v) => (
                  <span
                    key={v.type}
                    className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-[11px]"
                  >
                    <span className="size-1.5 rounded-full bg-destructive" />
                    {v.type.replace(/_/g, " ")}
                    <span className="text-mono text-muted-foreground">
                      {(v.confidence * 100).toFixed(1)}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
