import { Button } from '../ui';

export const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-primary/20 via-transparent to-transparent" />
    <div className="container mx-auto px-6 py-32">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex rounded-full border px-4 py-2 text-sm">
          CFP Management Platform
        </div>
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
          Run Better
          <span className="text-primary"> Call for Papers</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-xl text-muted-foreground">
          Collect, review and select conference talks with a collaborative
          workflow designed for modern event organizers.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg">Get Started</Button>
        </div>
      </div>
    </div>
  </section>
);
