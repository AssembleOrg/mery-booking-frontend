'use client';

import { Box, Container, Flex, Modal, Text } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Masonry from 'react-masonry-css';
import {
  BookingEntryModal,
  SectionTitle,
  ServiceCard,
  FadeInSection,
  StaggerContainer,
  StaggerItem,
  ImageCrossfade,
  PublicRescheduleBooking,
} from '@/presentation/components';
import classes from './WelcomeSection.module.css';

const SERVICES = [
  {
    num: '01',
    name: 'Nanoblading & Brow Camouflage',
    desc: 'Cosmetic Tattoo',
    image: '',
    href: '/tattoo-cosmetico',
  },
  {
    num: '02',
    name: 'Lip Blush & Lip Camouflage',
    desc: 'Cosmetic Tattoo',
    image: '',
    href: '/tattoo-cosmetico',
  },
  {
    num: '03',
    name: 'Lash Line & Lash Camouflage',
    desc: 'Cosmetic Tattoo',
    image: '',
    href: '/tattoo-cosmetico',
  },
  {
    num: '04',
    name: 'Freckles & Beauty Mark',
    desc: 'Cosmetic Tattoo',
    image: '',
    href: '/tattoo-cosmetico',
  },
  {
    num: '05',
    name: 'Paramedical Tattoo',
    desc: 'Cosmetic Tattoo',
    image: '',
    href: '/paramedical-tattoo',
  },
  {
    num: '06',
    name: 'Brow & Lash Styling',
    desc: '\u00A0',
    image: '',
    href: '/estilismo-de-cejas',
  },
  {
    num: '07',
    name: 'Epitesis',
    desc: '\u00A0',
    image: '',
    href: '/epitesis-cap',
  },
];

type GalleryItem =
  | {
      id: string;
      type: 'image';
      src: string;
      alt: string;
      instagramOverlay?: boolean;
    }
  | {
      id: string;
      type: 'video';
      src: string;
      poster: string;
      alt: string;
      aspectRatio?: string;
    }
  | {
      id: string;
      type: 'sensitiveImage';
      blurSrc: string;
      fullSrc: string;
      alt: string;
    };

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 'mery3', type: 'image', src: '/images/mery3.webp', alt: 'Trabajo real' },
  { id: 'mery2', type: 'image', src: '/images/mery2.svg', alt: 'Trabajo real' },
  { id: 'mery4', type: 'image', src: '/images/mery4.webp', alt: 'Trabajo real' },
  {
    id: 'merytrabajo9',
    type: 'image',
    src: '/trabajo/merytrabajo9.webp',
    alt: 'Trabajo real',
  },
  {
    id: 'merytrabajo11',
    type: 'image',
    src: '/trabajo/merytrabajo11.webp',
    alt: 'Trabajo real',
  },
  {
    id: 'video-trabajo',
    type: 'video',
    src: '/trabajo/video-trabajo.mp4',
    poster: '/trabajo/merytrabajo11.webp',
    alt: 'Video de trabajo real',
    aspectRatio: '4 / 5',
  },
  {
    id: 'merytrabajoreal1',
    type: 'image',
    src: '/trabajo/merytrabajoreal1.webp',
    alt: 'Trabajo real',
  },
  {
    id: 'merytrabajoreal2',
    type: 'image',
    src: '/trabajo/merytrabajoreal2.webp',
    alt: 'Trabajo real',
  },
  {
    id: 'merytrabajoreal3',
    type: 'image',
    src: '/trabajo/merytrabajoreal3.webp',
    alt: 'Trabajo real',
  },
  {
    id: 'merytrabajoreal5',
    type: 'image',
    src: '/trabajo/merytrabajoreal5.webp',
    alt: 'Trabajo real',
  },
  {
    id: 'merytrabajoreal6',
    type: 'image',
    src: '/trabajo/merytrabajoreal6.webp',
    alt: 'Trabajo real',
  },
  {
    id: 'merytrabajoreal7',
    type: 'image',
    src: '/trabajo/merytrabajoreal7.webp',
    alt: 'Trabajo real',
  },
  {
    id: 'merytrabajoreal8',
    type: 'image',
    src: '/trabajo/merytrabajoreal8.webp',
    alt: 'Trabajo real',
  },
  {
    id: 'paramedical-preview',
    type: 'sensitiveImage',
    blurSrc: '/trabajo/pezon-conblur.webp',
    fullSrc: '/trabajo/pezon-sinblur.webp',
    alt: 'Resultado paramedical (areola)',
  },
  {
    id: 'merytrabajoreal10',
    type: 'image',
    src: '/trabajo/merytrabajoreal10.webp',
    alt: 'Trabajo real',
    instagramOverlay: true,
  },
];

function GalleryVideoTile({
  src,
  poster,
  alt,
  aspectRatio,
  onReady,
}: {
  src: string;
  poster: string;
  alt: string;
  aspectRatio?: string;
  onReady: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const shouldLoadRef = useRef(false);

  const attemptPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return;
    }
    v.muted = true;
    const p = v.play();
    if (p && typeof (p as Promise<void>).catch === 'function') {
      (p as Promise<void>).catch(() => {});
    }
  };

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setShouldLoad(true);
          shouldLoadRef.current = true;
        } else {
          const v = videoRef.current;
          if (v) v.pause();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const v = videoRef.current;
    if (!v) return;
    v.load();
    requestAnimationFrame(() => attemptPlay());
  }, [shouldLoad]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!shouldLoadRef.current) return;
      attemptPlay();
    };
    const onFocus = () => {
      if (!shouldLoadRef.current) return;
      attemptPlay();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <div
      ref={wrapperRef}
      className={classes.videoFrame}
      style={{ aspectRatio: aspectRatio ?? '4 / 5' }}
    >
      <video
        ref={videoRef}
        className={classes.galleryVideo}
        autoPlay
        muted
        playsInline
        loop
        preload="none"
        poster={poster}
        aria-label={alt}
        onCanPlay={attemptPlay}
        onLoadedData={attemptPlay}
      >
        {shouldLoad && <source src={src} type="video/mp4" />}
      </video>
    </div>
  );
}

