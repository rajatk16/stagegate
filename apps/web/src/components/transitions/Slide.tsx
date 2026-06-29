import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface SlideProps {
  y?: number;
  duration?: number;
}

export const Slide = ({
  y = 16,
  duration = 0.2,
  ...props
}: PropsWithChildren<SlideProps>) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y }}
    transition={{ duration }}
  >
    {props.children}
  </motion.div>
);
