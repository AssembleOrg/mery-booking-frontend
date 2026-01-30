'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Paper,
  Group,
  ThemeIcon,
  Loader,
} from '@mantine/core';
import { IconCheck, IconCalendar } from '@tabler/icons-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');
  const preferenceId = searchParams.get('preference_id');

  useEffect(() => {
    console.log(
      '[Success Page] Pago exitoso. Payment ID:',
      paymentId || collectionId
    );
  }, [paymentId, collectionId]);

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} radius="xl" color="green" variant="light">
            <IconCheck size={48} />
          </ThemeIcon>

          <Title order={1} ta="center">
            ¡Pago Exitoso!
          </Title>

          <Text size="lg" ta="center" c="dimmed">
            Tu reserva ha sido confirmada exitosamente.
          </Text>

          <Paper p="md" bg="gray.0" radius="md" w="100%">
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Detalles de la transacción
              </Text>
              {(paymentId || collectionId) && (
                <Text size="sm" c="dimmed">
                  ID de pago: {paymentId || collectionId}
                </Text>
              )}
              {preferenceId && (
                <Text size="sm" c="dimmed">
                  ID de preferencia: {preferenceId}
                </Text>
              )}
            </Stack>
          </Paper>

          <Stack gap="xs" w="100%">
            <Group gap="xs">
              <IconCalendar size={20} />
              <Text size="sm" fw={500}>
                ¿Qué sigue?
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              • Recibirás un email de confirmación en breve
            </Text>
            <Text size="sm" c="dimmed">
              • Puedes revisar los detalles de tu reserva en el correo
            </Text>
            <Text size="sm" c="dimmed">
              • Te esperamos en la fecha programada
            </Text>
          </Stack>

          <Group gap="md" w="100%" grow>
            <Button component={Link} href="/" variant="light" size="md">
              Volver al inicio
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function ReservaSuccessPage() {
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
      <SuccessContent />
    </Suspense>
  );
}
