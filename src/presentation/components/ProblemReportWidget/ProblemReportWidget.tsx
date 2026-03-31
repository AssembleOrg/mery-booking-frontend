'use client';

import { useState } from 'react';
import { Affix, Button, Modal, TextInput, Textarea, Stack, Transition } from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
import { useForm, Controller } from 'react-hook-form';
import { IconHeadset } from '@tabler/icons-react';
import { ProblemReportService, CreateProblemReportDto } from '@/infrastructure/http';
import { notifications } from '@mantine/notifications';

export default function ProblemReportWidget() {
  const [opened, { open, close }] = useDisclosure(false);
  const [scroll] = useWindowScroll();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProblemReportDto>({
    defaultValues: {
      email: '',
      phone: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateProblemReportDto) => {
    try {
      setIsLoading(true);
      await ProblemReportService.create(data);
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
      <Affix position={{ bottom: 20, right: 20 }} zIndex={100}>
        <Transition transition="slide-up" mounted={scroll.y > 0 || true}>
          {(transitionStyles) => (
            <Button
              leftSection={<IconHeadset size={20} />}
              style={{
                ...transitionStyles,
                borderRadius: '9999px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '0 20px',
              }}
              color="dark"
              onClick={open}
              size="md"
            >
              ¿Problemas?
            </Button>
          )}
        </Transition>
      </Affix>

      <Modal opened={opened} onClose={close} title="Reportar un problema" centered radius="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Controller
              name="email"
              control={control}
              rules={{ 
                required: 'El correo electrónico es requerido', 
                pattern: { value: /^\S+@\S+$/i, message: 'Correo electrónico inválido' } 
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

            <Controller
              name="phone"
              control={control}
              rules={{ required: 'El teléfono es requerido' }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  label="Teléfono"
                  placeholder="Ej: +54 9 11 1234 5678"
                  error={errors.phone?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              rules={{ 
                required: 'Por favor, detalla el problema', 
                minLength: { value: 10, message: 'La descripción es muy corta' } 
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
