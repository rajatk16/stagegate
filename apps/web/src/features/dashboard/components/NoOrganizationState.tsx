import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

import { Button, Card, CardContent } from '@/components/ui';

export const NoOrganizationState = () => {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="flex flex-col items-center py-16 text-center">
        <Building2 className="mb-6 h-12 w-12 text-muted-foreground" />

        <h2 className="text-2xl font-semibold">No Organizations Yet.</h2>

        <p className="mt-4 max-w-md text-muted-foreground">
          Create your first organization to start managing your events,
          proposals, and reviews.
        </p>

        <Button asChild className="mt-8">
          <Link to="/create-organization">Create Organization</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
