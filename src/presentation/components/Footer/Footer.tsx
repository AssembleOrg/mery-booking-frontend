'use client';

import { Box, Container, Flex, Stack, Text } from '@mantine/core';
import {
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconMail,
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ANIMATION_TIMING,
  ANIMATION_EASING,
} from '@/presentation/lib/animations';
import classes from './Footer.module.css';

const SERVICES = [
  { label: 'Nanoblading', href: '/tattoo-cosmetico' },
  { label: 'Lip Blush', href: '/tattoo-cosmetico' },
  { label: 'Lash Line', href: '/tattoo-cosmetico' },
  { label: 'Pecas & Lunares', href: '/tattoo-cosmetico' },
];

const INFO_LINKS = [
  { label: 'Precios', href: 'https://merygarcia.com.ar/asesoramiento-express' },
  { label: 'Cuidados', href: '/tattoo-cosmetico' },
  {
    label: 'Políticas',
    href: 'https://merygarcia.com.ar/politica-de-cancelaciones',
  },
  { label: 'Gift Card', href: 'https://merygarcia.com.ar/gift-card' },
];

const SOCIAL_LINKS = [
  {
    icon: IconBrandWhatsapp,
    href: 'https://wa.link/oxzkt1',
    label: 'WhatsApp',
  },
  {
    icon: IconBrandInstagram,
    href: 'https://www.instagram.com/merygarciaoficial/',
    label: 'Instagram',
  },
  { icon: IconMail, href: 'mailto:info@merygarcia.com.ar', label: 'Email' },
];

export function Footer() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: ANIMATION_TIMING.duration,
        ease: ANIMATION_EASING.default,
      },
    },
  };

  if (prefersReducedMotion) {
    return (
      <Box component="footer" className={classes.footer}>
        {/* Warning Bar */}
        <Box className={classes.warningBar}>
          <Container size="xl">
            <Text className={classes.warningText}>
              LAS SEÑAS DE LOS SERVICIOS NO SON REEMBOLSABLES
            </Text>
          </Container>
        </Box>

        {/* Main Footer Content */}
        <Box className={classes.mainFooter}>
          <Container size="xl">
            <Flex className={classes.footerContent}>
              <Box className={classes.brandSection}>
                <Image
                  src="/logo-cosmetic-artist.svg"
                  alt="Mery García Cosmetic Tattoo"
                  width={450}
                  height={94}
                  className={classes.brandLogo}
                />
                <Text className={classes.address}>
                  Av. Melián 3646 PB 1<br />
                  CABA, Argentina
                  <br />
                  Martes a Sábado, 10 a 18hs
                </Text>
              </Box>

              <Flex className={classes.linksSection}>
                <Box className={classes.linkColumn}>
                  <Text className={classes.columnTitle}>SERVICIOS</Text>
                  <Stack gap={0}>
                    {SERVICES.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={classes.link}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </Stack>
                </Box>

                <Box className={classes.linkColumn}>
                  <Text className={classes.columnTitle}>INFO</Text>
                  <Stack gap={0}>
                    {INFO_LINKS.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={classes.link}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </Stack>
                </Box>

                <Box className={classes.linkColumn}>
                  <Text className={classes.columnTitle}>CONTACTO</Text>
                  <Stack gap={0}>
                    {SOCIAL_LINKS.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes.link}
                      >
                        {item.label}
                      </a>
                    ))}
                  </Stack>
                </Box>
              </Flex>
            </Flex>

            <Text className={classes.copyright}>
              © Mery García 2024 – All Rights Reserved
            </Text>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="footer" className={classes.footer}>
      {/* Warning Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: ANIMATION_EASING.default }}
      >
        <Box className={classes.warningBar}>
          <Container size="xl">
            <Text className={classes.warningText}>
              LAS SEÑAS DE LOS SERVICIOS NO SON REEMBOLSABLES
            </Text>
          </Container>
        </Box>
      </motion.div>

      {/* Main Footer Content */}
      <Box className={classes.mainFooter}>
        <Container size="xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Flex className={classes.footerContent}>
              {/* Left - Brand Info */}
              <motion.div variants={itemVariants}>
                <Box className={classes.brandSection}>
                  <Image
                    src="/logo-cosmetic-artist.svg"
                    alt="Mery García Cosmetic Tattoo"
                    width={450}
                    height={94}
                    className={classes.brandLogo}
                  />
                  <Text className={classes.address}>
                    Av. Melián 3646 PB 1<br />
                    CABA, Argentina
                    <br />
                    Martes a Sábado, 10 a 18hs
                  </Text>
                </Box>
              </motion.div>

              {/* Right - Links */}
              <Flex className={classes.linksSection}>
                {/* Services */}
                <motion.div variants={itemVariants}>
                  <Box className={classes.linkColumn}>
                    <Text className={classes.columnTitle}>SERVICIOS</Text>
                    <Stack gap={0}>
                      {SERVICES.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={classes.link}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </Stack>
                  </Box>
                </motion.div>

                {/* Info */}
                <motion.div variants={itemVariants}>
                  <Box className={classes.linkColumn}>
                    <Text className={classes.columnTitle}>INFO</Text>
                    <Stack gap={0}>
                      {INFO_LINKS.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={classes.link}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </Stack>
                  </Box>
                </motion.div>

                {/* Contact */}
                <motion.div variants={itemVariants}>
                  <Box className={classes.linkColumn}>
                    <Text className={classes.columnTitle}>CONTACTO</Text>
                    <Stack gap={0}>
                      {SOCIAL_LINKS.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={classes.link}
                        >
                          {item.label}
                        </a>
                      ))}
                    </Stack>
                  </Box>
                </motion.div>
              </Flex>
            </Flex>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Text className={classes.copyright}>
              © Mery García 2024 – All Rights Reserved
            </Text>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
