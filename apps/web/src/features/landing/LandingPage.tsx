import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Layers3,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router';

import { paths } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const features = [
  {
    icon: FileText,
    title: 'Collect proposals',
    description: 'Build a structured submission experience for your conference speakers.',
  },
  {
    icon: UsersRound,
    title: 'Collaborate with reviewers',
    description: 'Organize your review committee and coordinate proposal evaluation.',
  },
  {
    icon: ClipboardCheck,
    title: 'Make informed decisions',
    description: 'Compare proposals using consistent criteria and transparent workflows.',
  },
  {
    icon: CalendarDays,
    title: 'Build your conference',
    description: 'Turn selected proposals into a curated conference program.',
  },
];

export const LandingPage = () => (
  <>
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
          <Layers3 className="size-4 text-primary" aria-hidden="true" />
          Conference management platform
        </div>

        <h1
          aria-label="From Call for Papers to Conference Stage."
          className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          From Call for Papers
          <span className="block text-primary">to Conference Stage.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          StageGate is being built to help event organizers collect proposals, coordinate reviews
          and select exceptional talks from one collaborative workspace.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to={paths.app.root}>
              Explore organizer workspace
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild>
            <Link to={paths.speaker.root}>Speaker portal</Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Development preview — conference workflows are not yet available.
        </p>
      </div>
    </section>

    <section aria-labelledby="features-heading" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 max-w-2xl space-y-3">
        <h2 id="features-heading" className="text-3xl font-semibold tracking-tight">
          One platform for the entire CFP lifecycle
        </h2>

        <p className="text-muted-foreground">
          Designed for conference organizers, program committees, reviewers and speakers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </div>

              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  </>
);
