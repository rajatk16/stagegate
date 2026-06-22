import { useCurrentOrganization } from '@/features/organizations';

const DashboardPage = () => {
  const organization = useCurrentOrganization();
  return (
    <div>
      <h2 className="text-3xl font-bold">Dashboard</h2>

      <p className="mt-2 text-muted-foreground">
        Active Organization: {organization?.name}
      </p>
    </div>
  );
};
export default DashboardPage;
