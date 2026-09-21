import { Activity, Layers3, LayoutDashboard } from "lucide-react";

import { ApiConnection, ThemeToggle } from "@/components/custom";
import { 
  Card,
  Badge, 
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription
} from "@/components/ui";

export default function App() {
  return (
    <div className="stagegate-surface min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:p-3 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div className="mx-auto min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b bg-card/70 p-5 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:p-6">
          <a href="#overview" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Layers3 className="size-5" aria-hidden="true" />
            </span>

            <span>
              <span className="block font-semibold tracking-tight">
                StageGate
              </span>
              <span className="block text-xs text-muted-foreground">
                Project workspace
              </span>
            </span>
          </a>

          <nav
            aria-label="Main navigation"
            className="mt-6 flex gap-2 md:mt-10 md:flex-col"
          >
            <a
              href="#overview"
              className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Overview
            </a>

            <a
              href="#connection"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Activity className="size-4" aria-hidden="true" />
              Connection
            </a>
          </nav>

          <p className="mt-8 hidden text-xs leading-5 text-muted-foreground md:block">
            A clear starting point for your next stage.
          </p>
        </aside>

        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-background/80 px-6 py-4 backdrop-blur md:px-10">
            <div>
              <p className="text-sm font-medium">Workspace overview</p>
              <p className="text-xs text-muted-foreground">
                Your foundation starts here
              </p>
            </div>

            <ThemeToggle />
          </header>

          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto max-w-6xl space-y-8 px-6 py-10 md:px-10 md:py-14"
          >
            <section id="overview" className="scroll-mt-6 space-y-4">
              <Badge variant="secondary">Day 1 · Foundation</Badge>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome to StageGate.
              </h1>

              <p className="max-w-xl leading-7 text-muted-foreground">
                A focused workspace for moving projects forward.
                Start by checking your connection and choosing your theme.
              </p>
            </section>

            <div className="grid items-start gap-6 xl:grid-cols-[1.2fr_1fr]">
              <ApiConnection />

              <Card className="border-dashed bg-card/60 shadow-none">
                <CardHeader>
                  <CardTitle>Your workspace starts here</CardTitle>
                  <CardDescription>
                    The foundation for your project dashboard.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="rounded-xl border border-dashed px-6 py-10 text-center">
                    <Layers3
                      className="mx-auto mb-4 size-8 text-primary"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-medium">
                      Ready for the next stage
                    </p>
                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                      Project features will appear here as we build
                      the next parts of StageGate.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <footer className="border-t pt-6 text-xs text-muted-foreground">
              StageGate · Built one stage at a time
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
