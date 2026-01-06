'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ANIMATION_EASING } from '@/presentation/lib/animations';

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();

  // Rutas que necesitan sticky nav sin animación
  const noAnimationRoutes: string[] = []; // Array vacío - todas las rutas tienen animación
  const shouldAnimate = !noAnimationRoutes.includes(pathname);

  // Deshabilitar animación para rutas problemáticas
  if (prefersReducedMotion || !shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: ANIMATION_EASING.gentle,
        }
      }}
    >
      {children}
    </motion.div>
  );
}
