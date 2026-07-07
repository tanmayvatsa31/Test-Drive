/** Resolve a `public/` asset from the app base URL (not the current route path). */
export function publicAsset(path: string): string {
  const normalized = path.replace(/^\//, "");
  const base = import.meta.env.BASE_URL ?? "/";

  if (typeof window !== "undefined") {
    return new URL(normalized, new URL(base, window.location.origin)).href;
  }

  return `${base}${normalized}`;
}

/** Build a responsive `srcSet` with base-aware URLs. */
export function publicAssetSrcSet(
  entries: ReadonlyArray<{ path: string; width: number }>,
): string {
  return entries.map(({ path, width }) => `${publicAsset(path)} ${width}w`).join(", ");
}
