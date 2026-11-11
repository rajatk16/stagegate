import { useLayoutEffect } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ClipboardList,
  ListChecks,
  Megaphone,
  Mic2,
} from 'lucide-react';
import { buttonVariants } from '@/constants/variants';
import { WorkspacePreview } from '@/components/home/WorkspacePreview';

const workflow = [
  {
    icon: Megaphone,
    title: 'Open your CFP',
    description:
      'Choose tracks, formats, and a deadline. Share one event page where speakers can submit their talks.',
  },
  {
    icon: ClipboardList,
    title: 'Review submissions',
    description:
      'Assign proposals to reviewers and compare feedback using the same rubric.',
  },
  {
    icon: ListChecks,
    title: 'Build the lineup',
    description:
      'Select talks for your event and publish decisions when you are ready to share them with speakers.',
  },
];

export const Home = () => {
  useLayoutEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView();
    }
  }, []);

  return (
    <>
      <section className="relative isolate overflow-clip border-b border-border/70 bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-44 -right-24 -z-10 size-120 rounded-full bg-primary/10 blur-3xl lg:size-164"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-12 pb-14 sm:gap-12 sm:px-8 sm:pt-16 sm:pb-18 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 lg:py-24">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              Call for proposals software
            </p>
            <h1 className="mt-4 max-w-[14ch] text-[clamp(2.5rem,5.1vw,4.6rem)] leading-[1.02] font-bold tracking-[-0.06em] text-balance">
              Find the talks that belong on your stage.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Open a call for proposals, review talks with your team, and build
              your event lineup in one workspace.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#workflow"
                className={buttonVariants({
                  size: 'lg',
                  className: 'min-h-11 rounded-lg px-4',
                })}
              >
                See how it works <ArrowDown aria-hidden="true" />
              </a>
              <a
                href="#workspace-preview"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  className: 'min-h-11 rounded-lg px-4',
                })}
              >
                Try the preview <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
          <WorkspacePreview />
        </div>
      </section>

      <section
        id="workflow"
        tabIndex={-1}
        aria-labelledby="workflow-title"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-18"
      >
        <h2
          id="workflow-title"
          className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          From an open call to a final lineup
        </h2>
        <ol className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-3">
          {workflow.map(({ icon: Icon, title, description }) => (
            <li key={title} className="border-t border-border pt-5">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="speakers"
        tabIndex={-1}
        aria-labelledby="speakers-title"
        className="mx-auto max-w-7xl px-4 pb-14 sm:px-8 sm:pb-18"
      >
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-center lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Mic2 aria-hidden="true" className="size-4" />
              For speakers
            </div>
            <h2
              id="speakers-title"
              className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
            >
              Have a talk in mind?
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Start from the CFP link shared by the event organizer. The event
              page has the deadline, tracks, and session formats.
            </p>
          </div>
          <dl className="grid gap-4 border-t border-border pt-5 text-sm leading-relaxed lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <div>
              <dt className="font-semibold">Submit with your email</dt>
              <dd className="mt-1 text-muted-foreground">
                Submit as a guest using an email address without a StageGate
                account. Sign in first when using your account email.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Find your proposals later</dt>
              <dd className="mt-1 text-muted-foreground">
                Create an account and verify the same email to see your guest
                submissions and published decisions.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
};
