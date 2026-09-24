import { Component, createRef, ErrorInfo, ReactNode } from "react"

type ErrorBoundaryProps = {
  children: ReactNode;
  scope?: "page" | "application";
}

type ErrorBoundaryState = {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  private fallbackRef = createRef<HTMLElement>();

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true
    }
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    this.fallbackRef.current?.focus();

    if (import.meta.env.DEV) {
      console.error("StageGate rendering error:", error, info.componentStack);
    }
  }

  private retry = () => {
    this.setState({ hasError: false });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const application = this.props.scope === 'application';

    const buttonClassName = "inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

    return (
      <section
        ref={this.fallbackRef}
        tabIndex={-1}
        aria-label="Application Error"
        className={
          application
            ? "flex min-h-screen items-center justify-center bg-background p-6 text-foreground"
            : "rounded-2xl border bg-card p-6 text-card-foreground"
        }
      >
        <div className="max-w-lg space-y-4">
          <h1 className="text-2xl font-semibold">
            {application ? "StageGate could not display this screen": "This page could not be displayed"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Try again. If the problem continues, reload the application
            or return to the overview.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={buttonClassName}
              onClick={this.retry}
            >
              Try again
            </button>

            <button
              type="button"
              className={buttonClassName}
              onClick={() => window.location.reload()}
            >
              Reload application
            </button>

            <a href="/" className={buttonClassName}>
              Go to overview
            </a>
          </div>
        </div>
      </section>
    );
  }
}
