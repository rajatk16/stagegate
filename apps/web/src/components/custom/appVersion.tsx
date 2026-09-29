export const AppVersion = () => (
  <span className="inline-flex flex-wrap items-center gap-2">
    <span aria-label={`Application version ${__APP_VERSION__}`}>
      v{__APP_VERSION__}
    </span>

    {import.meta.env.DEV && (
      <span className="rounded-md border px-1.5 py-0.5 text-[10px]">
        Development
      </span>
    )}
  </span>
);
