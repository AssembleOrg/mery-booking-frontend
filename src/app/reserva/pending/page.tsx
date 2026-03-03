'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Paper,
  ThemeIcon,
  Loader,
} from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import Link from 'next/link';

function PendingContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');


  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} radius="xl" color="pink" variant="light">
            <IconClock size={48} />
          </ThemeIcon>

          <Title order={1} ta="center">
            Pago Pendiente
          </Title>

          <Text size="lg" ta="center" c="dimmed">
            Tu pago está siendo procesado.
          </Text>

          <Paper p="md" bg="yellow.0" radius="md" w="100%">
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                ¿Qué significa esto?
              </Text>
              <Text size="sm" c="dimmed">
                Tu pago puede tardar hasta 48 horas en ser confirmado
                dependiendo del medio de pago seleccionado.
              </Text>
              <Text size="sm" c="dimmed" mt="sm">
                Te notificaremos por email cuando el pago sea confirmado y tu
                reserva esté lista.
              </Text>
            </Stack>
          </Paper>

          {(paymentId || collectionId) && (
            <Paper p="md" bg="gray.0" radius="md" w="100%">
              <Text size="sm" c="dimmed">
                ID de pago: {paymentId || collectionId}
              </Text>
            </Paper>
          )}

          <Button component={Link} href="/" variant="light" size="md" fullWidth>
            Volver al inicio
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function ReservaPendingPage() {
  return (
    <Suspense
      fallback={
        <Container size="sm" py="xl">
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <Stack align="center" gap="lg">
              <Loader size="lg" />
              <Text>Cargando...</Text>
            </Stack>
          </Paper>
        </Container>
      }
    >
      <PendingContent />
    </Suspense>
  );
}
