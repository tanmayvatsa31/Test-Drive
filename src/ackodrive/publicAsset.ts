/** Resolve a `public/` asset against the current document (works on GitHub Pages subpaths and local dev). */
export function publicAsset(path: string): string {
  const normalized = path.replace(/^\//, "");
  if (typeof document !== "undefined") {
    return new URL(normalized, document.baseURI).href;
  }
  const base = import.meta.env.BASE_URL;
  return `${base}${normalized}`;
}

/** Build a responsive `srcSet` with base-aware URLs. */
export function publicAssetSrcSet(
  entries: ReadonlyArray<{ path: string; width: number }>,
): string {
  return entries.map(({ path, width }) => `${publicAsset(path)} ${width}w`).join(", ");
}
