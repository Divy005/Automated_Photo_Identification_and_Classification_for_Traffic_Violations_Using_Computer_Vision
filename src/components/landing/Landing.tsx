import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  ArrowRight,
  ScanLine,
  Bike,
  Users,
  Ban,
  ScanText,
  TrafficCone,
  BarChart3,
  Upload,
  Cpu,
  FileCheck2,
  Gauge,
  Github,
} from "lucide-react";
import { Reveal, CountUp } from "./Reveal";

const VIOLATIONS = [
  "No Helmet",
  "Triple Riding",
  "Wrong-side Driving",
  "Stop-line Crossing",
  "Red-light Jump",
  "Illegal Parking",
  "Number-plate OCR",
];

const FEATURES = [
  {
    icon: ScanLine,
    title: "Helmet Compliance",
    desc: "Flags riders without helmets from a single still, with bounding-box evidence.",
    tone: "primary",
  },
  {
    icon: Users,
    title: "Triple Riding",
    desc: "Counts riders per two-wheeler and catches overloaded vehicles automatically.",
    tone: "warning",
  },
  {
    icon: Ban,
    title: "Wrong-side Driving",
    desc: "Detects vehicles moving against the permitted direction of travel.",
    tone: "destructive",
  },
  {
    icon: ScanText,
    title: "Number-plate OCR",
    desc: "Reads and ranks license plates so the best-detected plate surfaces first.",
    tone: "primary",
  },
  {
    icon: TrafficCone,
    title: "Red-light & Stop-line",
    desc: "Frame-accurate stop-line and red-light violation detection from video clips.",
    tone: "success",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Every detection feeds persistent dashboards — totals, plates and trends.",
    tone: "primary",
  },
] as const;

const STEPS = [
  {
    icon: Upload,
    title: "Upload",
    desc: "Drop an image or a short intersection clip into the console.",
  },
  {
    icon: Cpu,
    title: "Detect",
    desc: "Computer-vision models annotate violations and read plates in seconds.",
  },
  {
    icon: FileCheck2,
    title: "Report",
    desc: "Get annotated evidence, plate numbers and analytics you can act on.",
  },
];

const toneText: Record<string, string> = {
  primary: "text-primary",
  warning: "text-warning",
  destructive: "text-destructive",
  success: "text-success",
};
const toneRing: Record<string, string> = {
  primary: "bg-primary/10 ring-primary/25",
  warning: "bg-warning/10 ring-warning/25",
  destructive: "bg-destructive/10 ring-destructive/25",
  success: "bg-success/10 ring-success/25",
};

