const EXAMPLES = [
  {
    id: "sample1",
    title: "Dense Intersection — Helmet Violation",
    desc: "Busy multi-lane intersection with 6 bikes and 10 cars. One motorcycle rider detected without a helmet (KA 51 AS J475) amid heavy mixed traffic.",
    image: "/samples/sample1.jpeg",
    violations: [{ type: "no_helmet", confidence: 0.94 }],
    plate: "KA 51 AS J475",
  },
  {
    id: "sample2",
    title: "Crosswalk Scene — Multiple Helmet Violations",
    desc: "4 bikes and 6 cars at a zebra crossing. Four separate no-helmet violations detected across multiple two-wheelers.",
    image: "/samples/sample2.jpeg",
    violations: [
      { type: "no_helmet", confidence: 0.96 },
      { type: "no_helmet", confidence: 0.91 },
      { type: "no_helmet", confidence: 0.88 },
      { type: "no_helmet", confidence: 0.87 },
    ],
    plate: "KA 02 HP 7890",
  },
  {
    id: "sample3",
    title: "Urban Road — Dual Helmet Non-compliance",
    desc: "Mixed traffic scene on Sanghatana Patha. Two riders detected without helmets on separate motorcycles, plates KA 03 E149 and KA 02 KF 4031.",
    image: "/samples/sample3.jpeg",
    violations: [
      { type: "no_helmet", confidence: 0.93 },
      { type: "no_helmet", confidence: 0.91 },
    ],
    plate: "KA 03 E149",
  },
  {
    id: "sample4",
    title: "Street-level Scene — Triple Riding + Helmet Violations",
    desc: "High-density street-level view with 7 bikes and 10 cars. Triple-riding violation plus 5 riders without helmets flagged across the scene.",
    image: "/samples/sample4.jpeg",
    violations: [
      { type: "triple_riding", confidence: 0.95 },
      { type: "no_helmet", confidence: 0.93 },
      { type: "no_helmet", confidence: 0.91 },
    ],
    plate: "KA 03 XB 5676",
  },
];

export function Examples() {
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Inference Examples</h2>
        <p className="text-sm text-muted-foreground">
          Real pipeline output on sample traffic scenes. Click an image to open it full-size.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {EXAMPLES.map((ex) => (
          <article
            key={ex.id}
            className="rounded-xl border border-border bg-card overflow-hidden flex flex-col"
          >
            <a
              href={ex.image}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative aspect-video overflow-hidden bg-background border-b border-border"
            >
              <img
                src={ex.image}
                alt={ex.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </a>
            <div className="p-4 flex-1 flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">{ex.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{ex.desc}</p>
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {/* deduplicate violation types */}
                {[...new Map(ex.violations.map((v) => [v.type, v])).values()].map((v) => (
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
                <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-[11px] text-mono text-muted-foreground">
                  {ex.plate}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
