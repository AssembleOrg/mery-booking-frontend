'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import classes from './ImageCrossfade.module.css';

interface ImageCrossfadeProps {
  images: string[];
  interval?: number;
  transitionDuration?: number;
  className?: string;
  alt?: string;
  showIndicators?: boolean;
  objectPosition?: string;
}

export function ImageCrossfade({
  images,
  interval = 5000,
  transitionDuration = 1.2,
  className = '',
  alt = 'Gallery image',
  showIndicators = false,
  objectPosition = 'center',
}: ImageCrossfadeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Si solo hay una imagen o el usuario prefiere menos movimiento, no animar
    if (images.length <= 1 || shouldReduceMotion) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, shouldReduceMotion]);

  // Si no hay imágenes, no renderizar nada
  if (!images || images.length === 0) return null;

  // Si el usuario prefiere menos movimiento, mostrar solo la primera imagen
  if (shouldReduceMotion) {
    return (
      <div className={`${classes.container} ${className}`}>
        <div className={classes.imageWrapper}>
          <Image
            src={images[0]}
            alt={alt}
            fill
            className={classes.image}
            style={{ objectPosition }}
            priority
          />
        </div>
      </div>
    );
  }

  // Renderizar todas las imágenes apiladas con transición de opacity
  return (
    <div className={`${classes.container} ${className}`}>
      {images.map((src, index) => (
        <motion.div
          key={src}
          className={classes.imageWrapper}
          initial={false}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            zIndex: index === currentIndex ? 1 : 0,
          }}
          transition={{
            opacity: {
              duration: transitionDuration,
              ease: [0.43, 0.13, 0.23, 0.96],
            },
          }}
        >
          <Image
            src={src}
            alt={`${alt} ${index + 1}`}
            fill
            className={classes.image}
            style={{ objectPosition }}
            priority={index < 2}
            loading={index < 2 ? 'eager' : 'lazy'}
          />
        </motion.div>
      ))}

      {/* Indicadores opcionales */}
      {showIndicators && images.length > 1 && (
        <div className={classes.indicators}>
          {images.map((_, i) => (
            <button
              key={i}
              className={`${classes.dot} ${i === currentIndex ? classes.active : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
