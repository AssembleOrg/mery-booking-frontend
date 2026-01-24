'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import classes from './ServiceCard.module.css';

interface ServiceCardProps {
  number: string;
  name: string;
  description: string;
  image?: string;
  href?: string;
}

export function ServiceCard({
  number,
  name,
  description,
  href = '#',
}: ServiceCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const CardContent = (
    <motion.div
      className={classes.card}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Overlay sutil */}
      <div className={classes.overlay} />

      {/* Contenido alineado a la izquierda */}
      <motion.div
        className={classes.content}
        initial={{ opacity: 0, y: 5 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        viewport={{ once: true }}
      >
        <div className={classes.textWrapper}>
          <h3 className={classes.name}>{name}</h3>
          {description && <p className={classes.description}>{description}</p>}
        </div>
      </motion.div>
    </motion.div>
  );

  if (href && href !== '#') {
    return (
      <Link href={href} className={classes.link}>
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
