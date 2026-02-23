'use client';

import {
  Box,
  Button,
  Flex,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Image,
} from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { Professional, Service, Client } from '@/domain/entities';
import classes from './BookingConfirmationModal.module.css';

interface BookingConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  service: Service;
  professional: Professional | null;
  date: Date;
  time: string;
  location: string;
  onConfirm: (client: Client) => void;
}

interface FormData {
  name: string;
  surname: string;
  email: string;
  countryCode: string;
  mobile: string;
  dni: string;
  notes: string;
}

const countryCodes = [
  { value: '+54', label: '🇦🇷 +54', flag: '🇦🇷' },
  { value: '+1', label: '🇺🇸 +1', flag: '🇺🇸' },
  { value: '+34', label: '🇪🇸 +34', flag: '🇪🇸' },
  { value: '+52', label: '🇲🇽 +52', flag: '🇲🇽' },
];

export function BookingConfirmationModal({
  opened,
  onClose,
  service,
  professional,
  date,
  time,
  location,
  onConfirm,
}: BookingConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      countryCode: '+54',
      mobile: '',
      dni: '',
      notes: '',
    },
  });

  const handleClose = () => {
    reset(); // Limpiar formulario al cancelar
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    const client: Client = {
      name: data.name,
      surname: data.surname,
      email: data.email,
      mobile: `${data.countryCode}${data.mobile}`,
      dni: data.dni,
      notes: data.notes || undefined,
    };

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);

    onConfirm(client);
    reset(); // Limpiar formulario después de confirmar
  };

  const deposit = service.priceBook;

  const formatDate = (date: Date) => {
    // Usar los componentes de la fecha directamente para evitar problemas de timezone
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // Crear una nueva fecha usando los componentes locales
    const localDate = new Date(year, month, day);

    return localDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      centered
      classNames={{
        content: classes.modalContent,
        header: classes.modalHeader,
        body: classes.modalBody,
      }}
      withCloseButton={false}
      trapFocus={false}
      closeOnEscape={false}
      closeOnClickOutside={false}
    >
      <Stack gap="xl">
        {/* Service Header */}
        <Box className={classes.serviceHeader}>
          <Image
            src={service.image || '/desk.svg'}
            alt={service.name}
            width={80}
            height={80}
            className={classes.serviceImage}
          />
          <Text size="xl" fw={400} ta="center" mt="md">
            {service.name}
          </Text>
        </Box>

        {/* Booking Details */}
        <Box className={classes.bookingDetails}>
          <Flex justify="space-between" wrap="wrap" gap="md">
            <Box>
              <Text size="xs" c="dimmed" fw={400}>
                Profesional:
              </Text>
              <Flex align="center" gap="xs" mt={4}>
                <Box className={classes.professionalBadge} />
                <Text size="sm" fw={400}>
                  {professional?.name || 'Cualquier profesional'}
                </Text>
              </Flex>
            </Box>

            <Box>
              <Text size="xs" c="dimmed" fw={400}>
                Fecha:
              </Text>
              <Text size="sm" fw={400} mt={4}>
                {formatDate(date)}
              </Text>
            </Box>

            <Box>
              <Text size="xs" c="dimmed" fw={400}>
                Hora Local:
              </Text>
              <Text size="sm" fw={400} mt={4}>
                {time} hs
              </Text>
            </Box>

            <Box>
              <Text size="xs" c="dimmed" fw={400}>
                Ubicación:
              </Text>
              <Text size="sm" fw={400} mt={4}>
                {location}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Client Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            {/* Name and Surname */}
            <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'El nombre es requerido' }}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    tabIndex={1}
                    data-autofocus
                    label="* Nombre:"
                    placeholder="María"
                    error={errors.name?.message}
                    classNames={{
                      input: classes.input,
                      label: classes.label,
                    }}
                    style={{ flex: 1 }}
                  />
                )}
              />

              <Controller
                name="surname"
                control={control}
                rules={{ required: 'El apellido es requerido' }}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    tabIndex={2}
                    label="* Apellido:"
                    placeholder="García"
                    error={errors.surname?.message}
                    classNames={{
                      input: classes.input,
                      label: classes.label,
                    }}
                    style={{ flex: 1 }}
                  />
                )}
              />
            </Flex>

            {/* Email and Phone */}
            <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'El correo electrónico es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido',
                  },
                }}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    tabIndex={3}
                    label="* Correo electrónico:"
                    placeholder="consultas@merygarcia.com"
                    error={errors.email?.message}
                    classNames={{
                      input: classes.input,
                      label: classes.label,
                    }}
                    style={{ flex: 1 }}
                  />
                )}
              />

              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={400} mb="xs" className={classes.label}>
                  * Teléfono:
                </Text>
                <Flex gap="xs">
                  <Controller
                    name="countryCode"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        tabIndex={4}
                        data={countryCodes}
                        classNames={{
                          input: classes.input,
                        }}
                        style={{ width: '110px' }}
                      />
                    )}
                  />
                  <Controller
                    name="mobile"
                    control={control}
                    rules={{ required: 'El teléfono es requerido' }}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        tabIndex={5}
                        placeholder="(11) 1234 567"
                        error={errors.mobile?.message}
                        classNames={{
                          input: classes.input,
                        }}
                        style={{ flex: 1 }}
                      />
                    )}
                  />
                </Flex>
              </Box>
            </Flex>

            {/* DNI */}
            <Controller
              name="dni"
              control={control}
              rules={{ required: 'El DNI es requerido' }}
              render={({ field }) => (
                <TextInput
                  {...field}
                  tabIndex={6}
                  label="* DNI:"
                  placeholder="12345678"
                  error={errors.dni?.message}
                  classNames={{
                    input: classes.input,
                    label: classes.label,
                  }}
                />
              )}
            />

            {/* Notas */}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  tabIndex={7}
                  label="Notas (opcional):"
                  placeholder="Escribe aquí cualquier comentario o información adicional..."
                  minRows={3}
                  maxRows={5}
                  classNames={{
                    input: classes.input,
                    label: classes.label,
                  }}
                />
              )}
            />

            {/* Pricing Summary */}
            <Box className={classes.pricingSummary}>
              <Flex justify="space-between" mb="xs">
                <Text size="sm" fw={400}>
                  Seña:
                </Text>
                <Text size="sm" fw={600}>
                  AR${deposit.toLocaleString('es-AR')}
                </Text>
              </Flex>

              <Flex justify="space-between" mb="xs">
                <Text size="sm" fw={400}>
                  Depósito{' '}
                  <Text component="span" fs="italic" c="dimmed">
                    Pagar ahora
                  </Text>
                </Text>
                <Text size="sm" fw={600} c="pink.5">
                  AR${deposit.toLocaleString('es-AR')}
                </Text>
              </Flex>
            </Box>

            {/* Action Buttons */}
            <Flex gap="md" mt="md">
              <Button
                variant="outline"
                color="gray"
                fullWidth
                size="lg"
                onClick={handleClose}
                disabled={isSubmitting}
                className={classes.cancelButton}
                tabIndex={8}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isSubmitting}
                className={classes.confirmButton}
                tabIndex={9}
              >
                Confirmar
              </Button>
            </Flex>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
}
