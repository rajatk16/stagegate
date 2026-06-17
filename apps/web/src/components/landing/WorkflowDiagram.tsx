import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

const workflow = [
  'Proposal Submitted',
  'Assigned To Reviewers',
  'Scored & Commented',
  'Discussion',
  'Accepted',
];

export const WorkflowDiagram = () => (
  <section className="py-32">
    <div className="container mx-auto px-6">
      <h2 className="text-center text-4xl font-bold">Review Workflow</h2>

      <p className="mt-4 text-center text-muted-foreground">
        Every proposal follows a structured path.
      </p>

      <div className="mt-20 flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
        {workflow.map((step, index) => (
          <div key={step} className="flex items-center">
            <motion.div
              whileHover={{
                y: -8,
                scale: 1.05,
              }}
              className="w-56 rounded-xl border bg-card p-6 text-center"
            >
              <CheckCircle className="mx-auto mb-4" size={28} />

              <div className="font-medium">{step}</div>
            </motion.div>

            {index !== workflow.length - 1 && (
              <ArrowRight className="mx-4 hidden lg:block" size={20} />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);
