import { PropsWithChildren, useEffect, useRef } from "react";
import { matchPath, Outlet, useLocation } from "react-router";

import { useAuth } from "@/hooks";
import { ORGANIZATION_ROUTE_PATTERN, ORGANIZATION_SECTIONS } from "@/lib";

import { ErrorBoundary } from "./errorBoundary";

interface Props {
  className: string;
}

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/sign-in": "Sign in",
  "/register": "Create account",
  "/verify-email": "Verify email",
  "/forgot-password": "Reset password",
  "/auth/action": "Account recovery",
  "/organizations/new": "Create organization",
  "/organizations": "Organizations",
};

export const PageContent = (props: PropsWithChildren<Props>) => {
  const session = useAuth();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  const organizationSection = Object.values(
    ORGANIZATION_SECTIONS,
  ).find((section) => {
    const pattern = section.segment ? `${ORGANIZATION_ROUTE_PATTERN}/${section.segment}` : ORGANIZATION_ROUTE_PATTERN;

    return Boolean(matchPath(pattern, location.pathname));
  });

  const title = pageTitles[location.pathname] ?? (organizationSection ? `Organization ${organizationSection.label.toLowerCase()}` : 'Page not found');
  const boundaryKey = `${location.key}:${session.user?.uid ?? session.status}`;

  useEffect(() => {
    document.title = `${title} | StageGate`;

    if (location.hash) {
      const section = document.getElementById(location.hash.slice(1));

      section?.scrollIntoView();
      section?.focus({ preventScroll: true });
      return;
    }

    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash, title]);

  return (
    <main
      ref={mainRef}
      id="main-content"
      tabIndex={-1}
      className={`min-w-0 flex-1 outline-none ${props.className}`}
    >
      <ErrorBoundary key={boundaryKey} scope="page">
        {props.children ?? <Outlet />}
      </ErrorBoundary>
    </main>
  );
};
