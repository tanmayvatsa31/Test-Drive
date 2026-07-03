import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

type AppTarget = "customer" | "driver" | "admin" | "viewer";

const TARGET = (process.env.VITE_APP_TARGET ?? "customer") as AppTarget;

const PORTS: Record<AppTarget, number> = {
  customer: 5173,
  driver: 5174,
  admin: 5175,
  viewer: 5176,
};

const ENTRIES: Record<AppTarget, string> = {
  customer: "customer.html",
  driver: "driver.html",
  admin: "admin.html",
  viewer: "viewer.html",
};

const ENTRY = ENTRIES[TARGET];
const PORT = PORTS[TARGET];

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesBase =
  process.env.VITE_BASE_PATH ??
  (process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : "/");

/** Inject `<base href>` so relative public assets resolve on GitHub Pages subpaths. */
function pagesBaseTag(base: string): Plugin {
  return {
    name: "pages-base-tag",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (base === "/") return html;
        if (html.includes("<base ")) return html;
        return html.replace("<head>", `<head>\n    <base href="${base}" />`);
      },
    },
  };
}

/** Serve the app entry at `/` and for client-side routes (e.g. `/app`, `/dealer`). */
function spaFallback(entry: string): Plugin {
  return {
    name: "spa-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? "";
        if (
          url.startsWith("/@") ||
          url.startsWith("/__") ||
          url.startsWith("/src") ||
          url.startsWith("/node_modules") ||
          url.startsWith("/assets") ||
          req.headers.upgrade === "websocket" ||
          (url.includes(".") && !url.startsWith("/index.html"))
        ) {
          next();
          return;
        }
        if (url === "/index.html" || url.startsWith("/index.html?")) {
          req.url = `/${entry}`;
          next();
          return;
        }
        req.url = `/${entry}`;
        next();
      });
    },
  };
}

export default defineConfig({
  base: pagesBase,
  plugins: [react(), tailwindcss(), pagesBaseTag(pagesBase), spaFallback(ENTRY)],
  define: {
    "import.meta.env.VITE_APP_TARGET": JSON.stringify(TARGET),
  },
  server: {
    host: "127.0.0.1",
    port: PORT,
    strictPort: true,
    cors: true,
    headers: {
      "Content-Security-Policy": "frame-ancestors *",
    },
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "127.0.0.1",
    port: PORT,
    strictPort: true,
    headers: {
      "Content-Security-Policy": "frame-ancestors *",
    },
  },
  build: {
    rollupOptions: {
      input: {
        customer: "customer.html",
        driver: "driver.html",
        admin: "admin.html",
        viewer: "viewer.html",
      },
    },
  },
});
