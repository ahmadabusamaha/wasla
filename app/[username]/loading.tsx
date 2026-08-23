export default function BioLoading() {
  return (
    <div className="min-h-svh bg-muted/30">
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-12">
        <div className="size-24 animate-pulse rounded-full bg-muted" />
        <div className="mt-4 h-6 w-36 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-muted" />
        <div className="mt-8 w-full space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-14 w-full animate-pulse rounded-xl border bg-card"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
