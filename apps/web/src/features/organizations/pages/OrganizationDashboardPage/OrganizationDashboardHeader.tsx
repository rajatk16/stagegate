export const OrganizationDashboardHeader = ({ name }: { name: string }) => (
  <header className="space-y-2">
    <h1 className="text-2xl font-bold">{name}</h1>
    <p className="text-muted-foreground">
      Welcome to your organization workspace.
    </p>
  </header>
);
