import { Check, Layers3, MailCheck, UserRound, ArrowRight } from "lucide-react";

import { Badge, Button } from "@/components/ui";
import { PublicAuthActions } from "@/components/custom";

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Create your account",
    description: "Get started with your email and password.",
  },
  {
    number: "02",
    icon: MailCheck,
    title: "Verify your email",
    description: "Confirm your email address to open your workspace.",
  },
  {
    number: "03",
    icon: Layers3,
    title: "Make it yours",
    description: "Add your name, affiliation, biography, and timezone.",
  },
];

export const Landing = () => (
  <div className="space-y-24 md:space-y-32">
    <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
      <div className="space-y-7">
        <Badge variant="secondary">StageGate · Early access</Badge>

        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Every project starts with a clear next step.
        </h1>

        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          A focused workspace for moving forward, one stage at a time. Start
          with your account and profile. Project workflows are coming next.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <PublicAuthActions includeSignIn={false} />

          <Button asChild variant="outline" className="min-h-11 px-5">
            <a href="#how-it-works">
              See how it works
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          A simple start. Space to grow.
        </p>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-5 rounded-[2rem] bg-primary/10 blur-2xl"
        />

        <div className="relative rounded-3xl border bg-card p-6 shadow-xl sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b pb-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Your first steps
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                A workspace that starts with you
              </h2>
            </div>

            <Layers3
              aria-hidden="true"
              className="size-8 shrink-0 text-primary"
            />
          </div>

          <ol className="mt-6 space-y-4">
            {[
              ["Your account", "Email sign-in and verification"],
              ["Your profile", "The details that make it yours"],
              ["Your next stage", "Project workflows coming next"],
            ].map(([title, description], index) => (
              <li
                key={title}
                className="flex items-start gap-4 rounded-2xl bg-muted/60 p-4"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </span>

                <div>
                  <p className="font-medium">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>

    <section
      id="how-it-works"
      tabIndex={-1}
      className="scroll-mt-8 space-y-8 outline-none"
    >
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold text-primary">
          A straightforward beginning
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Get ready for your next stage.
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {steps.map(({ number, icon: Icon, title, description }) => (
          <article key={number} className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <Icon aria-hidden="true" className="size-6 text-primary" />
              <span className="text-sm text-muted-foreground">{number}</span>
            </div>

            <h3 className="mt-6 text-lg font-semibold">{title}</h3>
            <p className="mt-3 leading-7 text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>

    <section
      id="whats-next"
      tabIndex={-1}
      className="grid scroll-mt-8 gap-8 rounded-3xl border bg-card p-8 outline-none md:grid-cols-2 md:p-12"
    >
      <div className="space-y-4">
        <Badge variant="outline">Available today</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">
          The foundation is ready.
        </h2>

        <ul className="space-y-3 text-muted-foreground">
          {[
            "Email sign-in, verification, and password recovery",
            "A personal profile with your timezone",
            "A workspace with light and dark themes",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Check
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-primary"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-start justify-center space-y-5 md:border-l md:pl-8">
        <p className="text-lg font-medium">
          Next: bringing your projects into the workspace.
        </p>
        <p className="leading-7 text-muted-foreground">
          Project workflows are still being built. Create your account and set
          up your profile to get started with what is available now.
        </p>

        <PublicAuthActions includeSignIn={false} />
      </div>
    </section>
  </div>
);