export function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="dark relative min-h-screen overflow-x-clip bg-background text-foreground">
      {/* Nav */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="relative grid size-9 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/30">
              <ShieldCheck className="size-5 text-primary" />
              <div className="absolute -right-1 -top-1 flex flex-col gap-[2px] rounded-full bg-background p-[3px] ring-1 ring-border">
                <span className="size-1 rounded-full bg-destructive" />
                <span className="size-1 rounded-full bg-warning" />
                <span className="size-1 rounded-full bg-success" />
              </div>
            </div>
            <span className="text-sm font-semibold tracking-tight">TrafficAI</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#how" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#stats" className="hover:text-foreground transition-colors">
              Impact
            </a>
          </nav>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Launch Console <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-24 pt-36">
        {/* background glow + grid */}
        <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <div className="blob -left-24 top-10 size-[26rem] bg-primary/30" />
        <div className="blob right-0 top-40 size-[22rem] bg-[oklch(0.72_0.16_195/0.25)] animate-float-slow" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="mx-auto max-w-6xl">
          <Reveal as="div" className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Computer-vision traffic enforcement
            </span>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              <span className="text-gradient">Automated</span> traffic
              <br className="hidden sm:block" /> violation detection
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Identify and classify traffic violations from photos and video — helmet compliance,
              triple riding, wrong-side driving, red-light jumps and number-plate recognition — with
              annotated evidence and live analytics.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Launch Console
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-accent"
              >
                See capabilities
              </a>
            </div>
          </Reveal>

          {/* Live detection video */}
          <Reveal delay={150} y={40} className="mx-auto mt-16 max-w-4xl">
            <DetectionVideo />
          </Reveal>
        </div>

        {/* Scanning marquee strip */}
        <div className="relative mt-16 overflow-hidden border-y border-border py-4">
          <div className="flex w-max animate-marquee gap-10 pr-10">
            {[...VIOLATIONS, ...VIOLATIONS].map((v, i) => (
              <span
                key={i}
                className="flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground"
              >
                <ScanLine className="size-4 text-primary" /> {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Real detector output */}
      <OutputShowcase />

      {/* Features */}
      <section id="features" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Capabilities
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              One console, every violation
            </h2>
            <p className="mt-4 text-muted-foreground">
              Purpose-built detectors for the violations that matter most on Indian roads, each
              returning annotated evidence and confidence scores.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 70} y={30}>
                <div className="group h-full rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-colors hover:border-primary/40">
                  <div
                    className={`grid size-11 place-items-center rounded-xl ring-1 ${toneRing[f.tone]}`}
                  >
                    <f.icon className={`size-5 ${toneText[f.tone]}`} />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative overflow-hidden px-5 py-24">
        <div className="blob left-1/2 top-0 size-[24rem] -translate-x-1/2 bg-primary/20" />
        <div className="mx-auto max-w-6xl">
          <Reveal className="grid gap-6 rounded-3xl border border-border bg-card/50 p-10 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
            <Stat value={6} suffix="+" label="Violation types" />
            <Stat value={30} prefix="<" suffix="s" label="Per-image inference" icon={Gauge} />
            <Stat value={98.6} decimals={1} suffix="%" label="Plate-read confidence" />
            <Stat value={100} suffix="%" label="Annotated evidence" />
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Workflow
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              From upload to report in seconds
            </h2>
          </Reveal>

          <div className="relative mt-12 grid gap-4 md:grid-cols-3">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120} y={30}>
                <div className="relative h-full rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/25">
                      {i + 1}
                    </div>
                    <s.icon className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-28 pt-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-10 text-center sm:p-16">
              <div className="blob -right-10 -top-10 size-72 bg-primary/30" />
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to catch violations automatically?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Open the console and run your first detection — no setup required.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  to="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
                >
                  Launch Console
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> TrafficAI · Violation Detection Console
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Divy005/Automated_Photo_Identification_and_Classification_for_Traffic_Violations_Using_Computer_Vision"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Github className="size-4" /> Source
            </a>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Console
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  value,
  label,
  suffix,
  prefix,
  decimals,
  icon: Icon,
}: {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-4xl font-semibold tracking-tight text-mono">
        {prefix}
        <CountUp end={value} decimals={decimals} suffix={suffix} />
        {Icon && <Icon className="size-6 text-primary" />}
      </div>
      <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

/** Live detection demo video framed in a console-style card. */
function DetectionVideo() {
  return (
    <div className="relative rounded-2xl border border-border bg-card/70 p-3 shadow-2xl shadow-black/40 backdrop-blur">
      {/* glow */}
      <div className="pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-r from-primary/30 via-transparent to-[oklch(0.72_0.16_195/0.3)] blur-md" />
      <div className="flex items-center gap-1.5 px-2 pb-2.5 pt-1">
        <span className="size-2.5 rounded-full bg-destructive/70" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-success/70" />
        <span className="ml-2 text-[11px] text-muted-foreground text-mono">detection · live</span>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        <video
          src="/detection-demo.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
        {/* LIVE badge */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 text-[11px] font-medium text-mono backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/70" />
            <span className="relative inline-flex size-2 rounded-full bg-destructive" />
          </span>
          LIVE
        </div>
      </div>
      {/* result chips */}
      <div className="flex flex-wrap items-center gap-2 px-1 pt-3">
        <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
          Vehicles tracked
        </span>
        <span className="rounded-md bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">
          Helmet check
        </span>
        <span className="rounded-md bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
          Plate OCR
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground text-mono">
          <Bike className="size-3.5" /> real-time
        </span>
      </div>
    </div>
  );
}

/** Showcase of a real annotated detection output image. */
function OutputShowcase() {
  const [errored, setErrored] = useState(false);

  return (
    <section id="showcase" className="relative overflow-hidden px-5 py-24">
      <div className="blob right-0 top-10 size-[22rem] bg-[oklch(0.72_0.16_195/0.2)]" />
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Real output
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Annotated detection, straight from the model
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every vehicle boxed and classified, helmets checked per rider, and license plates read —
            exactly what the console returns.
          </p>
        </Reveal>

        <Reveal delay={120} y={36} className="mt-12">
          {/* gradient frame */}
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/40 via-border to-[oklch(0.72_0.16_195/0.4)] p-px shadow-2xl shadow-black/40">
            <div className="rounded-3xl bg-card p-3">
              {errored ? (
                <div className="grid aspect-[3/2] place-items-center rounded-2xl border border-dashed border-border bg-background/40 text-center text-sm text-muted-foreground">
                  <div>
                    <ScanText className="mx-auto mb-2 size-6 text-primary" />
                    Sample detection output
                  </div>
                </div>
              ) : (
                <img
                  src="/detection-output.jpg"
                  alt="Annotated traffic-violation detection output"
                  loading="lazy"
                  onError={() => setErrored(true)}
                  className="w-full rounded-2xl"
                />
              )}
            </div>
            {/* corner accents */}
            <span className="pointer-events-none absolute left-3 top-3 size-5 rounded-tl-lg border-l-2 border-t-2 border-primary/70" />
            <span className="pointer-events-none absolute right-3 top-3 size-5 rounded-tr-lg border-r-2 border-t-2 border-primary/70" />
            <span className="pointer-events-none absolute bottom-3 left-3 size-5 rounded-bl-lg border-b-2 border-l-2 border-primary/70" />
            <span className="pointer-events-none absolute bottom-3 right-3 size-5 rounded-br-lg border-b-2 border-r-2 border-primary/70" />
          </div>
        </Reveal>

        {/* stat chips under the image */}
        <Reveal delay={200} className="mt-6 flex flex-wrap justify-center gap-2.5">
          {[
            { label: "Vehicles detected", tone: "primary" },
            { label: "Per-rider helmet check", tone: "success" },
            { label: "Number-plate OCR", tone: "warning" },
            { label: "Violations flagged", tone: "destructive" },
          ].map((c) => (
            <span
              key={c.label}
              className={`rounded-full border border-border bg-card px-3 py-1 text-xs font-medium ${toneText[c.tone]}`}
            >
              {c.label}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
