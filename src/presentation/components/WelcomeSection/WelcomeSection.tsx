'use client';

import { Box, Container, Text, Title } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import classes from './WelcomeSection.module.css';

export function WelcomeSection() {
  return (
    <Box className={classes.wrapper}>
      {/* Hero Section - Layout Asimétrico */}
      <Box className={classes.heroSection}>
        <Container size="xl" className={classes.heroContainer}>
          <Box className={classes.heroContent}>
            {/* Left Column - Text */}
            <Box className={classes.heroTextColumn}>
              <Text className={classes.heroLabel}>PORTAL DE RESERVAS</Text>
              <Title order={1} className={classes.heroTitle}>
                BIENVENID@S
              </Title>
              <Text className={classes.heroSubtitle}>
                Reservá tu cita online de forma simple y rápida
              </Text>
            </Box>

            {/* Right Column - Illustration */}
            <Box className={classes.heroImageColumn}>
              <Box className={classes.illustrationWrapper}>
                <Image
                  src="/desk.svg"
                  alt="Desk illustration"
                  fill
                  className={classes.illustration}
                  priority
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Horizontal Scrolling Cards Section */}
      <Box className={classes.cardsSection}>
        <Container size="xl">
          <Text className={classes.cardsTitle}>NUESTROS SERVICIOS</Text>
          <Box className={classes.cardsScrollContainer}>
            <Box className={classes.cardsRow}>
              <Link href="/tattoo-cosmetico" className={classes.serviceCard}>
                <Box className={classes.cardImageWrapper}>
                  <Image
                    src="/images/im.2-op-2-scaled-1.webp"
                    alt="Cosmetic Tattoo"
                    fill
                    className={classes.cardImage}
                  />
                </Box>
                <Box className={classes.cardContent}>
                  <Text className={classes.cardTitle}>COSMETIC TATTOO</Text>
                  <Text className={classes.cardSubtitle}>
                    Nanoblading, Lip Blush, Lashes Line
                  </Text>
                </Box>
              </Link>

              <Link href="/estilismo-de-cejas" className={classes.serviceCard}>
                <Box className={classes.cardImageWrapper}>
                  <Image
                    src="/images/estilismo-cejas.webp"
                    alt="Estilismo de Cejas"
                    fill
                    className={classes.cardImage}
                  />
                </Box>
                <Box className={classes.cardContent}>
                  <Text className={classes.cardTitle}>ESTILISMO DE CEJAS</Text>
                  <Text className={classes.cardSubtitle}>
                    Asesoramiento y servicios de cejas
                  </Text>
                </Box>
              </Link>

              <Link href="/paramedical-tattoo" className={classes.serviceCard}>
                <Box className={classes.cardImageWrapper}>
                  <Image
                    src="/images/nano-scallping.webp"
                    alt="Paramedical Tattoo"
                    fill
                    className={classes.cardImage}
                  />
                </Box>
                <Box className={classes.cardContent}>
                  <Text className={classes.cardTitle}>PARAMEDICAL TATTOO</Text>
                  <Text className={classes.cardSubtitle}>
                    Nano Scalp, Areola, Nipple
                  </Text>
                </Box>
              </Link>

              <Link href="/tattoo-cosmetico#lip-blush" className={classes.serviceCard}>
                <Box className={classes.cardImageWrapper}>
                  <Image
                    src="/images/Lip-blush-1-1-768x512.webp"
                    alt="Lip Blush"
                    fill
                    className={classes.cardImage}
                  />
                </Box>
                <Box className={classes.cardContent}>
                  <Text className={classes.cardTitle}>LIP BLUSH</Text>
                  <Text className={classes.cardSubtitle}>
                    Maquillaje semi permanente
                  </Text>
                </Box>
              </Link>

              <Link href="/tattoo-cosmetico#lashes-line" className={classes.serviceCard}>
                <Box className={classes.cardImageWrapper}>
                  <Image
                    src="/images/lashes_line_b.webp"
                    alt="Lashes Line"
                    fill
                    className={classes.cardImage}
                  />
                </Box>
                <Box className={classes.cardContent}>
                  <Text className={classes.cardTitle}>LASHES LINE</Text>
                  <Text className={classes.cardSubtitle}>
                    Efecto natural y volumen
                  </Text>
                </Box>
              </Link>

              <Link href="/paramedical-tattoo#areola-harmonization" className={classes.serviceCard}>
                <Box className={classes.cardImageWrapper}>
                  <Image
                    src="/images/aereola.webp"
                    alt="Areola"
                    fill
                    className={classes.cardImage}
                  />
                </Box>
                <Box className={classes.cardContent}>
                  <Text className={classes.cardTitle}>AREOLA</Text>
                  <Text className={classes.cardSubtitle}>
                    Armonización y reconstrucción
                  </Text>
                </Box>
              </Link>

              <Link href="/tattoo-cosmetico#pecas-lunares" className={classes.serviceCard}>
                <Box className={classes.cardImageWrapper}>
                  <Image
                    src="/images/web-pecas-1-768x578.webp"
                    alt="Pecas y Lunares"
                    fill
                    className={classes.cardImage}
                  />
                </Box>
                <Box className={classes.cardContent}>
                  <Text className={classes.cardTitle}>PECAS Y LUNARES</Text>
                  <Text className={classes.cardSubtitle}>
                    Técnica hiperrealista
                  </Text>
                </Box>
              </Link>

              <Link href="/tattoo-cosmetico#camuflaje" className={classes.serviceCard}>
                <Box className={classes.cardImageWrapper}>
                  <Image
                    src="/images/camuflaje.webp"
                    alt="Camuflaje"
                    fill
                    className={classes.cardImage}
                  />
                </Box>
                <Box className={classes.cardContent}>
                  <Text className={classes.cardTitle}>CAMUFLAJE</Text>
                  <Text className={classes.cardSubtitle}>
                    Corrección de trabajos previos
                  </Text>
                </Box>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Info Section */}
      <Box className={classes.infoSection}>
        <Container size="xl">
          <Box className={classes.infoContent}>
            <Text className={classes.infoText}>
              Si es la primera vez que ingresas te contamos que no es
              necesario que previamente registres una cuenta, la misma se
              generará cuando realices la primera reserva.
            </Text>
            <Text className={classes.infoText}>
              Si ya tenés una cuenta sólo ingresando tu mail al final de la
              reserva la misma quedará vinculada.
            </Text>
          </Box>
        </Container>
      </Box>

      {/* Services Grid - Cards Grandes */}
      <Box className={classes.servicesSection}>
        <Container size="xl">
          <Text className={classes.servicesTitle}>SELECCIONÁ TU SERVICIO</Text>
          
          <Box className={classes.servicesGrid}>
            {/* Service Card 1 */}
            <Link href="/tattoo-cosmetico" className={classes.serviceCard}>
              <Box className={classes.serviceCardContent}>
                <Text className={classes.serviceCardNumber}>01</Text>
                <Text className={classes.serviceCardTitle}>COSMETIC TATTOO</Text>
                <Text className={classes.serviceCardSubtitle}>
                  Nanoblading, Lip Blush, Lashes Line
                </Text>
                <Box className={classes.serviceCardArrow}>→</Box>
              </Box>
            </Link>

            {/* Service Card 2 */}
            <Link href="/estilismo-de-cejas" className={classes.serviceCard}>
              <Box className={classes.serviceCardContent}>
                <Text className={classes.serviceCardNumber}>02</Text>
                <Text className={classes.serviceCardTitle}>ESTILISMO DE CEJAS</Text>
                <Text className={classes.serviceCardSubtitle}>
                  Asesoramiento y servicios de cejas
                </Text>
                <Box className={classes.serviceCardArrow}>→</Box>
              </Box>
            </Link>

            {/* Service Card 3 */}
            <Link href="/paramedical-tattoo" className={classes.serviceCard}>
              <Box className={classes.serviceCardContent}>
                <Text className={classes.serviceCardNumber}>03</Text>
                <Text className={classes.serviceCardTitle}>PARAMEDICAL TATTOO</Text>
                <Text className={classes.serviceCardSubtitle}>
                  Nano Scalp, Areola, Nipple Reconstruction
                </Text>
                <Box className={classes.serviceCardArrow}>→</Box>
              </Box>
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

