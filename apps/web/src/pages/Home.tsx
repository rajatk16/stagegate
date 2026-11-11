import { Card, CardContent, CardHeader } from '../components/ui/card';

export const Home = () => {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <h1 className="text-2xl font-semibold sm:text-3xl">StageGate</h1>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed text-muted-foreground">
          Run calls for proposals and review talks for your events.
        </p>
      </CardContent>
    </Card>
  );
};
