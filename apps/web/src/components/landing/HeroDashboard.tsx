import { motion } from "framer-motion";

export const HeroDashboard =() => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
  >
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">
          CFP Dashboard
        </h3>
      </div>

      <div className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs text-emerald-400">
        Active
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Metric title="Submissions" value="352" />
      <Metric title="Pending" value="108" />
      <Metric title="Accepted" value="48" />
      <Metric title="Reviewers" value="23" />
    </div>

    <div className="mt-6">
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 w-[68%] rounded-full bg-indigo-500" />
      </div>

      <p className="mt-2 text-sm text-slate-400">
        Review Progress 68%
      </p>
    </div>
  </motion.div>
);

const Metric = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-sm text-slate-400">
      {title}
    </p>

    <h4 className="mt-2 text-2xl font-bold">
      {value}
    </h4>
  </div>
);
