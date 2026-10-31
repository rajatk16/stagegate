import { useEventWorkspace } from '../hooks';

export const EventOverview = () => {
  const { event } = useEventWorkspace();

  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: event.timezone,
  });

  return (
    <section className="space-y-4 rounded-xl border bg-card p-6">
      <h2 className="text-xl font-semibold">{event.name}</h2>

      <p className="whitespace-pre-wrap">
        {event.description || 'No description yet.'}
      </p>
      <p>Format: {event.format?.replaceAll('_', ' ') ?? 'Not set.'}</p>
      <p>Location: {event.location ?? 'Not set.'}</p>

      {event.startsAt && event.endsAt ? (
        <p>
          {formatter.format(new Date(event.startsAt))}
          {' - '}
          {formatter.format(new Date(event.endsAt))}
          {' · '}
          {event.timezone}
        </p>
      ) : (
        'Schedule not set.'
      )}
    </section>
  );
};
