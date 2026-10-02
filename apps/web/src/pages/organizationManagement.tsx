import { Badge } from "@/components/ui";
import { useActiveOrganization } from "@/hooks"

export const OrganizationSettings = () => {
  const organization = useActiveOrganization();

  return (
    <section
      className="space-y-5 rounded-2xl border bg-card p-6"
    >
      <h2 className="text-xl font-semibold">
        Organization Settings
      </h2>

      <dl className="space-y-4">
        <div>
          <dt className="mt-1 wrap-break-word">
            {organization.name}
          </dt>
        </div>

        <div>
          <dt className="text-sm text-muted-foreground">
            Slug
          </dt>
          <dd className="mt-1 break-all">
            {organization.slug}
          </dd>
        </div>
      </dl>

      <div className="space-y-2 border-t pt-5">
        <Badge variant="outline">Coming next</Badge>
        <p className="text-sm leading-6 text-muted-foreground">
          Editing organization details will be available here.
        </p>
      </div>
    </section>
  )
}