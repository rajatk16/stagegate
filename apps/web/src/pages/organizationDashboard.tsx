import { Badge } from "@/components/ui";

export const OrganizationDashboard = () => (
  <div className="space-y-6">
    <section className="rounded-2xl border border-dashed bg-card/50 p-6">
      <Badge variant="outline">
        Coming next
      </Badge>
      <h2 className="mt-4 text-xl font-semibold">
        Projects and workflows
      </h2>

      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
        Your organization’s projects and workflows will
        appear here as those features become available.
      </p>
    </section>
  </div>
);
