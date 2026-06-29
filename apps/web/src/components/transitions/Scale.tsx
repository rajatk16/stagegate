import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface ScaleProps {
  duration?: number;
}

export const Scale = ({
  duration = 0.18,
  children,
}: PropsWithChildren<ScaleProps>) => (
  <motion.div
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    initial={{ scale: 0.95, opacity: 0 }}
    transition={{ duration }}
  >
    {children}
  </motion.div>
);
