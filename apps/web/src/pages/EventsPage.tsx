export function EventsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Events</h1>

        <p className="mt-2 text-slate-600">Event management will be introduced during Week 6.</p>
      </header>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <h2 className="text-base font-semibold text-slate-950">No events to display</h2>

        <p className="mt-2 text-sm text-slate-600">Event creation is not available yet.</p>
      </div>
    </div>
  );
}
