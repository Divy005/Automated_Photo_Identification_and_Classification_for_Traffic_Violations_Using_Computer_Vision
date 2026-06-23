import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";

export function Topbar({ title, icon: Icon }: { title: string; icon: React.ComponentType<{ className?: string }> }) {
  // Client-only clock to avoid an SSR/hydration mismatch.
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="flex items-center gap-4 px-6 h-16 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Live system status */}
        <div className="hidden lg:flex items-center gap-2 rounded-md border border-border bg-card px-2.5 h-9">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
            SYSTEM ONLINE
          </span>
          {time && (
            <span className="text-[11px] text-mono tabular-nums text-foreground/80 border-l border-border pl-2">
              {time}
            </span>
          )}
        </div>

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="Search detection ID or plate…"
            className="h-9 w-64 rounded-md border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <button className="grid place-items-center size-9 rounded-md border border-border bg-card hover:bg-accent">
          <Bell className="size-4 text-muted-foreground" />
        </button>
        <div className="size-9 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 ring-1 ring-border" />
      </div>
    </header>
  );
}
