'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export function HoverScale({
  children,
  scale = 1.02,
  duration = 0.3,
  className,
}: HoverScaleProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
