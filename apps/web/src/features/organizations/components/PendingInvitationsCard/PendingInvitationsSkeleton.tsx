import {
  Card,
  Table,
  Skeleton,
  TableRow,
  CardTitle,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  CardContent,
  TableHeader,
} from '@/components/ui';

const ROWS = 5;

export const PendingInvitationsSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead>Expired</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: ROWS }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
