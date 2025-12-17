'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ANIMATION_EASING } from '@/presentation/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: ANIMATION_EASING.gentle,
          }
        }}
        exit={{
          opacity: 0,
          y: -10,
          transition: {
            duration: 0.3,
            ease: ANIMATION_EASING.gentle,
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
