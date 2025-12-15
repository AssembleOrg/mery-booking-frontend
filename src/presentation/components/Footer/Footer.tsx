'use client';

import { Box, Container, Flex, Stack, Text } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandWhatsapp } from '@tabler/icons-react';
import Image from 'next/image';
import classes from './Footer.module.css';

export function Footer() {
  return (
    <Box component="footer" className={classes.footer}>
      {/* Barra de advertencia */}
      <Box className={classes.warningBar}>
        <Container size="xl">
          <Text
            ta="center"
            size="sm"
            fw={400}
            c="gray.8"
            style={{ letterSpacing: '0.05em' }}
          >
            LAS SEÑAS DE LOS SERVICIOS NO SON REEMBOLSABLES
          </Text>
        </Container>
      </Box>

      {/* Contenido principal del footer */}
      <Container size="xl" py={{ base: 60, sm: 80, md: 100 }}>
        <Stack align="center" gap="xl">
          {/* Logo */}
          <Image
            src="/logo_cosetic_tattoo.svg"
            alt="Mery García Cosmetic Tattoo"
            width={250}
            height={85}
            priority
            className={classes.footerLogo}
          />

          {/* Iconos de redes sociales */}
          <Flex gap="lg" align="center">
            <Box
              component="a"
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className={classes.socialIcon}
            >
              <IconBrandFacebook size={28} stroke={1.5} />
            </Box>
            <Box
              component="a"
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={classes.socialIcon}
            >
              <IconBrandInstagram size={28} stroke={1.5} />
            </Box>
            <Box
              component="a"
              href="https://wa.link/oxzkt1"
              target="_blank"
              rel="noopener noreferrer"
              className={classes.socialIcon}
            >
              <IconBrandWhatsapp size={28} stroke={1.5} />
            </Box>
          </Flex>

          {/* Copyright */}
          <Text
            size="sm"
            c="dimmed"
            fw={300}
            style={{ letterSpacing: '0.05em' }}
          >
            © Mery García 2021 – All Rights Reserved - Web by Pistech
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}

