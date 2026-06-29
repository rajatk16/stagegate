import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface FadeProps {
  delay?: number;
  duration?: number;
}

export const Fade = ({
  delay = 0,
  duration = 0.2,
  ...props
}: PropsWithChildren<FadeProps>) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay }}
  >
    {props.children}
  </motion.div>
);
