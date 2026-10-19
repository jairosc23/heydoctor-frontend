function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-3xl bg-white/10 ${className}`} />;
}

export default function InteractiveDemoLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100" aria-busy="true">
      <div className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="h-3 w-24 rounded bg-indigo-300/40" />
            <div className="mt-2 h-6 w-72 rounded bg-white/20" />
          </div>
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-12 w-32" />
            <SkeletonBlock className="h-12 w-40" />
            <SkeletonBlock className="h-12 w-28" />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-5 sm:py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <SkeletonBlock className="h-96 bg-white/90" />
        <div className="space-y-6">
          <SkeletonBlock className="h-24 bg-white" />
          <SkeletonBlock className="h-64" />
          <SkeletonBlock className="h-[520px] bg-white/90" />
        </div>
      </div>
    </main>
  );
}
