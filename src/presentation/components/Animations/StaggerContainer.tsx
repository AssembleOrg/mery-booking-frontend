'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { ANIMATION_TIMING } from '@/presentation/lib/animations';

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = ANIMATION_TIMING.stagger,
  initialDelay = 0,
  className,
  once = true,
  amount = 0.2,
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
