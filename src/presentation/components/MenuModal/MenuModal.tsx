'use client';

import { Drawer, Box, Text } from '@mantine/core';
import { IconBrandWhatsapp, IconX } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import classes from './MenuModal.module.css';

interface MenuModalProps {
  opened: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'MI CUENTA', href: '/login' },
  { label: 'COSMETIC TATTOO', href: '/tattoo-cosmetico' },
  { label: 'ESTILISMO DE CEJAS', href: '/estilismo-de-cejas' },
  { label: 'PARAMEDICAL TATTOO', href: '/paramedical-tattoo' },
];

export function MenuModal({ opened, onClose }: MenuModalProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="100%"
      withCloseButton={false}
      styles={{
        body: { padding: 0 },
        content: { background: 'var(--mg-pink-light)' },
        inner: { background: 'transparent' },
        overlay: { background: 'rgba(43, 43, 43, 0.5)' }
      }}
    >
      <Box className={classes.menuContainer}>
        {/* Close Button */}
        <button className={classes.closeButton} onClick={onClose}>
          <IconX size={28} stroke={1.5} />
        </button>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={classes.logoContainer}
        >
          <Image
            src="/logo_cosetic_tattoo.svg"
            alt="Mery García Cosmetic Tattoo"
            width={280}
            height={58}
            className={classes.logo}
          />
        </motion.div>

        {/* Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={classes.decorativeLine}
        />

        {/* Menu Items */}
        <nav className={classes.menuNav}>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 * (index + 1) }}
            >
              <Link
                href={item.href}
                className={classes.menuItem}
                onClick={onClose}
              >
                <span className={classes.menuNumber}>0{index + 1}</span>
                <span className={classes.menuLabel}>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* WhatsApp */}
        <motion.a
          href="https://wa.link/oxzkt1"
          target="_blank"
          rel="noopener noreferrer"
          className={classes.whatsappButton}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <IconBrandWhatsapp size={24} stroke={1.5} />
          <span>WHATSAPP</span>
        </motion.a>

        {/* Decorative Number */}
        <span className={classes.decorativeNumber}>MG</span>
      </Box>
    </Drawer>
  );
}
