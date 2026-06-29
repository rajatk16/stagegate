import { motion } from 'framer-motion';
import { BarChart3, ClipboardList, Users } from 'lucide-react';

export const DashboardPreview = () => (
  <motion.div
    className="mx-auto mt-20 max-w-6xl"
    initial={{
      opacity: 0,
      scale: 0.95,
      y: 50,
    }}
    animate={{
      opacity: 1,
      scale: 1,
      y: 0,
    }}
    transition={{
      delay: 0.8,
      duration: 0.8,
    }}
  >
    <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
      <div className="grid md:grid-cols-[250px_1fr]">
        <aside className="border-r p-4">
          <div className="font-semibold">React Summit 2027</div>

          <div className="mt-8 space-y-4">
            <div className="flex gap-2">
              <ClipboardList size={18} />
              Proposals
            </div>

            <div className="flex gap-2">
              <Users size={18} />
              Reviewers
            </div>

            <div className="flex gap-2">
              <BarChart3 size={18} />
              Analytics
            </div>
          </div>
        </aside>

        <main className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Proposals" value="2,341" />

            <StatCard title="Reviewers" value="18" />

            <StatCard title="Accepted" value="92" />
          </div>

          <div className="mt-6 rounded-xl border p-6">
            <div className="mb-6 text-sm font-medium">Review Progress</div>

            <div className="space-y-4">
              <ProgressRow title="Frontend" score={95} />
              <ProgressRow title="AI" score={80} />
              <ProgressRow title="DevOps" score={65} />
              <ProgressRow title="Cloud" score={55} />
            </div>
          </div>
        </main>
      </div>
    </div>
  </motion.div>
);

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="rounded-xl border p-4">
    <div className="text-sm text-muted-foreground">{title}</div>

    <div className="mt-2 text-3xl font-bold">{value}</div>
  </div>
);

const ProgressRow = ({ title, score }: { title: string; score: number }) => (
  <div>
    <div className="mb-1 flex justify-between text-sm">
      <span>{title}</span>
      <span>{score}%</span>
    </div>

    <div className="h-2 rounded bg-muted">
      <div
        className="h-2 rounded bg-primary"
        style={{
          width: `${score}%`,
        }}
      />
    </div>
  </div>
);
