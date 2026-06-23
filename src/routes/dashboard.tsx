import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/app/Dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Console · TrafficAI" },
      {
        name: "description",
        content:
          "Computer-vision console for automated traffic violation detection: helmet, triple riding, wrong-side, stop-line and red-light.",
      },
    ],
  }),
  component: Dashboard,
});
