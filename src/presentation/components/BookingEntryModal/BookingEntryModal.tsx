'use client';

import { Box, Drawer, Modal, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import classes from './BookingEntryModal.module.css';

interface BookingEntryModalProps {
  opened: boolean;
  onClose: () => void;
}

const BOOKING_OPTIONS = [
  {
    title: 'Tattoo Cosmético',
    description: 'Cejas, labios, pecas y más',
    href: '/tattoo-cosmetico',
  },
  {
    title: 'Estilismo de Cejas & Pestañas',
    description: 'Laminado, perfilado y tratamientos',
    href: '/estilismo-de-cejas',
  },
  {
    title: 'Paramedical Tattoo',
    description: 'Camuflajes y procedimientos reconstructivos',
    href: '/paramedical-tattoo',
  },
] as const;

function BookingEntryContent({ onClose }: { onClose: () => void }) {
  return (
    <Box className={classes.container}>
      <Text className={classes.subtitle}>Elegí una categoría</Text>

      <Stack gap={10} className={classes.options}>
        {BOOKING_OPTIONS.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className={classes.optionCard}
            onClick={onClose}
          >
            <span className={classes.optionTitle}>{option.title}</span>
            <span className={classes.optionDescription}>{option.description}</span>
          </Link>
        ))}
      </Stack>
    </Box>
  );
}

export function BookingEntryModal({ opened, onClose }: BookingEntryModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)', false, {
    getInitialValueInEffect: true,
  });

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="78dvh"
        title="Reservá tu cita"
        classNames={{
          header: classes.header,
          title: classes.headerTitle,
          body: classes.body,
        }}
        styles={{
          content: { borderRadius: '18px 18px 0 0', maxHeight: '100dvh' },
          overlay: { background: 'rgba(43, 43, 43, 0.5)' },
        }}
      >
        <BookingEntryContent onClose={onClose} />
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="sm"
      title="Reservá tu cita"
      classNames={{
        header: classes.header,
        title: classes.headerTitle,
        body: classes.body,
      }}
      styles={{
        overlay: { background: 'rgba(43, 43, 43, 0.5)' },
      }}
    >
      <BookingEntryContent onClose={onClose} />
    </Modal>
  );
}
