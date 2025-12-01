'use client';

import { Box, Burger, Container, Flex, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Image from 'next/image';
import { MenuModal } from '@/presentation/components';
import classes from './Header.module.css';

export function Header() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Box component="header" className={classes.header}>
        <Container size="xl">
          <Flex justify="space-between" align="center" h={{ base: 90, sm: 100 }}>
            <Image
              src="/logo_cosetic_tattoo.svg"
              alt="Mery García Cosmetic Tattoo"
              width={200}
              height={70}
              priority
              className={classes.logo}
            />

            <Flex
              align="center"
              gap="xs"
              onClick={open}
              className={classes.menuButton}
            >
              <Burger
                opened={opened}
                size="sm"
                color="var(--mantine-color-pink-3)"
              />
              <Text
                size="sm"
                fw={300}
                style={{ letterSpacing: '0.1em', color: '#d0d1d3' }}
              >
                MENÚ
              </Text>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <MenuModal opened={opened} onClose={close} />
    </>
  );
}
