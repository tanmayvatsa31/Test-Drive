/** True when loaded with ?embed=1 (demo viewer iframe — no device shell, no admin tab bootstrap). */
export function isEmbedMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("embed") === "1";
}

function embedCacheBust(): string {
  return import.meta.env.VITE_BUILD_ID ?? "dev";
}

export function applyEmbedDocumentClass(): void {
  if (!isEmbedMode()) return;

  document.documentElement.classList.add("ad-embed");

  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) {
    meta.setAttribute("content", "width=393, initial-scale=1, viewport-fit=cover");
  }
}

export function embedAppUrl(base: string, path = ""): string {
  const cacheBust = embedCacheBust();

  if (path.startsWith("#")) {
    const [baseWithoutQuery, query = ""] = base.split("?");
    const params = new URLSearchParams(query);
    params.set("embed", "1");
    params.set("v", cacheBust);
    return `${baseWithoutQuery}?${params.toString()}${path}`;
  }

  const url = new URL(base, typeof window !== "undefined" ? window.location.origin : undefined);
  if (path) {
    const suffix = path.startsWith("/") ? path : `/${path}`;
    url.pathname = `${url.pathname.replace(/\/$/, "")}${suffix}`;
  }
  url.searchParams.set("embed", "1");
  url.searchParams.set("v", cacheBust);
  return url.toString();
}
