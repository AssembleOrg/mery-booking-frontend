'use client';

import { Box, Burger, Container, Flex, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MenuModal } from '@/presentation/components';
import classes from './Header.module.css';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { label: 'COSMETIC TATTOO', href: '/tattoo-cosmetico' },
  { label: 'ESTILISMO', href: '/estilismo-de-cejas' },
  { label: 'PARAMEDICAL', href: '/paramedical-tattoo' },
];

export function Header() {
  const [opened, { open, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Box
        component="header"
        className={`${classes.header} ${scrolled ? classes.scrolled : ''}`}
      >
        <Container size="xl" className={classes.container}>
          <Flex justify="space-between" align="center" className={classes.flex}>
            {/* Logo / Brand Name */}
            <Link href="/" className={classes.brand}>
              <Image
                src="/logo-original.webp"
                alt="Mery García Cosmetic Tattoo"
                width={0}
                height={0}
                sizes="100vw"
                className={classes.logo}
                priority
              />
            </Link>

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
            <Link href="/tattoo-cosmetico" className={classes.ctaButton}>
              RESERVAR
            </Link>

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
