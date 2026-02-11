'use client';

import { Box, Burger, Container, Flex, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { BookingEntryModal, MenuModal } from '@/presentation/components';
import classes from './Header.module.css';
import { useEffect, useRef, useState } from 'react';

const NAV_ITEMS = [
  { label: 'COSMETIC TATTOO', href: '/tattoo-cosmetico' },
  { label: 'ESTILISMO', href: '/estilismo-de-cejas' },
  { label: 'PARAMEDICAL', href: '/paramedical-tattoo' },
];

export function Header() {
  const [opened, { open, close }] = useDisclosure(false);
  const [bookingEntryOpened, { open: openBookingEntry, close: closeBookingEntry }] =
    useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const updateScrolled = () => {
      const servicesSection = document.getElementById('servicios');

      if (!servicesSection) {
        setScrolled(window.scrollY > 50);
        return;
      }

      const headerHeight =
        headerRef.current?.getBoundingClientRect().height ?? 90;
      const servicesTop = servicesSection.getBoundingClientRect().top;
      setScrolled(servicesTop <= headerHeight);
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    window.addEventListener('resize', updateScrolled);
    return () => {
      window.removeEventListener('scroll', updateScrolled);
      window.removeEventListener('resize', updateScrolled);
    };
  }, [pathname]);

  return (
    <>
      <BookingEntryModal opened={bookingEntryOpened} onClose={closeBookingEntry} />
      <Box
        component="header"
        ref={headerRef}
        className={`${classes.header} ${scrolled ? classes.scrolled : ''}`}
      >
        <Container size="xl" className={classes.container}>
          <Flex justify="space-between" align="center" className={classes.flex} suppressHydrationWarning>
            {/* Logo / Brand Name */}
            <div
              className={classes.brand}
              onClick={() => router.push('/')}
              onDoubleClick={() => router.push('/login')}
              style={{ cursor: 'pointer' }}
            >
              <Image
                src="/logo-original.webp"
                alt="Mery García Cosmetic Tattoo"
                width={0}
                height={0}
                sizes="100vw"
                className={classes.logo}
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <nav className={classes.nav}>
              {NAV_ITEMS.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Link href={item.href} className={classes.navLink}>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* CTA Button - Desktop */}
            <button
              type="button"
              className={classes.ctaButton}
              onClick={openBookingEntry}
            >
              RESERVAR
            </button>

            {/* Mobile Menu Button */}
            <Flex
              align="center"
              gap="xs"
              onClick={open}
              className={classes.menuButton}
            >
              <Burger
                opened={opened}
                size="sm"
                color={scrolled ? 'var(--mg-pink)' : '#ffffff'}
                styles={{
                  root: { outline: 'none', border: 'none' },
                }}
              />
              <Text className={classes.menuText}>MENÚ</Text>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <MenuModal opened={opened} onClose={close} />
    </>
  );
}
