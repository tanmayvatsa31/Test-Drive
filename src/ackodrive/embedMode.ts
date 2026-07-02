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
  if (path.startsWith("#")) {
    const [baseWithoutQuery, query = ""] = base.split("?");
    const params = new URLSearchParams(query);
    params.set("embed", "1");
    return `${baseWithoutQuery}?${params.toString()}${path}`;
  }

  const url = new URL(base, typeof window !== "undefined" ? window.location.origin : undefined);
  if (path) {
    const suffix = path.startsWith("/") ? path : `/${path}`;
    url.pathname = `${url.pathname.replace(/\/$/, "")}${suffix}`;
  }
  url.searchParams.set("embed", "1");
  return url.toString();
}
