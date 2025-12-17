'use client';

import { Box, Text } from '@mantine/core';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
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
  image,
  href = '#'
}: ServiceCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const CardContent = (
    <motion.div
      className={classes.card}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Number watermark */}
      <span className={classes.number}>{number}</span>

      {/* Image or placeholder */}
      <motion.div
        className={classes.imageWrapper}
        whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className={classes.image}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <Box className={classes.placeholder}>
            [ IMG ]
          </Box>
        )}
      </motion.div>

      {/* Gradient overlay */}
      <div className={classes.overlay} />

      {/* Content */}
      <motion.div
        className={classes.content}
        initial={{ y: 10, opacity: 0.9 }}
        whileHover={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Text component="h3" className={classes.name}>
          {name}
        </Text>
        <Text className={classes.description}>
          {description}
        </Text>
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
