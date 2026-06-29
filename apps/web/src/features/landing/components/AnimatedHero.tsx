import { DashboardPreview } from './DashboardPreview';

export const AnimatedHero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-primary/20 via-transparent to-transparent" />

      <div className="container mx-auto px-6 pt-28 pb-20">
        <div className="mx-auto max-w-5xl text-center">
          <div>
            <span className="rounded-full border px-4 py-2 text-sm">
              CFP Management Platform
            </span>
          </div>

          <h1 className="mt-8 text-6xl font-bold tracking-tight md:text-8xl">
            Run Better
            <span className="block text-primary">Call For Papers</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-xl text-muted-foreground">
            Collect, review, score and select conference talks using a
            collaborative workflow built for modern event organizers.
          </p>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
};
