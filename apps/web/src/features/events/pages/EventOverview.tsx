import { useEventWorkspace } from '../hooks';
import { formatEventInstant } from '../utils/eventTimeUtils';

export const EventOverview = () => {
  const { event } = useEventWorkspace();

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">{event.name}</h2>
        <p className="whitespace-pre-wrap wrap-break-word">
          {event.description || 'No description yet.'}
        </p>
        <p>Format: {event.format?.replaceAll('_', ' ') ?? 'Not set'}</p>
        <p>Location: {event.location ?? 'Not set.'}</p>
        <p>
          Event timezone: <strong>{event.timezone}</strong>
        </p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium">Event starts</dt>
            <dd>{formatEventInstant(event.startsAt, event.timezone)}</dd>
          </div>
          <div>
            <dt className="font-medium">Event ends</dt>
            <dd>{formatEventInstant(event.endsAt, event.timezone)}</dd>
          </div>
        </dl>
      </section>
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Call for proposals</h2>
        <p className="text-sm">
          All times use <strong>{event.timezone}</strong>. Each date shows its
          applicable UTC offset.
        </p>
        <dl className="grip gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium">CFP opens</dt>
            <dd>
              {formatEventInstant(event.submissionOpensAt, event.timezone)}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Submission deadline</dt>
            <dd>
              {formatEventInstant(event.submissionClosesAt, event.timezone)}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Submission limit per person</dt>
            <dd>{event.maxSubmissionsPerPerson ?? 'No limit'}</dd>
          </div>
          <div>
            <h3 className="font-medium">Submission instructions</h3>

            <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm">
              {event.submissionInstructions || 'No instructions provided.'}
            </p>
          </div>
        </dl>
        <div>
          <h3 className="font-medium">Submission instructions</h3>

          <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm">
            {event.submissionInstructions || 'No instructions provided.'}
          </p>
        </div>
      </section>
    </div>
  );
};
