'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { ANIMATION_TIMING, ANIMATION_EASING } from '@/presentation/lib/animations';

interface FadeInSectionProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function FadeInSection({
  children,
  direction = 'up',
  delay = 0,
  duration = ANIMATION_TIMING.duration,
  className,
  once = true,
  amount = 0.2,
}: FadeInSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
  };

  const variants = {
    hidden: {
      opacity: 0,
      ...directionOffset[direction],
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration,
        delay,
        ease: ANIMATION_EASING.default,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
