import { createContext } from "react";

import { Organization } from "@/services";

export type OrganizationsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; organizations: Organization[] };

export type OrganizationsContextValue = {
  state: OrganizationsState;
  reload: () => void;
};

export const OrganizationsContext = createContext<
  OrganizationsContextValue | undefined
>(undefined);