export function WelcomeSection() {
  const [loadedById, setLoadedById] = useState<Record<string, true>>({});
  const [sensitiveModal, setSensitiveModal] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [bookingEntryOpened, { open: openBookingEntry, close: closeBookingEntry }] =
    useDisclosure(false);
  const isMobileOrTablet = useMediaQuery('(max-width: 1023px)', false, {
    getInitialValueInEffect: true,
  });

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

  const markLoaded = (id: string) => {
    setLoadedById((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  const breakpointColumnsObj = {
    default: 4,
    1024: 3,
    768: 2,
  };

  return (
    <Box className={classes.wrapper}>
      <BookingEntryModal opened={bookingEntryOpened} onClose={closeBookingEntry} />
      <Modal
        opened={!!sensitiveModal}
        onClose={() => setSensitiveModal(null)}
        centered
        size="lg"
        keepMounted={false}
        withCloseButton
        title="Resultado paramedical"
      >
        {sensitiveModal && (
          <Image
            src={sensitiveModal.src}
            alt={sensitiveModal.alt}
            width={900}
            height={900}
            className={classes.sensitiveModalImage}
            sizes="(max-width: 768px) 90vw, 900px"
          />
        )}
      </Modal>
      <Box className={classes.heroContainer}>
        <section className={classes.heroSection}>
          <Box className={classes.heroImageWrapper}>
            <ImageCrossfade
              images={[
                '/loop/loop4.webp',
                '/loop/loop1.webp',
                '/loop/loop2.webp',
                '/images/image-soft-blur.jpg',
              ]}
              interval={5000}
              transitionDuration={1.2}
              showIndicators={true}
              alt="Mery Garcia Cosmetic Tattoo"
              objectPosition={isMobileOrTablet ? 'center 20%' : 'center center'}
              sizes="(max-width: 1023px) 100vw, 55vw"
            />
            <div className={classes.heroOverlay} />
          </Box>
        </section>

        <section className={classes.heroTextSection}>
          <Box className={classes.heroContent}>
            <FadeInSection direction="up" delay={0.2}>
              <h1 className={classes.heroTitle}>
                Art & Real <span className={classes.heroTitlePink}>Beauty</span>
              </h1>
              <Flex className={classes.heroButtons}>
                <button
                  type="button"
                  className={classes.heroButtonPrimary}
                  onClick={openBookingEntry}
                >
                  RESERVAR CITA
                </button>
                <Link
                  href="#trabajos-reales"
                  className={`${classes.heroButtonPrimary} ${classes.heroButtonNarrow}`}
                >
                  NUESTROS TRABAJOS
                </Link>
              </Flex>
            </FadeInSection>
          </Box>
        </section>
      </Box>

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

      <section className={classes.philosophySection}>
        <Container size="xl" className={classes.philosophyContainer}>
          <FadeInSection direction="up" delay={0.1}>
            <div className={classes.quoteWrapper}>
              <div className={classes.quoteConnector} />
              <Text
                className={`${classes.quoteBottom} ${classes.quoteBottomSpaced}`}
              >
                MÁS DE 20 AÑOS CREANDO RESULTADOS NATURALES E HIPERREALISTAS.
              </Text>
              <div className={classes.quoteHighlightWrapper}>
                <span className={classes.quoteHighlight}>
                  CADA TRAZO CUENTA <wbr />
                  <span className={classes.quoteNoBreak}>UNA HISTORIA</span>
                </span>
              </div>
            </div>
          </FadeInSection>

          {/* <div className={classes.philosophyGrid}>
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
          </div> */}
        </Container>
      </section>

      <section className={classes.gallerySection} id="trabajos-reales">
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
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className={classes.masonryGrid}
            columnClassName={classes.masonryColumn}
          >
            {GALLERY_ITEMS.map((item) => {
              const isLoaded = item.type === 'video' ? true : !!loadedById[item.id];

              return (
                <Box
                  key={item.id}
                  className={classes.galleryItem}
                  style={{
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {item.type === 'image' && (
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={600}
                      height={600}
                      className={classes.galleryImage}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                      onLoad={() => markLoaded(item.id)}
                    />
                  )}

                  {item.type === 'video' && (
                    <GalleryVideoTile
                      src={item.src}
                      poster={item.poster}
                      alt={item.alt}
                      aspectRatio={item.aspectRatio}
                      onReady={() => markLoaded(item.id)}
                    />
                  )}

                  {item.type === 'sensitiveImage' && (
                    <>
                      <Image
                        src={item.blurSrc}
                        alt={item.alt}
                        width={600}
                        height={600}
                        className={classes.galleryImage}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        loading="lazy"
                        onLoad={() => markLoaded(item.id)}
                      />
                      <button
                        type="button"
                        className={classes.sensitiveOverlay}
                        onClick={() =>
                          setSensitiveModal({ src: item.fullSrc, alt: item.alt })
                        }
                      >
                        <span className={classes.sensitiveOverlayTitle}>
                          Ver resultado
                        </span>
                        <span className={classes.sensitiveOverlaySubtitle}>
                          Contenido sensible
                        </span>
                      </button>
                    </>
                  )}

                  {item.type === 'image' && item.instagramOverlay && (
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
              );
            })}
          </Masonry>
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
