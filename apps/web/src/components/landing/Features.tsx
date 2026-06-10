import {
  Eye,
  Users,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Blind Reviews",
    description:
      "Reduce bias by hiding speaker identity.",
  },
  {
    icon: Users,
    title: "Reviewer Assignment",
    description:
      "Automatically distribute submissions.",
  },
  {
    icon: ClipboardCheck,
    title: "Custom Rubrics",
    description:
      "Create scoring criteria for your event.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track review progress in real time.",
  },
];

export const Features = () => (
  <section
    id="features"
    className="mx-auto max-w-7xl px-6 py-28"
  >
    <div className="text-center">
      <h2 className="text-4xl font-bold">
        Everything you need to run a CFP
      </h2>

      <p className="mt-4 text-slate-400">
        Built specifically for conference
        organizers.
      </p>
    </div>

    <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {features.map((feature) => (
        <FeatureCard
          key={feature.title}
          {...feature}
        />
      ))}
    </div>
  </section>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
    <Icon className="text-indigo-400" />

    <h3 className="mt-4 font-semibold">
      {title}
    </h3>

    <p className="mt-2 text-sm text-slate-400">
      {description}
    </p>
  </div>
);
