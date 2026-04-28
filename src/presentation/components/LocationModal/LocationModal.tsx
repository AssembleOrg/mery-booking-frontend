'use client';

import { Modal, Text, Button, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconExternalLink } from '@tabler/icons-react';

interface LocationModalProps {
  opened: boolean;
  onClose: () => void;
}

const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3286.149434754441!2d-58.471836124522745!3d-34.549811472904475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb574e3b83fff%3A0x4f4e2ba2b75cb16c!2sAv.%20Meli%C3%A1n%203646%2C%20C1430%20CABA!5e0!3m2!1ses-419!2sar!4v1714300000000!5m2!1ses-419!2sar';

const MAPS_LINK =
  'https://maps.google.com/?q=Av.+Meli%C3%A1n+3646+PB+1,+CABA,+Argentina';

export default function LocationModal({ opened, onClose }: LocationModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Nuestra ubicación"
      size={isMobile ? '100%' : 'lg'}
      centered
      radius={0}
      styles={{
        header: {
          background: 'var(--mg-pink-light)',
          paddingBottom: 16,
        },
        title: {
          color: 'var(--mg-dark)',
          fontFamily: 'var(--font-din-medium), sans-serif',
          fontSize: 16,
          letterSpacing: '1px',
          fontWeight: 500,
        },
        body: {
          padding: 0,
        },
        close: {
          color: 'var(--mg-gray)',
        },
      }}
    >
      <iframe
        src={MAPS_EMBED_URL}
        width="100%"
        height={isMobile ? 260 : 340}
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación Mery García"
      />

      <Stack gap={4} p="md" style={{ background: 'var(--mg-pink-light)' }}>
        <Text
          style={{
            fontSize: 14,
            color: 'var(--mg-gray)',
            fontFamily: 'var(--font-din-light), sans-serif',
          }}
        >
          Av. Melián 3646 PB 1, CABA, Argentina
        </Text>

        <Button
          component="a"
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
          mt={8}
          radius={0}
          rightSection={<IconExternalLink size={16} />}
          styles={{
            root: {
              background: 'var(--mg-pink)',
              fontFamily: 'var(--font-din-medium), sans-serif',
              letterSpacing: '1px',
              fontSize: 13,
              height: 44,
              '&:hover': {
                background: 'var(--mg-pink-hover)',
              },
            },
          }}
        >
          ABRIR EN GOOGLE MAPS
        </Button>
      </Stack>
    </Modal>
  );
}
