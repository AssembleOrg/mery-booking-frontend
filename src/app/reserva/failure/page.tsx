'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Container, Title, Text, Stack, Button, Paper, ThemeIcon, Loader } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import Link from 'next/link';

function FailureContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const collectionId = searchParams.get('collection_id');


  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} radius="xl" color="dark" variant="light">
            <IconX size={48} />
          </ThemeIcon>

          <Title order={1} ta="center">
            Pago Rechazado
          </Title>

          <Text size="lg" ta="center" c="dimmed">
            No se pudo procesar tu pago. Por favor, intenta nuevamente.
          </Text>

          <Paper p="md" bg="red.0" radius="md" w="100%">
            <Stack gap="xs">
              <Text size="sm" fw={500} c="red">
                ¿Qué puedes hacer?
              </Text>
              <Text size="sm" c="dimmed">
                • Verifica que los datos de tu tarjeta sean correctos
              </Text>
              <Text size="sm" c="dimmed">
                • Asegúrate de tener fondos suficientes
              </Text>
              <Text size="sm" c="dimmed">
                • Intenta con otro medio de pago
              </Text>
              <Text size="sm" c="dimmed">
                • Contacta a tu banco si el problema persiste
              </Text>
            </Stack>
          </Paper>

          <Button
            component={Link}
            href="/"
            size="md"
            fullWidth
          >
            Volver a intentar
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function ReservaFailurePage() {
  return (
    <Suspense fallback={
      <Container size="sm" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <Loader size="lg" />
            <Text>Cargando...</Text>
          </Stack>
        </Paper>
      </Container>
    }>
      <FailureContent />
    </Suspense>
  );
}
