'use client';

import { Box, Button, Select, Stack, Text } from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import classes from './ServiceBookingForm.module.css';

export interface ServiceBookingFormData {
  servicio: string;
  profesional: string;
}

interface ServiceBookingFormProps {
  onSubmit: (data: ServiceBookingFormData) => void;
}

const servicios = [
  { value: 'service-001', label: 'Lash Refill' },
  { value: 'service-002', label: 'Modelado de cejas' },
  { value: 'service-003', label: 'Brow Refill' },
  { value: 'service-004', label: 'Laminado de cejas' },
  { value: 'service-005', label: 'Tinte de cejas' },
  { value: 'service-006', label: 'Combo Lash & Brow' },
  { value: 'service-007', label: 'Asesoramiento de Estilismo de Cejas' },
  { value: 'service-008', label: 'Microblading / Tattoo Cosmético - Consulta' },
  { value: 'service-009', label: 'Microblading / Tattoo Cosmético - Sesión' },
  { value: 'service-010', label: 'Paramedical Tattoo - Consulta' },
];

const profesionales = [
  { value: '', label: 'Cualquier profesional' },
  { value: 'prof-001', label: 'Luna Staff' },
  { value: 'prof-002', label: 'Rosario Staff' },
];

export function ServiceBookingForm({ onSubmit: onSubmitCallback }: ServiceBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceBookingFormData>({
    defaultValues: {
      servicio: '',
      profesional: '',
    },
  });

  const onSubmit = async (data: ServiceBookingFormData) => {
    setIsSubmitting(true);
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSubmitting(false);
    onSubmitCallback(data);
  };

  return (
    <Box className={classes.formContainer}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="xl">
          <Box>
            <Text
              ta="center"
              size="md"
              fw={300}
              mb="lg"
              className={classes.formTitle}
            >
              Por favor seleccioná el servicio que desees:
            </Text>
          </Box>

          {/* Servicio Select */}
          <Controller
            name="servicio"
            control={control}
            rules={{ required: 'Por favor selecciona un servicio' }}
            render={({ field }) => (
              <Box>
                <Text size="sm" fw={400} mb="xs" c="gray.8" className={classes.fieldLabel}>
                  * Servicio:
                </Text>
                <Select
                  {...field}
                  placeholder="Selecciona un servicio"
                  data={servicios}
                  size="md"
                  classNames={{
                    input: classes.selectInput,
                    dropdown: classes.selectDropdown,
                  }}
                  error={errors.servicio?.message}
                  searchable
                  clearable
                />
              </Box>
            )}
          />

          {/* Profesional Select */}
          <Controller
            name="profesional"
            control={control}
            render={({ field }) => (
              <Box>
                <Text size="sm" fw={400} mb="xs" c="gray.8" className={classes.fieldLabel}>
                  Profesional:
                </Text>
                <Select
                  {...field}
                  placeholder="Cualquier profesional"
                  data={profesionales}
                  size="md"
                  classNames={{
                    input: classes.selectInput,
                    dropdown: classes.selectDropdown,
                  }}
                  searchable
                  clearable
                />
              </Box>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            className={classes.submitButton}
            fw={300}
            style={{ letterSpacing: '0.1em' }}
          >
            CONTINUAR
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

