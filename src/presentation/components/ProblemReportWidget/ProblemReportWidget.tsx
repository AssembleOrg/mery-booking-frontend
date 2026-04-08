'use client';

import { useState } from 'react';
import { Affix, Button, Flex, Modal, Select, Text, TextInput, Textarea, Stack } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useForm, Controller } from 'react-hook-form';
import { IconHeadset } from '@tabler/icons-react';
import { ProblemReportService } from '@/infrastructure/http';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';

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
  const isMobile = useMediaQuery('(max-width: 768px)');

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
      <Affix position={{ bottom: isMobile ? 16 : 20, right: isMobile ? 16 : 20 }} zIndex={100}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.6 }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          style={{ display: 'inline-block' }}
        >
          <Button
            leftSection={<IconHeadset size={isMobile ? 14 : 20} />}
            style={{
              borderRadius: '9999px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: isMobile ? '0 10px' : '0 20px',
              minWidth: isMobile ? 0 : undefined,
              fontSize: isMobile ? '11px' : undefined,
            }}
            color="dark"
            onClick={open}
            size={isMobile ? 'xs' : 'md'}
          >
            {isMobile ? '¿Ayuda?' : '¿Problemas?'}
          </Button>
        </motion.div>
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
