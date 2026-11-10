import { Card, CardContent, CardHeader } from '../components/ui/card';

export const Home = () => {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-3xl font-semibold">StageGate</h1>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Run calls for proposals and review talks for your events.
        </p>
      </CardContent>
    </Card>
  );
};
