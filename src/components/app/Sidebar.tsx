import { ScanLine, Video, BarChart3, BookOpen, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey = "image" | "video" | "analytics" | "examples";

const NAV: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "image", label: "Image Inference", icon: ScanLine },
  { key: "video", label: "Video Inference", icon: Video },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "examples", label: "Examples", icon: BookOpen },
];

export function Sidebar({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="relative grid place-items-center size-10 rounded-md bg-primary/15 ring-1 ring-primary/30">
          <ShieldCheck className="size-5 text-primary" />
          {/* Traffic-signal accent */}
          <div className="absolute -right-1 -top-1 flex flex-col gap-[2px] rounded-full bg-sidebar p-[3px] ring-1 ring-sidebar-border">
            <span className="size-1.5 rounded-full bg-destructive" />
            <span className="size-1.5 rounded-full bg-warning" />
            <span className="size-1.5 rounded-full bg-success" />
          </div>
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight text-foreground">TrafficAI</div>
          <div className="text-[11px] text-muted-foreground">Violation Detection Console</div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-2 text-[10px] font-medium tracking-[0.18em] text-muted-foreground">
        MODULES
      </div>
      <nav className="px-3 flex flex-col gap-0.5">
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="truncate">{label}</span>
              {isActive && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-5 space-y-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60">
          <Settings className="size-4 text-muted-foreground" />
          System Settings
        </button>
        <div className="mx-1 flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-3 py-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <span className="text-[11px] text-muted-foreground">Detection engine active</span>
        </div>
      </div>
    </aside>
  );
}
