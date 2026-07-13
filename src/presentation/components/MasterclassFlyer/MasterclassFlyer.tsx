'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import classes from './MasterclassFlyer.module.css';

const STORAGE_KEY = 'masterclass-flyer-v1';
const OPEN_DELAY_MS = 800;
const RESERVA_URL = 'https://merygarcia.com.ar/f/masterclass-autostyling';

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
      aria-label="Master Class de Autostyling"
    >
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        {/* Desktop: flyer horizontal 16:9 */}
        <div className={`${classes.flyerWrapper} ${classes.flyerDesktop} ${classes.showDesktop}`}>
          <Image
            src="/form/flyer-evento.jpg"
            alt="Invitación a la Master Class de Autostyling de Mery García"
            fill
            priority
            sizes="880px"
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
          <a
            href={RESERVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reservá tu clase en la Master Class de Autostyling"
            onClick={handleClose}
            className={`${classes.reservaLink} ${classes.reservaDesktop}`}
          />
        </div>

        {/* Mobile: flyer vertical */}
        <div className={`${classes.flyerWrapper} ${classes.flyerMobile} ${classes.showMobile}`}>
          <Image
            src="/form/flyer-mobile.png"
            alt="Invitación a la Master Class de Autostyling de Mery García"
            fill
            priority
            sizes="100vw"
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
          <a
            href={RESERVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reservá tu clase en la Master Class de Autostyling"
            onClick={handleClose}
            className={`${classes.reservaLink} ${classes.reservaMobile}`}
          />
        </div>
      </motion.div>
    </Modal>
  );
}
