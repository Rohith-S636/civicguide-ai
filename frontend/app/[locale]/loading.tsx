export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-civic-light px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="h-10 w-72 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-44 animate-pulse rounded-2xl bg-white/70" />
        </div>
        <div className="h-80 animate-pulse rounded-3xl bg-white/70" />
      </div>
    </div>
  );
}
