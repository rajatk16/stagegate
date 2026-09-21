import { Link} from 'react-router';
import { ArrowRight, Layers3 } from "lucide-react";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const Overview = () => (
  <div className="space-y-8">
    <section className="space-y-4">
      <Badge variant="secondary">Your Workspace</Badge>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Welcome to StageGate.
      </h1>

      <p className="max-w-xl leading-7 text-muted-foreground">
        A focused workspace for moving projects forward.
        Check your connection and prepare for your next stage.
      </p>

      <Card className="border-dashed bg-card/60 shadow-none">
        <CardHeader>
          <CardTitle>
            Your workspace starts here
          </CardTitle>
          <CardDescription>
            The foundation for your project dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border border-dashed px-6 py-10 text-center">
            <Layers3 
              className="mx-auto mb-4 size-8 text-primary"
              aria-hidden="true"
            />

            <p className="font-medium">Ready for the next stage</p>

            <p className="mt-2 text-sm text-muted-foreground">
              Project features will appear here as we build StageGate.
            </p>
          </div>

          <Button asChild>
            <Link to="/connection">
              Check API connection
              <ArrowRight className='size-4' aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  </div>
);
