import {
  ClipboardList,
  ListChecks,
  Megaphone,
  PanelsTopLeft,
} from 'lucide-react';
import { useState } from 'react';

const stages = [
  {
    id: 'cfp',
    label: 'CFP',
    icon: Megaphone,
    title: 'Call for proposals',
    description: 'Publish a call and collect talks on one event page.',
    rows: [
      {
        title: 'Session formats',
        detail: 'Talks, Workshops, and Panel Discussions',
        status: 'Configured',
        tone: 'complete',
      },
      {
        title: 'Tracks',
        detail: 'Engineering, Design, Community',
        status: 'Configured',
        tone: 'complete',
      },
      {
        title: 'Public submission page',
        detail: 'Open through May 18',
        status: 'Open',
        tone: 'active',
      },
    ],
  },
  {
    id: 'review',
    label: 'Review',
    icon: ClipboardList,
    title: 'Proposal review',
    description: 'Track each talk from assignment through decision.',
    rows: [
      {
        title: 'Designing for the in-between',
        detail: 'Design · 2 reviews',
        status: 'Reviewed',
        tone: 'complete',
      },
      {
        title: 'A field guide to fast APIs',
        detail: 'Engineering · 1 review',
        status: 'In review',
        tone: 'active',
      },
      {
        title: 'Making room for first-time speakers',
        detail: 'Community · 0 reviews',
        status: 'Assigned',
        tone: 'neutral',
      },
    ],
  },
  {
    id: 'lineup',
    label: 'Lineup',
    icon: ListChecks,
    title: 'Talk decisions',
    description: 'Select talks and publish outcomes to speakers.',
    rows: [
      {
        title: 'Designing for the in-between',
        detail: 'Design · Talk',
        status: 'Accepted',
        tone: 'complete',
      },
      {
        title: 'A field guide to fast APIs',
        detail: 'Engineering · Workshop',
        status: 'Decision pending',
        tone: 'active',
      },
      {
        title: 'Making room for first-time speakers',
        detail: 'Community · Talk',
        status: 'Decision pending',
        tone: 'active',
      },
    ],
  },
] as const;

const statusStyles = {
  complete: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
  active: 'border-violet-400/30 bg-violet-400/15 text-violet-200',
  neutral: 'border-slate-500/50 bg-slate-500/15 text-slate-200',
};

type Stage = (typeof stages)[number];

export const WorkspacePreview = () => {
  const [stage, setStage] = useState<Stage>(stages[1]);

  return (
    <section
      id="workspace-preview"
      aria-label="Sample StageGate workspace"
      tabIndex={-1}
      className="min-w-0 rounded-3xl border border-indigo-300/20 bg-[#17162a] bg-[radial-gradient(ellipse_at_top_right,#493484_0%,#211b3b_50%,#17162a_100%)] p-2.5 text-white shadow-2xl shadow-indigo-950/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:p-4"
    >
      <div className="rounded-2xl border border-white/15 bg-[#161827]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5 text-sm font-semibold">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-400/15 text-indigo-200">
              <PanelsTopLeft aria-hidden="true" className="size-4" />
            </span>
            Northstar Conf
          </div>
          <span className="text-xs font-medium text-slate-300">
            Sample workspace
          </span>
        </div>
        <div
          role="group"
          aria-label="Preview stage"
          className="grid grid-cols-3 gap-1 border-b border-white/10 p-2 sm:gap-2 sm:px-4"
        >
          {stages.map((option) => {
            const Icon = option.icon;
            const selected = stage.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                aria-controls="preview-board"
                onClick={() => setStage(option)}
                className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 sm:text-sm ${selected ? 'bg-indigo-400/20 text-indigo-100' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {option.label}
              </button>
            );
          })}
        </div>
        <div id="preview-board" className="p-4 sm:p-5">
          <h2
            aria-live="polite"
            className="text-xl font-semibold tracking-tight"
          >
            {stage.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            {stage.description}
          </p>
          <ul className="mt-4 grid gap-2">
            {stage.rows.map((row) => (
              <li
                key={row.title}
                className="flex min-w-0 flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-x-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug">
                    {row.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {row.detail}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[row.tone]}`}
                >
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
