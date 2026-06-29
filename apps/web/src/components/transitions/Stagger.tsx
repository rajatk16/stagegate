import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface StaggerProps {
  stagger?: number;
}

export const Stagger = ({
  stagger = 0.06,
  children,
}: PropsWithChildren<StaggerProps>) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: stagger,
        },
      },
    }}
  >
    {children}
  </motion.div>
);
