import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { HeroDashboard } from "./HeroDashboard";

export const Hero = () => (
  <section className="relative">
    <div className="absolute inset-0">
      <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[150px]" />
    </div>

    <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center">
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
            Built for Conference Organizers
          </div>

          <h1 className="mt-8 text-5xl font-bold leading-tight lg:text-7xl">
            Run Better CFP Reviews.
          </h1>

          <p className="mt-6 text-xl text-slate-400">
            Collect proposals, manage reviewers, and select the best talks-all in one place.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="rounded-xl bg-indigo-600 px-6 py-3 font-medium">
              Start Free
            </button>
          </div>

          <div className="mt-10 grid gap-3">
            {[
              "Blind Reviews",
              "Unlimited Reviewers",
              "Analytics",
              "Multi-Event Support"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check size={18} className="text-emerald-400" />
                <span className="text-slate-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <HeroDashboard />
    </div>
  </section>
)