import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

import { Button } from '../ui/Button';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('StageGate application error', error, info);
    }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center p-6">
          <div role="alert" className="max-w-md space-y-4 text-center">
            <AlertTriangle className="mx-auto size-12 text-destructive" aria-hidden="true" />

            <h1 className="text-2xl font-semibold">Something went wrong</h1>

            <p className="text-muted-foreground">
              StageGate encountered an unexpected application error. Reload the page to try again.
            </p>

            <Button
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload application
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
