import { User } from "firebase/auth";
import { Outlet } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks";
import { OrganizationsContext, OrganizationsState } from "@/context";
import {
  listMyOrganizations,
  getOrganizationListErrorMessage,
} from "@/services";

const OrganizationSession = ({ user }: { user: User }) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<OrganizationsState>({
    status: "loading",
  });

  const requestRef = useRef<AbortController | null>(null);

  const reload = useCallback(() => {
    requestRef.current?.abort();
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;

    const load = async () => {
      try {
        const organizations = await listMyOrganizations(
          user,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setState({
            status: "ready",
            organizations,
          });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            message: getOrganizationListErrorMessage(error),
          });
        }
      }
    };

    void load();

    return () => {
      controller.abort();

      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    };
  }, [user, attempt]);

  return (
    <OrganizationsContext.Provider value={{ state, reload }}>
      <Outlet />
    </OrganizationsContext.Provider>
  );
};

export const OrganizationsProvider = () => {
  const session = useAuth();

  if (session.status !== "authenticated") {
    return null;
  }

  return <OrganizationSession key={session.user.uid} user={session.user} />;
};
