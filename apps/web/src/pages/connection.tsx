import { ApiConnection } from "@/components/custom";

export const Connection = () => (
  <div className="space-y-8">
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight">
        API connection
      </h1>

      <p className="text-muted-foreground">
        Check the latest connection status and retry when needed.
      </p>
    </section>

    <div className="max-w-2xl">
      <ApiConnection />
    </div>
  </div>
);
