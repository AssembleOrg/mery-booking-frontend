'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import classes from './MasterclassFlyer.module.css';

const STORAGE_KEY = 'jornada-cancer-mama-flyer-v1';
const OPEN_DELAY_MS = 800;
const FLYER_ALT =
  'Jornada de concientización sobre el cáncer de mama — 27 de octubre, 8 a 13 hs, Aula Magna del Hospital Materno Infantil de Tigre. Participación especial de Mery García en Epítesis.';

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function MasterclassFlyer() {
  const [opened, setOpened] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');

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
      size="auto"
      padding={0}
      withCloseButton={false}
      fullScreen={isMobile}
      transitionProps={
        shouldReduceMotion
          ? { duration: 0 }
          : { transition: 'fade', duration: 300 }
      }
      classNames={{ content: classes.content, body: classes.body }}
      aria-label="Jornada de concientización sobre el cáncer de mama"
    >
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className={classes.flyerWrapper}>
          {/* El frame mantiene el ratio exacto de la imagen. */}
          <div className={classes.flyerFrame}>
            <Image
              src="/flyermery-jornada.webp"
              alt={FLYER_ALT}
              fill
              priority
              sizes="(max-width: 767px) 100vw, 520px"
              className={classes.flyerImage}
            />
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
              className={classes.closeButton}
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
}
