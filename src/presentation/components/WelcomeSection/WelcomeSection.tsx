'use client';

import { Box, Container, Flex, Text } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayeredText,
  SectionTitle,
  ServiceCard,
  ImageFrame,
  ImageCrossfade,
  FadeInSection,
  StaggerContainer,
  StaggerItem,
} from '@/presentation/components';
import classes from './WelcomeSection.module.css';

const SERVICES = [
  { num: '01', name: 'Nanoblading', desc: 'Cejas hiperrealistas', image: '/images/nano-scallping.webp', href: '/tattoo-cosmetico' },
  { num: '02', name: 'Lip Blush', desc: 'Labios definidos', image: '/images/Lip-blush-1-1-768x512.webp', href: '/tattoo-cosmetico' },
  { num: '03', name: 'Lash Line', desc: 'Mirada intensa', image: '/images/lashes_line_b.webp', href: '/tattoo-cosmetico' },
  { num: '04', name: 'Pecas & Lunares', desc: 'Efecto natural', image: '/images/web-pecas-1-768x578.webp', href: '/tattoo-cosmetico' },
  { num: '05', name: 'Paramedical', desc: 'Reconstrucción', image: '/images/aereola.webp', href: '/paramedical-tattoo' },
  { num: '06', name: 'Styling', desc: 'Diseño profesional', image: '/images/estilismo-cejas.webp', href: '/estilismo-de-cejas' },
];

const HERO_IMAGES = [
  '/images/camuflaje.webp',
  '/images/nano-scallping.webp',
  '/images/Lip-blush-1-1-768x512.webp',
];

const GALLERY_IMAGES = [
  '/images/nano-scallping.webp',
  '/images/camuflaje.webp',
  '/images/Lip-blush-1-1-768x512.webp',
  '/images/lashes_line_b.webp',
];

