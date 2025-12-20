'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { ANIMATION_TIMING, ANIMATION_EASING } from '@/presentation/lib/animations';

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function StaggerItem({
  children,
  className,
  direction = 'up',
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const directionOffset = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          ...directionOffset[direction],
        },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: {
            duration: ANIMATION_TIMING.duration,
            ease: ANIMATION_EASING.default,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
