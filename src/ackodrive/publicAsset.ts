/** Resolve a `public/` asset path against Vite `base` (e.g. `/Test-Drive/` on GitHub Pages). */
export function publicAsset(path: string): string {
  const normalized = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${normalized}`;
}

/** Build a responsive `srcSet` with base-aware URLs. */
export function publicAssetSrcSet(
  entries: ReadonlyArray<{ path: string; width: number }>,
): string {
  return entries.map(({ path, width }) => `${publicAsset(path)} ${width}w`).join(", ");
}
