'use client';

import { Box, Container, Stack, Text, Button } from '@mantine/core';
import { Header, Footer } from '@/presentation/components';
import Image from 'next/image';
import classes from './page.module.css';

export default function ParamedicalTattooPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Header />

      <Box className={classes.pageWrapper}>
        {/* Hero Section con imagen de fondo y navegación */}
        <Box className={classes.heroSection}>
          <Image
            src="/images/nano-scallping.webp"
            alt="Paramedical Tattoo"
            fill
            priority
            className={classes.heroImage}
            quality={90}
          />
          <Box className={classes.heroOverlay} />
          <Container size="xl" className={classes.heroContent}>
            <Text className={classes.heroTitle}>
              PARAMEDICAL TATTOO
            </Text>

            {/* Navigation Buttons */}
            <Box className={classes.heroNav}>
              <Button
                variant="subtle"
                color="white"
                className={classes.navButton}
                onClick={() => scrollToSection('nano-scalp')}
              >
                NANO SCALP
              </Button>
              <Button
                variant="subtle"
                color="white"
                className={classes.navButton}
                onClick={() => scrollToSection('areola-harmonization')}
              >
                AREOLA HARMONIZATION
              </Button>
              <Button
                variant="subtle"
                color="white"
                className={classes.navButton}
                onClick={() => scrollToSection('nipple-reconstruction')}
              >
                NIPPLE RECONSTRUCTION
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Content Sections */}
        <Box className={classes.contentWrapper}>
          {/* Nano Scalp Section */}
          <Box id="nano-scalp" className={classes.section}>
            <Container size="lg" py={{ base: 60, sm: 80, md: 100 }}>
              <Box className={classes.sectionContent}>
                {/* Image */}
                <Box className={classes.imageColumn}>
                  <Image
                    src="/images/nano-scallping.webp"
                    alt="Nano Scalp"
                    width={500}
                    height={600}
                    className={classes.sectionImage}
                  />
                </Box>

                {/* Text Content */}
                <Box className={classes.textColumn}>
                  <Text className={classes.sectionTitle}>
                    NANO SCALP
                  </Text>
                  <Stack gap="md">
                    <Text size="md" c="dimmed" fw={300} className={classes.sectionText}>
                      Es un tatuaje cosmético que consiste en implantar pigmento en el cuero cabelludo y piel generando líneas de
                      cabello hiperrealista. Desde la primera sesión notarás un efecto óptico de densidad mayor capilar, de forma
                      natural que irá aumentando progresivamente sesión tras sesión.
                    </Text>
                    <Text size="md" c="dimmed" fw={300} className={classes.sectionText}>
                      Este procedimiento está recomendado para personas con cicatrices post lifting, falta de crecimiento del
                      cabello, remolinos hasta alopecias frontales florazantes.
                    </Text>
                    <Text size="md" c="dimmed" fw={300} className={classes.sectionText}>
                      Es importante aclarar que entre sesión y sesión debe pasar un mes para que la piel cicatrice correctamente.
                    </Text>
                  </Stack>

                  <Button
                    component="a"
                    href="#"
                    size="lg"
                    mt="xl"
                    className={classes.infoButton}
                  >
                    MÁS INFO AQUÍ
                  </Button>

                  {/* Booking Section */}
                  <Box mt="xl" pt="xl" className={classes.bookingSection}>
                    <Text size="sm" c="dimmed" fw={300} mb="md">
                      Seleccioná la opción deseada para solicitar tu cita:
                    </Text>
                    {/* Aquí se agregarán los dropdowns de servicios */}
                  </Box>
                </Box>
              </Box>
            </Container>
          </Box>

          {/* Areola Harmonization Section */}
          <Box id="areola-harmonization" className={classes.section}>
            <Container size="lg" py={{ base: 60, sm: 80, md: 100 }}>
              <Box className={classes.sectionContent}>
                {/* Image */}
                <Box className={classes.imageColumn}>
                  <Image
                    src="/images/aereola.webp"
                    alt="Areola Harmonization"
                    width={500}
                    height={600}
                    className={classes.sectionImage}
                  />
                </Box>

                {/* Text Content */}
                <Box className={classes.textColumn}>
                  <Text className={classes.sectionTitle}>
                    AREOLA HARMONIZATION
                  </Text>
                  <Stack gap="md">
                    <Text size="md" c="dimmed" fw={300} className={classes.sectionText}>
                      La armonización de aréola es un procedimiento de tatuaje cosmético que busca mejorar la apariencia
                      de las aréolas, ya sea corrigiendo asimetrías, restaurando el color después de cirugías o tratamientos
                      médicos, o simplemente mejorando su aspecto estético.
                    </Text>
                    <Text size="md" c="dimmed" fw={300} className={classes.sectionText}>
                      Este tratamiento es ideal para personas que han pasado por mastectomías, reconstrucciones mamarias,
                      o que simplemente desean mejorar la pigmentación natural de sus aréolas.
                    </Text>
                    <Text size="md" c="dimmed" fw={300} className={classes.sectionText}>
                      El procedimiento se realiza con técnicas avanzadas de micropigmentación que garantizan resultados
                      naturales y duraderos.
                    </Text>
                  </Stack>

                  <Button
                    component="a"
                    href="#"
                    size="lg"
                    mt="xl"
                    className={classes.infoButton}
                  >
                    MÁS INFO AQUÍ
                  </Button>

                  {/* Booking Section */}
                  <Box mt="xl" pt="xl" className={classes.bookingSection}>
                    <Text size="sm" c="dimmed" fw={300} mb="md">
                      Seleccioná la opción deseada para solicitar tu cita:
                    </Text>
                    {/* Aquí se agregarán los dropdowns de servicios */}
                  </Box>
                </Box>
              </Box>
            </Container>
          </Box>

          {/* Nipple Reconstruction Section */}
          <Box id="nipple-reconstruction" className={classes.section}>
            <Container size="lg" py={{ base: 60, sm: 80, md: 100 }}>
              <Box className={classes.sectionContent}>
                {/* Image */}
                <Box className={classes.imageColumn}>
                  <Image
                    src="/images/nano-scallping.webp"
                    alt="Nipple Reconstruction"
                    width={500}
                    height={600}
                    className={classes.sectionImage}
                  />
                </Box>

                {/* Text Content */}
                <Box className={classes.textColumn}>
                  <Text className={classes.sectionTitle}>
                    NIPPLE RECONSTRUCTION
                  </Text>
                  <Stack gap="md">
                    <Text size="md" c="dimmed" fw={300} className={classes.sectionText}>
                      La reconstrucción de pezón mediante tatuaje cosmético es el paso final en la reconstrucción mamaria,
                      creando la ilusión tridimensional de un pezón mediante técnicas avanzadas de micropigmentación.
                    </Text>
                    <Text size="md" c="dimmed" fw={300} className={classes.sectionText}>
                      Este procedimiento es especialmente beneficioso para pacientes que han completado su reconstrucción
                      mamaria y desean un resultado más natural y completo sin necesidad de cirugía adicional.
                    </Text>
                    <Text size="md" c="dimmed" fw={300} className={classes.sectionText}>
                      El proceso se realiza con pigmentos específicos que se adaptan al tono de piel de cada paciente,
                      garantizando un resultado personalizado y realista.
                    </Text>
                  </Stack>

                  <Button
                    component="a"
                    href="#"
                    size="lg"
                    mt="xl"
                    className={classes.infoButton}
                  >
                    MÁS INFO AQUÍ
                  </Button>

                  {/* Booking Section */}
                  <Box mt="xl" pt="xl" className={classes.bookingSection}>
                    <Text size="sm" c="dimmed" fw={300} mb="md">
                      Seleccioná la opción deseada para solicitar tu cita:
                    </Text>
                    {/* Aquí se agregarán los dropdowns de servicios */}
                  </Box>
                </Box>
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>

      <Footer />
    </>
  );
}




