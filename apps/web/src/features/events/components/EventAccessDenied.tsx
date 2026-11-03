import { Link } from 'react-router';
import { useEffect, useRef, useState } from 'react';

import { Button, InlineAlert } from '@/components';

type Props = {
  title?: string;
  description: string;
  backTo: string;
  backLabel?: string;
  onRefresh?: () => Promise<void>;
};

export const EventAccessDenied = ({
  title = 'Access Denied',
  backLabel = 'Back to organization',
  ...props
}: Props) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mountedRef = useRef(false);
  const lockedRef = useRef(false);

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    headingRef.current?.focus();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = async () => {
    if (!props.onRefresh || lockedRef.current) return;

    lockedRef.current = true;
    setRefreshing(true);
    setError(null);

    try {
      await props.onRefresh();
    } catch {
      if (mountedRef.current) {
        setError(
          'Access could not be refreshed. Try again or contact an administrator.',
        );
      }
    } finally {
      lockedRef.current = false;
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  };

  return (
    <section
      aria-labelledby="event-access-denied-heading"
      className="space-y-5 rounded-2xl border bg-card p-6"
    >
      <h2
        id="event-access-denied-heading"
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-semibold"
      >
        {title}
      </h2>

      <p className="max-w-2xl text-muted-foreground">{props.description}</p>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to={props.backTo}>{backLabel}</Link>
        </Button>

        {props.onRefresh && (
          <Button
            type="button"
            disabled={refreshing}
            onClick={() => void refresh()}
          >
            {refreshing ? 'Refreshing access...' : 'Refresh access'}
          </Button>
        )}
      </div>

      {error && <InlineAlert tone="error">{error}</InlineAlert>}
    </section>
  );
};
