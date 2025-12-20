'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // -1 to 1, negative = opposite direction
  className?: string;
}

export function ParallaxSection({
  children,
  speed = 0.3,
  className,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${speed * -100}px`, `${speed * 100}px`]
  );

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
