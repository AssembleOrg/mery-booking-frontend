'use client';

import { Box, Button, Container, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';
import classes from './WelcomeSection.module.css';

export function WelcomeSection() {
  return (
    <Box className={classes.wrapper}>
      <Container size="xl" py={{ base: 40, sm: 60, md: 80 }}>
        <Stack align="center" gap="xl">
          {/* Illustration */}
          <Box className={classes.illustrationWrapper}>
            <Image
              src="/desk.svg"
              alt="Desk illustration"
              width={280}
              height={240}
              className={classes.illustration}
              priority
            />
          </Box>

          {/* Welcome Text */}
          <Stack align="center" gap="md" maw={700}>
            <Title
              order={1}
              ta="center"
              className={classes.title}
              fw={300}
              style={{ letterSpacing: '0.1em' }}
            >
              BIENEVENID@S A NUESTRO PORTAL DE RESERVAS ONLINE
            </Title>

            <Stack gap="sm" ta="center">
              <Text size="md" fw={300} c="dimmed">
                Si es la primera vez que ingresas te contamos que no es
                necesario que previamente registres una cuenta, la misma se
                generará cuando realices la primera reserva.
              </Text>

              <Text size="md" fw={300} c="dimmed">
                Si ya tenés una cuenta sólo ingresando tu mail al final de la
                reserva la misma quedará vinculada.
              </Text>

              <Text size="md" fw={300} c="dimmed">
                Por favor seleccioná aquí debajo el servicio que te gustaría
                tomar con nosotr@s.
              </Text>
            </Stack>
          </Stack>

          {/* Service Buttons */}
          <Stack w="100%" maw={600} gap="md">
            <Button
              component="a"
              href="/tattoo-cosmetico"
              size="lg"
              radius="md"
              fullWidth
              className={classes.serviceButton}
              variant="filled"
              color="pink.3"
              fw={300}
              style={{ letterSpacing: '0.1em' }}
            >
              COSMETIC TATTOO
            </Button>

            <Button
              component="a"
              href="/estilismo-de-cejas"
              size="lg"
              radius="md"
              fullWidth
              className={classes.serviceButton}
              variant="filled"
              color="pink.2"
              fw={300}
              style={{ letterSpacing: '0.1em' }}
            >
              ESTILISMO DE CEJAS
            </Button>

            <Button
              component="a"
              href="/paramedical-tattoo"
              size="lg"
              radius="md"
              fullWidth
              className={classes.serviceButton}
              variant="filled"
              color="pink.4"
              c="#7f2c37"
              fw={300}
              style={{ letterSpacing: '0.1em' }}
            >
              PARAMEDICAL TATTOO
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

