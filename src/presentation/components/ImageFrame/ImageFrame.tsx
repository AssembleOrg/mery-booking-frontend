'use client';

import { Box } from '@mantine/core';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import classes from './ImageFrame.module.css';
import { ANIMATION_TIMING, ANIMATION_EASING } from '@/presentation/lib/animations';

interface ImageFrameProps {
  src?: string;
  alt?: string;
  placeholder?: string;
  aspectRatio?: string;
  frameOffset?: number;
}

export function ImageFrame({
  src,
  alt = 'Image',
  placeholder = '[ IMAGEN ]',
  aspectRatio = '3/4',
  frameOffset = 20
}: ImageFrameProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <Box
        className={classes.wrapper}
        style={{
          aspectRatio,
          '--frame-offset': `${frameOffset}px`
        } as React.CSSProperties}
      >
        <div className={classes.frame} />
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={classes.image}
            sizes="(max-width: 768px) 85vw, (max-width: 1024px) 350px, 45vw"
          />
        ) : (
          <Box className={classes.placeholder}>{placeholder}</Box>
        )}
      </Box>
    );
  }

  return (
    <motion.div
      className={classes.wrapper}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: ANIMATION_TIMING.duration,
        ease: ANIMATION_EASING.default
      }}
      style={{
        aspectRatio,
        '--frame-offset': `${frameOffset}px`
      } as React.CSSProperties}
    >
      {/* Decorative frame with delayed animation */}
      <motion.div
        className={classes.frame}
        initial={{ opacity: 0, x: -10, y: -10 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{
          delay: 0.3,
          duration: 0.6,
          ease: ANIMATION_EASING.gentle
        }}
      />

      {/* Image or placeholder */}
      {src ? (
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: ANIMATION_EASING.smooth }}
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className={classes.image}
            sizes="(max-width: 768px) 85vw, (max-width: 1024px) 350px, 45vw"
          />
        </motion.div>
      ) : (
        <Box className={classes.placeholder}>
          {placeholder}
        </Box>
      )}
    </motion.div>
  );
}
