import {
  ArrowDown,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ClipboardCheck,
  MessageSquare,
  Mic2,
  Users,
  Wrench,
} from 'lucide-react';

import { Badge, Button } from '@/components';
import { PublicAuthActions } from '@/features';

const proposals = [
  {
    title: 'Building software that everyone can use',
    category: 'Accessibility',
    format: 'Talk',
    duration: '30 min',
    icon: Mic2,
  },
  {
    title: 'From first prototype to production',
    category: 'Engineering',
    format: 'Workshop',
    duration: '90 min',
    icon: Wrench,
  },
  {
    title: 'What makes a developer community thrive?',
    category: 'Community',
    format: 'Talk',
    duration: '45 min',
    icon: Mic2,
  },
];

const features = [
  {
    icon: Building2,
    title: 'Your organization. Your events.',
    description:
      'Give your team a shared home, add your branding, and keep your events together.',
    status: 'Available now',
  },
  {
    icon: Users,
    title: 'Bring the right people together.',
    description:
      'Invite teammates and manage their roles and access as your organizing team grows.',
    status: 'Available now',
  },
  {
    icon: ClipboardCheck,
    title: 'Give every proposal a thoughtful review.',
    description:
      'A dedicated review workflow for evaluating talks and workshops with your team.',
    status: 'Coming next',
  },
];

const workflow = [
  {
    number: '01',
    title: 'Bring your team',
    description:
      'Create your organization, make it yours, and invite the people building the event with you.',
    detail: 'Organizations, branding, and team access',
    available: true,
  },
  {
    number: '02',
    title: 'Start your next event',
    description:
      'Create an event draft inside your organization and give your next gathering a home.',
    detail: 'Organization event lists and draft creation',
    available: true,
  },
  {
    number: '03',
    title: 'Find your next great session',
    description:
      'The next chapter brings proposal submissions and collaborative review into the same workspace.',
    detail: 'CFP submissions and review',
    available: false,
  },
];

