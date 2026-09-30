import { Link } from "react-router";

import { ThemeToggle, PublicAuthActions } from "@/components/custom";

import { SkipLink } from "./skipLink";
import { SiteBrand } from "./siteBrand";
import { SiteFooter } from "./siteFooter";
import { PageContent } from "./pageContent";

export const PublicLayout = () => (
  <div className="stagegate-surface flex min-h-screen flex-col bg-background text-foreground">
    <SkipLink />

    <header className="border-b bg-background/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5">
        <SiteBrand />

        <nav
          aria-label="Public navigation"
          className="flex items-center gap-5 text-sm text-muted-foreground"
        >
          <Link
            to="/#how-it-works"
            className="rounded hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            How it works
          </Link>

          <Link
            to="/#whats-next"
            className="rounded hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            What’s next
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <PublicAuthActions />
          <ThemeToggle />
        </div>
      </div>
    </header>

    <PageContent className="mx-auto w-full max-w-7xl px-6 py-12 md:py-20" />

    <SiteFooter />
  </div>
);
