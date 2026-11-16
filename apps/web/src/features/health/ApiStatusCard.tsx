import { Activity, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getApiErrorMessage } from '@/lib/apiErrorMessage';

import { useApiReadiness } from './health.queries';

interface HealthStatusView {
  status: 'ok' | 'unavailable';
  timestamp: string;
}

export function ApiStatusCard() {
  const query = useApiReadiness();
  const data = query.data as unknown as HealthStatusView | undefined;

  const healthy = data?.status === 'ok';

  const unavailable = data?.status === 'unavailable';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" aria-hidden="true" />
              API status
            </CardTitle>

            <CardDescription>StageGate backend connectivity</CardDescription>
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={query.isFetching}
            aria-label="Refresh API status"
            onClick={() => {
              void query.refetch();
            }}
          >
            <RefreshCw
              className={query.isFetching ? 'size-4 animate-spin' : 'size-4'}
              aria-hidden="true"
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          {query.isPending ? (
            <>
              <RefreshCw className="size-4 animate-spin" aria-hidden="true" />

              <span>Checking API status…</span>
            </>
          ) : query.isError ? (
            <>
              <AlertCircle className="size-5 text-destructive" aria-hidden="true" />

              <span>Unable to reach API</span>
            </>
          ) : healthy ? (
            <>
              <CheckCircle2 className="size-5 text-success" aria-hidden="true" />

              <span>Operational</span>
            </>
          ) : unavailable ? (
            <>
              <AlertCircle className="size-5 text-warning" aria-hidden="true" />

              <span>Service unavailable</span>
            </>
          ) : null}
        </div>

        {query.isError ? (
          <p className="text-sm text-muted-foreground">{getApiErrorMessage(query.error)}</p>
        ) : null}

        {data ? (
          <p className="text-xs text-muted-foreground">
            Last checked: {new Date(data.timestamp).toLocaleString()}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
