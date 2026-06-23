import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Deploy target. Vercel sets this automatically via vercel.json; locally you can
// override with NITRO_PRESET (e.g. "node-server") to produce a standalone build.
const preset = process.env.NITRO_PRESET ?? "vercel";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Use src/server.ts as the SSR entry (it wraps the handler with our error page).
      server: { entry: "server" },
    }),
    nitro({ preset }),
    viteReact(),
  ],
});
