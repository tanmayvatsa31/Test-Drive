/** True when loaded with ?embed=1 (demo viewer iframe — no device shell, no admin tab bootstrap). */
export function isEmbedMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("embed") === "1";
}

export function applyEmbedDocumentClass(): void {
  if (isEmbedMode()) {
    document.documentElement.classList.add("ad-embed");
  }
}

export function embedAppUrl(base: string, path = ""): string {
  const normalized = base.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  const url = new URL(`${normalized}${suffix}`);
  url.searchParams.set("embed", "1");
  return url.toString();
}
