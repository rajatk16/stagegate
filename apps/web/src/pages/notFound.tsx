import { Link } from "react-router";

import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export const NotFound = () => (
  <section className="flex min-h-[50vh] flex-col items-center justify-center space-y-5 text-center">
    <p className="text-7xl font-semibold tracking-tight text-primary">
      404
    </p>

    <h1 className="text-2xl font-semibold">Page not found</h1>

    <p className="max-w-md text-muted-foreground">
      This page does not exist. Return to your workspace to continue.
    </p>

    <Button asChild>
      <Link to="/">
        <ArrowLeft className="size-4" aria-hidden="true" />
      </Link>
    </Button>
  </section>
);
