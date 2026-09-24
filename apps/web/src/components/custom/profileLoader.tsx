import { User } from "firebase/auth";
import { useEffect, useState } from "react";

import { getProfile, getProfileErrorMessage, Profile } from "@/services";

import { Button } from "../ui";
import { ProfileForm } from "./profileForm";

type ProfileState = 
  | { status: "loading" } 
  | { status: "error"; message: string } 
  | { status: "ready"; profile: Profile };

export const ProfileLoader = ({ user }: { user: User}) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ProfileState>({
    status: "loading"
  });

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const profile = await getProfile(user, controller.signal);

        if (!controller.signal.aborted) {
          setState({ status: 'ready', profile });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message: getProfileErrorMessage(error)
          });
        }
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [user, attempt]);

  if (state.status === 'loading') {
    return (
      <div role="status" aria-live="polite" className="rounded-xl border bg-card p-6 text-muted-foreground">
        Loading your profile...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="max-w-3xl space-y-4 rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold">
          Could not load your profile
        </h1>

        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((value) => value + 1);
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return <ProfileForm user={user} profile={state.profile} />;
}
