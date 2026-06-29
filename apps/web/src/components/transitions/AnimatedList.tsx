import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

export const AnimatedList = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

export const AnimatedListItem = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 8,
        },
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      transition={{ duration: 0.2 }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};
