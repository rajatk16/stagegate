import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { Layers3, LayoutDashboard, Activity, UserRound } from "lucide-react";

import { AuthStatus, ThemeToggle } from "@/components/custom";
import { useAuth } from "@/hooks";
import { ErrorBoundary } from "./errorBoundary";

const navigation = [
  {
    to: "/",
    label: "Overview", 
    icon: LayoutDashboard
  },
  {
    to: "/connection",
    label: "Connection",
    icon: Activity
  },
  {
    to: "/profile",
    label: "Profile",
    icon: UserRound
  }
];

const pageTitles: Record<string, string> = {
  "/": "Overview",
  "/connection": "Connection",
  "/sign-in": "Sign in",
  "/register": "Create Account",
  "/verify-email": "Verify email",
  "/forgot-password": "Reset password",
  "/auth/action": "Account recovery",
  "/profile": "Profile"
}

export const AppShell = () => {
  const location = useLocation();
  const { pathname } = location;
  const session = useAuth();

  const pageBoundaryKey = `${location.key}:${session.user?.uid ?? session.status}`
  const mainRef = useRef<HTMLElement>(null);

  const title = pageTitles[pathname] ?? 'Page not found';

  useEffect(() => {
    document.title = `${title} | StageGate`;
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, title]);

  return  (
    <div className="stagegate-surface min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:p-3 focus:text-primary-foreground">
        Skip to content
      </a>
      <div className="mx-auto min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b bg-card/70 p-5 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:p-6">
        <Link to="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Layers3 className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold">StageGate</span>
              <span className="block text-xs text-muted-foreground">
                Project workspace
              </span>
            </span>
          </Link>

          <nav 
            aria-label="main navigation"
            className="mt-6 flex flex-wrap gap-2 md:mt-10 md:flex-col"
          >
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm",
                  "transition-colors focus-visible:outline-2",
                  "focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                ].join(" ")
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-background/80 px-6 py-4 backdrop-blur md:px-10">
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">
                StageGate workspace
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <AuthStatus />
              <ThemeToggle />
            </div>
          </header>

          <main
            ref={mainRef}
            id="main-content"
            tabIndex={-1}
            className="mx-auto max-w-6xl space-y-8 px-6 py-10 md:px-10 md:py-14"
          >
            <ErrorBoundary key={pageBoundaryKey} scope="page">
              <Outlet />
            </ErrorBoundary>

            <footer className="border-t pt-6 text-xs text-muted-foreground">
              StageGate - Built one stage at a time
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
