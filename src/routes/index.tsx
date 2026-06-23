import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrafficAI · Automated Violation Detection" },
      {
        name: "description",
        content:
          "Computer-vision platform for automated traffic violation detection: helmet, triple riding, wrong-side, stop-line, red-light and number-plate recognition.",
      },
      { property: "og:title", content: "TrafficAI · Automated Violation Detection" },
      {
        property: "og:description",
        content:
          "Identify and classify traffic violations from photos and video with annotated evidence and live analytics.",
      },
    ],
  }),
  component: Landing,
});