export function WelcomeSection() {
  const openInstagram = () => {
    window.open('https://www.instagram.com/merygarciaoficial/', '_blank');
  };

  return (
    <Box className={classes.wrapper}>
      {/* ======== HERO SECTION ======== */}
      <section className={classes.heroSection}>
        {/* Layered background text */}
        <LayeredText
          text={<>MERY<br />GARCÍA</>}
          size={140}
          top="12%"
          left="5%"
          mobileTop="8%"
        />

        {/* Left content */}
        <Box className={classes.heroContent}>
          <FadeInSection direction="up" delay={0.2}>
            <Text className={classes.heroOverline}>
              COSMETIC TATTOO ARTIST · BUENOS AIRES
            </Text>

            <h1 className={classes.heroTitle}>
              I didn't choose the<br />
              <em className={classes.heroTitlePink}>brow life</em>.<br />
              The brow life<br />
              <em className={classes.heroTitleItalic}>chose me</em>.
            </h1>

            <Text className={classes.heroDescription}>
              Más de 20 años creando resultados naturales e imperceptibles.
              Cada trazo cuenta una historia.
            </Text>

            <Flex className={classes.heroButtons}>
              <Link href="/tattoo-cosmetico" className={classes.buttonPrimary}>
                RESERVAR CITA
              </Link>
              <Link href="#servicios" className={classes.buttonSecondary}>
                VER TRABAJOS
              </Link>
            </Flex>
          </FadeInSection>
        </Box>

        {/* Right image - Crossfade Slideshow */}
        <Box className={classes.heroImageWrapper}>
          <Box className={classes.heroImageContainer}>
            <ImageCrossfade
              images={HERO_IMAGES}
              interval={5000}
              transitionDuration={1.2}
              alt="Trabajos de Mery García"
              showIndicators={true}
              objectPosition="center top"
            />
          </Box>

          {/* Decorative number */}
          <FadeInSection direction="right" delay={0.4}>
            <span className={classes.heroNumber}>01</span>
          </FadeInSection>
        </Box>

        {/* Scroll indicator */}
        <Box className={classes.scrollIndicator}>
          <FadeInSection direction="up" delay={0.8}>
            <div className={classes.scrollLine} />
            <span className={classes.scrollText}>SCROLL</span>
          </FadeInSection>
        </Box>
      </section>

      {/* ======== SERVICES SECTION ======== */}
      <section className={classes.servicesSection} id="servicios">
        <LayeredText
          text="SERVICIOS"
          size={160}
          top="5%"
          left="50%"
          mobileTop="-2%"
        />

        <Container size="xl" className={classes.servicesContainer}>
          <FadeInSection direction="up" delay={0.2}>
            <SectionTitle
              overline="NUESTROS SERVICIOS"
              title={<>¿Qué podemos hacer<br /><em>por vos</em>?</>}
            />
          </FadeInSection>

          <StaggerContainer className={classes.servicesGrid} staggerDelay={0.1}>
            {SERVICES.map((service) => (
              <StaggerItem key={service.num}>
                <ServiceCard
                  number={service.num}
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

      {/* ======== ABOUT SECTION ======== */}
      <section className={classes.aboutSection}>
        {/* Background LayeredText */}
        <LayeredText
          text="MERY"
          size={200}
          top="5%"
          left="60%"
          mobileLeft="2%"
          mobileTop="2%"
        />

        {/* Background keywords - distributed across section */}
        <div className={classes.aboutKeywords}>
          <span className={classes.keyword} style={{ top: '15%', left: '3%' }}>cejas</span>
          <span className={classes.keyword} style={{ top: '55%', left: '8%' }}>tenaz</span>
          <span className={classes.keyword} style={{ top: '35%', left: '25%' }}>autodidacta</span>
          <span className={classes.keyword} style={{ top: '70%', left: '55%' }}>meticulosa</span>
          <span className={classes.keyword} style={{ top: '25%', left: '75%' }}>pasión</span>
          <span className={classes.keyword} style={{ top: '85%', left: '85%' }}>arte</span>
        </div>

        <Container size="xl">
          <Flex className={classes.aboutContent}>
            {/* Image - positioned to the right */}
            <FadeInSection direction="left" delay={0.2}>
              <Box className={classes.aboutImageWrapper}>
                <ImageFrame
                  src="/images/camuflaje.webp"
                  alt="Mery García"
                  aspectRatio="3/4"
                  frameOffset={24}
                />
              </Box>
            </FadeInSection>

            {/* Content - description + quote + button */}
            <FadeInSection direction="right" delay={0.4}>
              <Box className={classes.aboutTextWrapper}>
                <Text className={classes.aboutDescription}>
                  Más de 20 años dedicada al arte de la belleza natural.
                </Text>

                <Text className={classes.aboutQuote}>
                  "Los detalles son todo"
                </Text>

                <Link href="#" className={classes.buttonSecondary}>
                  CONOCER MÁS
                </Link>
              </Box>
            </FadeInSection>
          </Flex>
        </Container>
      </section>

      {/* ======== GALLERY SECTION ======== */}
      <section className={classes.gallerySection}>
        <LayeredText
          text="TRABAJOS"
          size={140}
          top="5%"
          left="50%"
          mobileTop="2%"
        />

        <Container size="xl" className={classes.galleryHeader}>
          <FadeInSection direction="up" delay={0.2}>
            <SectionTitle
              overline="NUESTROS RESULTADOS"
              title={<>Trabajos <em>reales</em></>}
            />
          </FadeInSection>
        </Container>

        <FadeInSection direction="up" delay={0.3}>
          <Box className={classes.galleryGrid}>
            {GALLERY_IMAGES.map((src, i) => (
              <Box
                key={i}
                className={classes.galleryItem}
              >
                <Image
                  src={src}
                  alt={`Trabajo ${i + 1}`}
                  fill
                  className={classes.galleryImage}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  loading="lazy"
                />
                {/* Instagram CTA overlay on last image */}
                {i === GALLERY_IMAGES.length - 1 && (
                  <Box className={classes.instagramOverlay} onClick={openInstagram}>
                    <svg
                      className={classes.igIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                    <Text className={classes.igText}>VER MÁS</Text>
                    <Text className={classes.igHandle}>@merygarciaoficial</Text>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </FadeInSection>
      </section>

      {/* ======== CTA SECTION ======== */}
      <section className={classes.ctaSection}>
        {/* Background text */}
        <div className={classes.ctaBackground}>
          RESERVÁ
        </div>

        <FadeInSection direction="up" delay={0.3}>
          <Box className={classes.ctaContent}>
            <Text className={classes.ctaOverline}>
              ¿LISTA PARA TU TRANSFORMACIÓN?
            </Text>

            <h2 className={classes.ctaTitle}>
              Reservá tu cita y<br />
              comenzá tu experiencia <em>MG</em>
            </h2>

            <Link href="/tattoo-cosmetico" className={classes.ctaButton}>
              RESERVAR AHORA
            </Link>
          </Box>
        </FadeInSection>
      </section>
    </Box>
  );
}
