'use client';

import { Box, Container, Flex, Text } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  SectionTitle,
  ServiceCard,
  FadeInSection,
  StaggerContainer,
  StaggerItem,
} from '@/presentation/components';
import classes from './WelcomeSection.module.css';

const SERVICES = [
  {
    num: '01',
    name: 'Nanoblading',
    desc: 'Cejas hiperrealistas',
    image: '/images/nano-scallping.webp',
    href: '/tattoo-cosmetico',
  },
  {
    num: '02',
    name: 'Lip Blush',
    desc: 'Labios definidos',
    image: '/images/Lip-blush-1-1-768x512.webp',
    href: '/tattoo-cosmetico',
  },
  {
    num: '03',
    name: 'Lash Line',
    desc: 'Mirada intensa',
    image: '/images/lashes_line_b.webp',
    href: '/tattoo-cosmetico',
  },
  {
    num: '04',
    name: 'Pecas & Lunares',
    desc: 'Efecto natural',
    image: '/images/web-pecas-1-768x578.webp',
    href: '/tattoo-cosmetico',
  },
  {
    num: '05',
    name: 'Paramedical',
    desc: 'Reconstrucción',
    image: '/images/aereola.webp',
    href: '/paramedical-tattoo',
  },
  {
    num: '06',
    name: 'Styling',
    desc: 'Diseño profesional',
    image: '/images/estilismo-cejas.webp',
    href: '/estilismo-de-cejas',
  },
];

const GALLERY_IMAGES = [
  '/images/mery1.svg',
  '/images/mery2.svg',
  '/images/mery3.webp',
  '/images/mery4.webp',
];

const PHILOSOPHY_IMAGES = [
  {
    id: 1,
    src: '/images/2.webp',
    text: 'EMPOWERED',
    alt: 'Detalle y textura natural',
  },
  {
    id: 2,
    src: '/images/3.webp',
    text: 'BY',
    alt: 'Mirada y expresión',
  },
  {
    id: 3,
    src: '/images/4.webp',
    text: 'BEAUTY',
    alt: 'Resultados cicatrizados',
  },
];

export function WelcomeSection() {
  // Smooth Scroll Fix
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const openInstagram = () => {
    window.open('https://www.instagram.com/merygarciaoficial/', '_blank');
  };

  return (
    <Box className={classes.wrapper}>
      <section className={classes.heroSection}>
        <Box className={classes.heroImageWrapper}>
          <Image
            src="/images/emy-header.svg"
            alt="Mery Garcia Cosmetic Tattoo"
            fill
            priority
            className={classes.staticHeroImage}
            sizes="100vw"
          />
          <div className={classes.heroOverlay} />
        </Box>

        <Box className={classes.heroContent}>
          <FadeInSection direction="up" delay={0.2}>
            <h1 className={classes.heroTitle}>
              I didn't choose the
              <br />
              <span className={classes.heroTitlePink}>brow life</span>.<br />
              <span className={classes.heroTitleItalic}>
                The brow life{' '}
                <span style={{ color: 'var(--mg-pink)' }}>chose me</span>.
              </span>
            </h1>
            <Text className={classes.heroDescription}>
              Más de 20 años creando resultados naturales e imperceptibles. Cada
              trazo cuenta una historia.
            </Text>
            <Flex className={classes.heroButtons}>
              <Link
                href="/tattoo-cosmetico"
                className={classes.heroButtonPrimary}
              >
                RESERVAR CITA
              </Link>
              <Link href="#servicios" className={classes.heroButtonSecondary}>
                VER TRABAJOS
              </Link>
            </Flex>
          </FadeInSection>
        </Box>
      </section>

      <section className={classes.servicesSection} id="servicios">
        <Container className={classes.servicesContainer}>
          <FadeInSection direction="up" delay={0.2}>
            <SectionTitle
              overline="NUESTROS SERVICIOS"
              title={
                <>
                  ¿Qué podemos hacer
                  <br />
                  <em style={{ color: 'var(--mg-pink)' }}>por vos</em>?
                </>
              }
            />
          </FadeInSection>

          <StaggerContainer className={classes.servicesGrid} staggerDelay={0.1}>
            {SERVICES.map((service) => (
              <StaggerItem key={service.num}>
                <ServiceCard
                  number=""
                  name={service.name}
                  description={service.desc}
                  image={service.image}
                  href={service.href}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      <section className={classes.philosophySection}>
        <Container size="xl" className={classes.philosophyContainer}>
          <FadeInSection direction="up" delay={0.1}>
            <div className={classes.quoteWrapper}>
              <Text className={classes.quoteTop}>BEHIND EVERY</Text>
              <div className={classes.quoteHighlightWrapper}>
                <span className={classes.quoteHighlight}>STRONG BROW</span>
                <span className={classes.quoteText}> IS</span>
              </div>
              <Text className={classes.quoteBottom}>
                AN EVEN STRONGER <em className={classes.quoteItalic}>WOMAN.</em>
              </Text>
              <div className={classes.quoteConnector} />
            </div>
          </FadeInSection>

          <div className={classes.philosophyGrid}>
            {PHILOSOPHY_IMAGES.map((item, index) => (
              <FadeInSection key={item.id} direction="up" delay={0.1}>
                <div
                  className={`${classes.philosophyCard} ${
                    index === 1 ? classes.cardStaggered : ''
                  }`}
                >
                  <div className={classes.philosophyImageWrapper}>
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className={classes.philosophyImage}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className={classes.philosophyOverlay}>
                      <span className={classes.philosophyText}>
                        {item.text}
                      </span>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </Container>
      </section>

      <section className={classes.gallerySection}>
        <div className={classes.galleryHeader}>
          <FadeInSection direction="up" delay={0.2}>
            <SectionTitle
              overline="NUESTROS RESULTADOS"
              title={
                <>
                  Trabajos <em>reales</em>
                </>
              }
            />
          </FadeInSection>
        </div>
        <FadeInSection direction="up" delay={0.3}>
          <Box className={classes.galleryGrid}>
            {GALLERY_IMAGES.map((src, i) => (
              <Box key={i} className={classes.galleryItem}>
                <Image
                  src={src}
                  alt={`Trabajo ${i + 1}`}
                  fill
                  className={classes.galleryImage}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {i === GALLERY_IMAGES.length - 1 && (
                  <Box
                    className={classes.instagramOverlay}
                    onClick={openInstagram}
                  >
                    <svg
                      className={classes.igIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle
                        cx="18"
                        cy="6"
                        r="1.5"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                    <Text className={classes.igText}>@MERYGARCIAOFICIAL</Text>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </FadeInSection>
      </section>

      {/* <section className={classes.ctaSection}>
        <div className={classes.ctaBackground}>RESERVÁ</div>
        <FadeInSection direction="up" delay={0.3}>
          <Box className={classes.ctaContent}>
            <h2 className={classes.ctaTitle}>
              Reservá tu cita y<br />
              comenzá tu experiencia <em>MG</em>
            </h2>
            <Link href="/tattoo-cosmetico" className={classes.ctaButton}>
              RESERVAR AHORA
            </Link>
          </Box>
        </FadeInSection>
      </section> */}
    </Box>
  );
}
