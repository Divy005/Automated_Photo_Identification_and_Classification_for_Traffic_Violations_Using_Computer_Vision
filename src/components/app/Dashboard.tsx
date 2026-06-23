import { useState } from "react";
import { ScanLine, Video, BarChart3, BookOpen } from "lucide-react";
import { Sidebar, type TabKey } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { ImageInference } from "@/components/app/ImageInference";
import { VideoInference } from "@/components/app/VideoInference";
import { Analytics } from "@/components/app/Analytics";
import { Examples } from "@/components/app/Examples";

const TITLES: Record<TabKey, { title: string; icon: React.ComponentType<{ className?: string }> }> =
  {
    image: { title: "Image Inference", icon: ScanLine },
    video: { title: "Video Inference", icon: Video },
    analytics: { title: "Analytics", icon: BarChart3 },
    examples: { title: "Examples", icon: BookOpen },
  };

export function Dashboard() {
  const [tab, setTab] = useState<TabKey>("image");
  const meta = TITLES[tab];

  return (
    <div className="dark min-h-screen flex bg-background text-foreground">
      <Sidebar active={tab} onChange={setTab} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={meta.title} icon={meta.icon} />
        <main className="grid-bg flex-1 w-full">
          <div className="px-6 py-6 max-w-[1500px] w-full mx-auto">
            {tab === "image" && <ImageInference />}
            {tab === "video" && <VideoInference />}
            {tab === "analytics" && <Analytics />}
            {tab === "examples" && <Examples />}
          </div>
        </main>
      </div>
    </div>
  );
}
