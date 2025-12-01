'use client';

import { Modal, Stack, Text, Box, Divider } from '@mantine/core';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import Image from 'next/image';
import classes from './MenuModal.module.css';

interface MenuModalProps {
  opened: boolean;
  onClose: () => void;
}

export function MenuModal({ opened, onClose }: MenuModalProps) {
  const menuItems = [
    { label: 'MI CUENTA', href: '/login' },
    { label: 'COSMETIC TATTOO', href: '/cosmetic-tattoo' },
    { label: 'ESTILISMO DE CEJAS', href: '/estilismo-de-cejas' },
    { label: 'PARAMEDICAL TATTOO', href: '/paramedical-tattoo' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0.7,
        blur: 3,
      }}
      radius="xl"
      padding={0}
      className={classes.modal}
    >
      <Box className={classes.modalContent}>
        {/* Logo */}
        <Box className={classes.logoContainer}>
          <Image
            src="/logo_cosetic_tattoo.svg"
            alt="Mery García Cosmetic Tattoo"
            width={180}
            height={60}
            style={{ objectFit: 'contain' }}
          />
        </Box>

        <Divider my="lg" color="pink.2" />

        {/* Menu Items */}
        <Stack gap="xs" className={classes.menuStack}>
          {menuItems.map((item, index) => (
            <Box
              key={index}
              component="a"
              href={item.href}
              className={classes.menuItem}
              onClick={onClose}
            >
              {item.label === 'PARAMEDICAL TATTOO' ? (
                <Text
                  size="lg"
                  fw={300}
                  ta="center"
                  style={{ letterSpacing: '0.1em' }}
                  c="#7f2c37"   
                >
                  {item.label}
                </Text>

              ) : (
                <Text
                  size="lg"
                  fw={300}
                  ta="center"
                  style={{ letterSpacing: '0.1em' }}
                >
                  {item.label}
                </Text>
              )}
            </Box>
          ))}
        </Stack>

        <Divider my="lg" color="pink.2" />

        {/* WhatsApp */}
        <Box
          component="a"
          href="https://wa.link/oxzkt1"
          target="_blank"
          rel="noopener noreferrer"
          className={classes.whatsappButton}
        >
          <IconBrandWhatsapp size={32} stroke={1.5} />
        </Box>

        {/* Close button */}
        <Box className={classes.closeButton} onClick={onClose}>
          <Text size="sm" fw={300} c="dimmed" style={{ letterSpacing: '0.1em' }}>
            CERRAR
          </Text>
        </Box>
      </Box>
    </Modal>
  );
}

