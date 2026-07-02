export function AuthLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <p className="ad-caption text-sm">{label}</p>
    </div>
  );
}
