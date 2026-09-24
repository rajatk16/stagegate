import { useAuth } from "@/hooks"
import { ProfileLoader } from "@/components/custom";

export const Profile = () => {
  const session = useAuth();

  if (session.status !== 'authenticated') {
    return null;
  }

  return <ProfileLoader key={session.user.uid} user={session.user} />
}
