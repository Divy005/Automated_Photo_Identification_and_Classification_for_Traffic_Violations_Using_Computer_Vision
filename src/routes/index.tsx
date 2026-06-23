import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScanLine, Video, BarChart3, BookOpen } from "lucide-react";
import { Sidebar, type TabKey } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { ImageInference } from "@/components/app/ImageInference";
import { VideoInference } from "@/components/app/VideoInference";
import { Analytics } from "@/components/app/Analytics";
import { Examples } from "@/components/app/Examples";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrafficAI · Automated Violation Detection" },
      {
        name: "description",
        content:
          "Computer-vision dashboard for automated traffic violation detection: helmet, triple riding, wrong-side, stop-line and red-light.",
      },
      { property: "og:title", content: "TrafficAI · Automated Violation Detection" },
      {
        property: "og:description",
        content:
          "Upload images and clips to detect traffic violations with annotated evidence and analytics.",
      },
    ],
  }),
  component: Index,
});

const TITLES: Record<TabKey, { title: string; icon: React.ComponentType<{ className?: string }> }> = {
  image: { title: "Image Inference", icon: ScanLine },
  video: { title: "Video Inference", icon: Video },
  analytics: { title: "Analytics", icon: BarChart3 },
  examples: { title: "Examples", icon: BookOpen },
};

function Index() {
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
