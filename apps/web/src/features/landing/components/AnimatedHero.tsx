import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui';

import { DashboardPreview } from './DashboardPreview';

export const AnimatedHero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-primary/20 via-transparent to-transparent" />

      <div className="container mx-auto px-6 pt-28 pb-20">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="rounded-full border px-4 py-2 text-sm">
              CFP Management Platform
            </span>
          </motion.div>

          <motion.h1
            className="mt-8 text-6xl font-bold tracking-tight md:text-8xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.6,
            }}
          >
            Run Better
            <span className="block text-primary">Call For Papers</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-8 max-w-2xl text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.4,
              duration: 0.6,
            }}
          >
            Collect, review, score and select conference talks using a
            collaborative workflow built for modern event organizers.
          </motion.p>

          <motion.div
            className="mt-10 flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.6,
            }}
          >
            <Button size="lg" onClick={() => navigate('/login')}>
              Get Started
            </Button>
          </motion.div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
};
