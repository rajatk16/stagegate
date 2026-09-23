const DEFAULT_RETURN_TO = "/";

const allowedReturnPaths = new Set([
  "/",
  "/connection"
]);

export const getSafeReturnTo = (value: string | null | undefined): string => {
  if (!value || !value.startsWith('/') || value.startsWith("//")) {
    return DEFAULT_RETURN_TO;
  }

  try {
    const url = new URL(value, window.location.origin);

    if (url.origin !== window.location.origin) {
      return DEFAULT_RETURN_TO;
    }

    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (!allowedReturnPaths.has(pathname)) {
      return DEFAULT_RETURN_TO;
    }

    return `${pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_RETURN_TO;
  }
}

export const getAuthUrl = (
  page: "/sign-in" | "/register" | "/verify-email" | "/forgot-password",
  returnTo: string
): string => {
  const search = new URLSearchParams({
    returnTo: getSafeReturnTo(returnTo)
  });

  return `${page}?${search.toString()}`;
}

export const getEmailReturnTo = (continueUrl: string | null): string => {
  if (!continueUrl) return "/";

  try {
    const url = new URL(continueUrl);

    if (url.origin !== window.location.origin) {
      return "/";
    }

    return getSafeReturnTo(url.searchParams.get("returnTo"));
  } catch {
    return "/";
  }
}
