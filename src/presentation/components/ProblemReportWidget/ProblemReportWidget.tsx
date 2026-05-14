'use client';

import { useEffect, useRef, useState } from 'react';
import { Affix, Button, Flex, Modal, Select, Text, TextInput, Textarea, Stack } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useForm, Controller } from 'react-hook-form';
import { IconHeadset } from '@tabler/icons-react';
import { ProblemReportService } from '@/infrastructure/http';
import { notifications } from '@mantine/notifications';
import { AnimatePresence, motion } from 'framer-motion';

const countryCodes = [
  { value: '+54', label: '🇦🇷 +54' },
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+34', label: '🇪🇸 +34' },
  { value: '+52', label: '🇲🇽 +52' },
  { value: '+55', label: '🇧🇷 +55' },
  { value: '+56', label: '🇨🇱 +56' },
  { value: '+57', label: '🇨🇴 +57' },
  { value: '+598', label: '🇺🇾 +598' },
];

interface FormData {
  email: string;
  countryCode: string;
  phone: string;
  description: string;
}

export default function ProblemReportWidget() {
  const [opened, { open, close }] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmall = useMediaQuery('(max-width: 480px)');

  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      countryCode: '+54',
      phone: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const phone = data.phone ? `${data.countryCode}${data.phone}` : undefined;
      await ProblemReportService.create({
        email: data.email,
        phone,
        description: data.description,
      });
      notifications.show({
        title: 'Reporte enviado',
        message: 'Hemos recibido su reporte de problema de manera exitosa. Nos contactaremos a la brevedad.',
        color: 'green',
      });
      close();
      reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Ocurrió un problema al enviar el reporte. Por favor, intente nuevamente.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Affix position={{ left: 0, bottom: isSmall ? 60 : isMobile ? 80 : 120 }} zIndex={100}>
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            alignItems: 'stretch',
          }}
        >
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: isSmall ? 180 : isMobile ? 220 : 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                style={{
                  background: '#fff',
                  boxShadow: '2px 4px 12px rgba(0,0,0,0.15)',
                  borderRadius: '0 8px 8px 0',
                  overflow: 'hidden',
                }}
              >
                <Stack
                  p={isSmall ? 'sm' : 'md'}
                  gap="sm"
                  style={{ minWidth: isSmall ? 180 : isMobile ? 220 : 260 }}
                >
                  <Text size={isSmall ? 'xs' : 'sm'} c="dark" fw={500}>
                    ¿Tuviste algún problema? Contanos
                  </Text>
                  <Button
                    color="dark"
                    radius="md"
                    size={isSmall ? 'xs' : 'sm'}
                    onClick={() => {
                      open();
                      setExpanded(false);
                    }}
                  >
                    Reportar problema
                  </Button>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.4 }}
            aria-label="Abrir reporte de problemas"
            aria-expanded={expanded}
            style={{
              fontFamily: 'var(--font-din-medium), sans-serif',
              background: '#1c1c1c',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              borderRadius: '0 8px 8px 0',
              boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isSmall ? 10 : isMobile ? 11 : 13,
              fontWeight: 500,
              letterSpacing: '0.08em',
              alignSelf: 'stretch',
              width: isSmall ? 24 : isMobile ? 26 : 32,
              minHeight: isSmall ? 85 : isMobile ? 95 : 115,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                transform: 'rotate(-90deg)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <IconHeadset size={isSmall ? 12 : isMobile ? 14 : 16} />
              AYUDA
            </span>
          </motion.button>
        </div>
      </Affix>

      <Modal opened={opened} onClose={close} title="Reportar un problema" centered radius="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'El correo electrónico es requerido',
                pattern: { value: /^\S+@\S+$/i, message: 'Correo electrónico inválido' },
              }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="Correo electrónico"
                  placeholder="ejemplo@email.com"
                  error={errors.email?.message}
                />
              )}
            />

            <div>
              <Text size="sm" fw={500} mb={4}>
                Teléfono (opcional)
              </Text>
              <Flex gap="xs">
                <Controller
                  name="countryCode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      data={countryCodes}
                      style={{ width: '110px' }}
                      allowDeselect={false}
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      placeholder="(11) 1234 5678"
                      error={errors.phone?.message}
                      style={{ flex: 1 }}
                    />
                  )}
                />
              </Flex>
            </div>

            <Controller
              name="description"
              control={control}
              rules={{
                required: 'Por favor, detalla el problema',
                minLength: { value: 10, message: 'La descripción es muy corta' },
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Descripción del problema"
                  placeholder="Encontré un error al intentar reservar..."
                  minRows={4}
                  autosize
                  maxRows={8}
                  error={errors.description?.message}
                />
              )}
            />

            <Button type="submit" loading={isLoading} color="dark" fullWidth mt="sm" radius="md">
              Enviar reporte
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
