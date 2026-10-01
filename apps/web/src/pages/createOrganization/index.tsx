import { useAuth } from "@/hooks";

import { CreateOrganizationContent } from "./createOrganizationContent";

export const CreateOrganization = () => {
  const session = useAuth();

  if (session.status !== "authenticated") {
    return null;
  }

  return (
    <CreateOrganizationContent key={session.user.uid} user={session.user} />
  );
};
