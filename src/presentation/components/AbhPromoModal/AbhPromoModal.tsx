'use client';

import { useEffect, useState } from 'react';
import { Modal, Box, Text } from '@mantine/core';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import {
  IconX,
  IconCopy,
  IconCheck,
  IconArrowUpRight,
  IconCalendar,
} from '@tabler/icons-react';
import classes from './AbhPromoModal.module.css';

const STORAGE_KEY = 'abh-promo-2026';
const OPEN_DELAY_MS = 800;

const CODE = 'ABHXMERYGARCIA';
const SHOP_URL = 'https://www.juleriaque.com.ar/s?q=anastasia';

// Panel superior. Para usar el arte real de la campaña, reemplazar por el
// archivo definitivo y cambiar object-fit a cover en el CSS module.
const IMAGE_SRC = '/anastasia-logo-wide.png';

export default function AbhPromoModal() {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles el código igual queda visible en pantalla.
    }
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
        className={classes.wrapper}
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          className={classes.close}
        >
          <IconX size={16} />
        </button>

        <Box className={classes.brand}>
          <Image
            src={IMAGE_SRC}
            alt="Anastasia Beverly Hills"
            width={1024}
            height={200}
            priority
            className={classes.logo}
          />
          <Text className={classes.lockup}>× MERY GARCÍA</Text>
        </Box>

        <Box className={classes.inner}>
          <Text component="h2" className={classes.title}>
            10% OFF en toda la línea
          </Text>

          <Text className={classes.subtitle}>
            En todos los productos Anastasia Beverly Hills de la tienda online
            de Juleriaque.
          </Text>

          <Text component="span" className={classes.validity}>
            <IconCalendar size={14} />
            Hasta el 1 de septiembre
          </Text>

          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copiar el código ${CODE}`}
            className={classes.code}
          >
            <span className={classes.codeValue}>{CODE}</span>
            <span className={classes.codeAction}>
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              {copied ? 'Copiado' : 'Copiar'}
            </span>
          </button>

          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className={classes.btnPrimary}
          >
            Ver productos
            <IconArrowUpRight size={16} className={classes.arrow} />
          </a>

          <button
            type="button"
            onClick={handleClose}
            className={classes.btnGhost}
          >
            Ahora no
          </button>
        </Box>
      </motion.div>
    </Modal>
  );
}
