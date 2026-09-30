import { NavLink } from "react-router";
import { LayoutDashboard, UserRound } from "lucide-react";

import { AuthStatus, ThemeToggle } from "@/components/custom";

import { SkipLink } from "./skipLink";
import { SiteBrand } from "./siteBrand";
import { SiteFooter } from "./siteFooter";
import { PageContent } from "./pageContent";

const navigation = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: UserRound,
  },
];

export const AppShell = () => (
  <div className="stagegate-surface min-h-screen bg-background text-foreground">
    <SkipLink />

    <div className="mx-auto min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b bg-card/70 p-5 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:p-6">
        <SiteBrand to="/dashboard" />

        <p className="mt-3 text-xs text-muted-foreground">Your workspace</p>

        <nav
          aria-label="Workspace navigation"
          className="mt-5 flex flex-wrap gap-2 lg:mt-10 lg:flex-col"
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

      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-background/80 px-6 py-4 md:px-10">
          <p className="text-sm font-medium">StageGate workspace</p>

          <div className="flex flex-wrap items-center gap-3">
            <AuthStatus />
            <ThemeToggle />
          </div>
        </header>

        <PageContent className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14" />

        <SiteFooter />
      </div>
    </div>
  </div>
);