const ProposalPreview = () => (
  <figure aria-labelledby="cfp-preview-caption" className="relative min-w-0">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-primary/10 blur-2xl"
    />

    <div className="relative overflow-hidden rounded-3xl border bg-card shadow-2xl shadow-primary/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>

          <div>
            <p className="font-semibold">Community Summit</p>
            <p className="text-xs text-muted-foreground">
              An example event workspace
            </p>
          </div>
        </div>

        <Badge variant="outline">Concept preview</Badge>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              The next great idea
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Starts with a proposal.
            </h2>
          </div>

          <Mic2
            aria-hidden="true"
            className="hidden size-8 shrink-0 text-primary/50 sm:block"
          />
        </div>

        <ul className="space-y-3">
          {proposals.map(
            ({ title, category, format, duration, icon: Icon }, index) => (
              <li
                key={title}
                className={[
                  'rounded-2xl border p-4',
                  index === 0
                    ? 'border-primary/30 bg-primary/5'
                    : 'bg-background/60',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-6">{title}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{format}</span>
                      <span>{duration}</span>
                      <span className="text-primary">{category}</span>
                    </div>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>

        <div className="rounded-2xl bg-muted/70 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare aria-hidden="true" className="size-4 text-primary" />
            A conversation behind every decision
          </div>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Consider the idea, the audience, and what attendees will take away.
          </p>
        </div>
      </div>

      <figcaption
        id="cfp-preview-caption"
        className="border-t px-5 py-3 text-xs leading-5 text-muted-foreground sm:px-6"
      >
        An illustrative preview of the planned CFP experience. Sample proposals;
        submission and review tools are coming next.
      </figcaption>
    </div>
  </figure>
);

export const Landing = () => (
  <div className="space-y-20 md:space-y-28">
    <section
      aria-labelledby="landing-heading"
      className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16"
    >
      <div className="min-w-0 space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs font-medium">
          <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
          Built for the people behind the program
        </div>

        <h1
          id="landing-heading"
          className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-6xl xl:text-7xl"
        >
          Great events start with{' '}
          <span className="text-primary">great ideas.</span>
        </h1>

        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          Give those ideas a place to become talks, workshops, and memorable
          sessions. StageGate is a call for proposals platform in the making,
          built around organizations and the teams reviewing their next event’s
          program.
        </p>

        <div className="flex flex-wrap gap-2">
          {['Talks', 'Workshops', 'Community events'].map((format) => (
            <span
              key={format}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
            >
              {format}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <PublicAuthActions includeSignIn={false} />

          <Button asChild variant="outline" className="min-h-11 px-5">
            <a href="#how-it-works">
              Explore the workflow
              <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          </Button>
        </div>

        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          Early access: set up your organization, invite your team, and create
          event drafts today.
        </p>
      </div>

      <ProposalPreview />
    </section>

    <section
      aria-label="Designed for different kinds of events"
      className="flex flex-col gap-5 border-y py-6 md:flex-row md:items-center md:justify-between"
    >
      <p className="text-sm font-medium">
        Big stages. Small rooms. Ideas worth sharing.
      </p>

      <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
        {[
          'Conferences',
          'Community meetups',
          'Hands-on workshops',
          'Internal summits',
        ].map((eventType) => (
          <li key={eventType}>{eventType}</li>
        ))}
      </ul>
    </section>

    <section
      id="for-organizers"
      tabIndex={-1}
      aria-labelledby="organizers-heading"
      className="scroll-mt-8 space-y-9 outline-none"
    >
      <div className="grid gap-5 md:grid-cols-2 md:items-end">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">
            For organizers and review teams
          </p>

          <h2
            id="organizers-heading"
            className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Your next program deserves a shared workspace.
          </h2>
        </div>

        <p className="max-w-lg leading-7 text-muted-foreground md:justify-self-end">
          Building an event brings together people, proposals, and decisions.
          StageGate starts with your organization and grows toward the review
          process at the heart of a great program.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description, status }) => (
          <article
            key={title}
            className="flex flex-col rounded-3xl border bg-card p-6 sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-6" />
              </span>

              <Badge variant="outline">{status}</Badge>
            </div>

            <h3 className="mt-7 text-xl font-semibold leading-7">{title}</h3>

            <p className="mt-3 leading-7 text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>

    <section
      id="how-it-works"
      tabIndex={-1}
      aria-labelledby="workflow-heading"
      className="scroll-mt-8 space-y-9 outline-none"
    >
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold text-primary">
          From your team to the stage
        </p>

        <h2
          id="workflow-heading"
          className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          A clear path to your next event.
        </h2>
      </div>

      <ol className="grid gap-8 md:grid-cols-3">
        {workflow.map(({ number, title, description, detail, available }) => (
          <li key={number} className="border-t-2 border-primary/20 pt-6">
            <span
              aria-hidden="true"
              className="text-4xl font-semibold tracking-tight text-primary/40"
            >
              {number}
            </span>

            <h3 className="mt-4 text-xl font-semibold">{title}</h3>

            <p className="mt-3 leading-7 text-muted-foreground">
              {description}
            </p>

            <div className="mt-5 flex items-start gap-2 text-sm">
              {available ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
              ) : (
                <ArrowRight
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
              )}

              <span>
                {detail}
                {!available && (
                  <span className="block text-xs text-muted-foreground">
                    Coming next
                  </span>
                )}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>

    <section
      aria-labelledby="get-started-heading"
      className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-10 md:px-14 md:py-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 -z-10 size-96 rounded-full bg-indigo-500/20 blur-3xl"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-2xl space-y-5">
          <p className="text-sm font-semibold text-indigo-300">
            Your next event starts here
          </p>

          <h2
            id="get-started-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Bring your team.
            <br />
            Make room for the next great idea.
          </h2>

          <p className="max-w-xl leading-7 text-slate-300">
            Create your StageGate account and set up your organization. Build
            the home for your next event while we build the next chapter of CFP
            review.
          </p>
        </div>

        <div className="space-y-3">
          <PublicAuthActions includeSignIn={false} />
          <p className="text-xs text-slate-400">
            Organizations and event drafts are available now.
          </p>
        </div>
      </div>
    </section>
  </div>
);
