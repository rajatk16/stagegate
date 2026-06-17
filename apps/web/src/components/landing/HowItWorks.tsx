const steps = [
  {
    number: '01',
    title: 'Collect',
    description: 'Open submissions and gather proposals.',
  },
  {
    number: '02',
    title: 'Review',
    description: 'Assign reviewers and collect feedback.',
  },
  {
    number: '03',
    title: 'Select',
    description: 'Accept the best talks and notify speakers.',
  },
];

export const HowItWorks = () => (
  <section className="border-y bg-muted/30">
    <div className="container mx-auto px-6 py-24">
      <h2 className="text-center text-4xl font-bold">How It Works</h2>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <h3 className="text-2xl font-semibold">{step.title}</h3>

            <p className="mt-3 text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
