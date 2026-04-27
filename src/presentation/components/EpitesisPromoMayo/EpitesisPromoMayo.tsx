'use client';

import { useEffect, useState } from 'react';
import { Modal, Box, Text } from '@mantine/core';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import classes from './EpitesisPromoMayo.module.css';

const STORAGE_KEY = 'epitesis-promo-v2';
const OPEN_DELAY_MS = 800;

export default function EpitesisPromoMayo() {
  const [opened, setOpened] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setOpened(true);
      }
    }, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setOpened(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="sm"
      withCloseButton={false}
      transitionProps={
        shouldReduceMotion
          ? { duration: 0 }
          : { transition: 'fade', duration: 300 }
      }
      classNames={{ content: classes.content, body: classes.body }}
    >
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <Box className={classes.inner}>
          <Image
            src="/logo-original.webp"
            alt="Mery García Cosmetic Tattoo"
            width={120}
            height={25}
            className={classes.logo}
          />
          <Text className={classes.exclusive}>EXCLUSIVE</Text>
          <Text className={classes.badge}>MAYO 2026</Text>
          <Text className={classes.title}>50% OFF</Text>
          <Text className={classes.subtitle}>
            en el encargo de piezas de Epítesis
          </Text>
          <Text className={classes.note}>
            El descuento aplica únicamente al valor de producción de las piezas.
            No incluye la consulta previa obligatoria.
          </Text>
          <Box className={classes.actions}>
            <Link href="/epitesis-cap" onClick={handleClose} className={classes.btnPrimary}>
              VER MÁS
            </Link>
            <button onClick={handleClose} className={classes.btnGhost}>
              CERRAR
            </button>
          </Box>
        </Box>
      </motion.div>
    </Modal>
  );
}
