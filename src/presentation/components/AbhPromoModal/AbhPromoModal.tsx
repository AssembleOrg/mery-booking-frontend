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
  IconBrandInstagram,
} from '@tabler/icons-react';
import classes from './AbhPromoModal.module.css';

const STORAGE_KEY = 'abh-promo-2026-v2';
const OPEN_DELAY_MS = 800;

const CODE = 'ABHXMERYGARCIA';
const SHOP_URL = 'https://www.juleriaque.com.ar/s?q=anastasia';
const IG_URL =
  'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDc4MzI0Mzc3NjgxOTY3?story_media_id=3948588968534108469';

const IMAGE_SRC = '/form/anastasia.jpg';
const LOGO_SRC = '/form/mery_garcia_brow_artist_rosa_transparente.png';

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
      overlayProps={{ backgroundOpacity: 0.6, blur: 3 }}
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

        {/* Sin overlay: la foto va limpia. Por eso el logo (blanco/rosa) baja
            al panel oscuro, que es donde tiene contraste. */}
        <div className={classes.photoFrame}>
          <Image
            src={IMAGE_SRC}
            alt="Productos Anastasia Beverly Hills"
            fill
            priority
            sizes="(max-width: 480px) 320px, 420px"
            className={classes.photo}
          />
        </div>

        <Box className={classes.inner}>
          <Image
            src={LOGO_SRC}
            alt="Mery García Brow Artist"
            width={260}
            height={60}
            className={classes.logo}
          />

          <Text component="span" className={classes.eyebrow}>
            <span className={classes.eyebrowBrand}>Anastasia</span>
            <span className={classes.eyebrowCross}>×</span>
            <span className={classes.eyebrowMery}>Mery García</span>
          </Text>

          <Text component="h2" className={classes.title}>
            <span className={classes.titleAccent}>10% OFF</span> en toda la
            línea
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

          {/*
            Abre en pestaña nueva y deja el modal abierto a propósito: si el
            visitante no copió el código antes de irse, al volver lo sigue
            teniendo a mano. Además lo copiamos al pasar a la tienda.
          */}
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCopy}
            className={classes.btnPrimary}
          >
            Ver productos
            <IconArrowUpRight size={16} />
          </a>

          <span className={classes.divider} />

          {/* También deja el modal abierto: el código sigue a mano al volver. */}
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.igCta}
          >
            <span className={classes.igIcon}>
              <IconBrandInstagram size={16} />
            </span>
            <span className={classes.igText}>
              Conocé los productos <strong>FAV</strong> de nuestra{' '}
              <strong className={classes.igAccent}>BrowBoss</strong> y cómo
              combinarlos
            </span>
            <IconArrowUpRight size={16} className={classes.igArrow} />
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
