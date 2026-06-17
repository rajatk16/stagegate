import {
  Building2,
  ClipboardList,
  Users,
  BarChart3,
  CalendarDays,
  Mic,
} from 'lucide-react';

const features = [
  {
    title: 'Organizations',
    description: 'Manage multiple events from a single workspace.',
    icon: Building2,
  },
  {
    title: 'Proposal Management',
    description: 'Collect and organize speaker submissions.',
    icon: ClipboardList,
  },
  {
    title: 'Collaborative Reviews',
    description: 'Assign reviewers and score talks.',
    icon: Users,
  },
  {
    title: 'Analytics',
    description: 'Identify top-rated proposals quickly.',
    icon: BarChart3,
  },
  {
    title: 'Event Workspaces',
    description: 'Separate review processes per event.',
    icon: CalendarDays,
  },
  {
    title: 'Speaker Management',
    description: 'Track speakers from submission to acceptance.',
    icon: Mic,
  },
];

export const Features = () => (
  <section id="features" className="container mx-auto px-6 py-24">
    <div className="text-center">
      <h2 className="text-4xl font-bold">Everything needed to run a CFP</h2>

      <p className="mt-4 text-muted-foreground">
        Built specifically for conference organizers.
      </p>
    </div>

    <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <div key={feature.title} className="rounded-xl border p-6">
          <feature.icon className="mb-4 h-8 w-8 text-primary" />

          <h3 className="text-xl font-semibold">{feature.title}</h3>

          <p className="mt-2 text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  </section>
);
