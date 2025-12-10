'use client';

import { Box, Button, Select, Stack, Text, Loader, Center } from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useServices, useEmployees } from '@/presentation/hooks';
import classes from './ServiceBookingForm.module.css';

export interface ServiceBookingFormData {
  servicio: string;
  profesional: string;
}

interface ServiceBookingFormProps {
  onSubmit: (data: ServiceBookingFormData) => void;
  onChange?: (data: ServiceBookingFormData) => void; // Callback opcional para cambios en tiempo real
  categoryId?: string; // Opcional: filtrar servicios por categoría
  employeeFilter?: (employee: { id: string; fullName: string }) => boolean; // Opcional: filtrar empleados
}

export function ServiceBookingForm({ onSubmit: onSubmitCallback, onChange, categoryId, employeeFilter }: ServiceBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  // Cargar servicios y empleados desde la API
  const { data: services = [], isLoading: isLoadingServices } = useServices(categoryId);
  // Refetch empleados cuando cambie el servicio seleccionado
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees(categoryId, selectedServiceId || undefined);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ServiceBookingFormData>({
    defaultValues: {
      servicio: '',
      profesional: '',
    },
  });

  // Observar cambios en el servicio y profesional seleccionados
  const servicioValue = watch('servicio');
  const profesionalValue = watch('profesional');
  
  // Usar useRef para mantener la referencia más reciente de onChange sin causar re-renders
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // Guardar valores anteriores para evitar llamadas innecesarias
  const prevValuesRef = useRef<{ servicio: string; profesional: string }>({ servicio: '', profesional: '' });
  
  // Actualizar selectedServiceId cuando cambie el servicio
  useEffect(() => {
    if (servicioValue) {
      setSelectedServiceId(servicioValue);
    } else {
      setSelectedServiceId(null);
    }
  }, [servicioValue]);

  // Notificar cambios en tiempo real al componente padre cuando cambie el servicio o profesional
  // Solo notificar si hay un servicio seleccionado y los valores han cambiado
  useEffect(() => {
    const currentServicio = servicioValue || '';
    const currentProfesional = profesionalValue || '';
    
    // Solo llamar si hay un servicio seleccionado y los valores han cambiado
    if (currentServicio && onChangeRef.current) {
      const prevValues = prevValuesRef.current;
      
      // Verificar si los valores realmente cambiaron
      if (prevValues.servicio !== currentServicio || prevValues.profesional !== currentProfesional) {
        prevValuesRef.current = {
          servicio: currentServicio,
          profesional: currentProfesional,
        };
        
        onChangeRef.current({
          servicio: currentServicio,
          profesional: currentProfesional,
        });
      }
    }
  }, [servicioValue, profesionalValue]);

  // Transformar servicios para el Select
  const serviciosOptions = useMemo(() => {
    return services
      .filter(service => {
        // Si el servicio tiene showOnSite, filtrar por él
        // Si no lo tiene (respuesta pública), incluir todos (ya son visibles por definición)
        return 'showOnSite' in service ? service.showOnSite : true;
      })
      .map(service => ({
        value: service.id,
        label: service.name,
      }));
  }, [services]);

  // Transformar empleados para el Select
  const profesionalesOptions = useMemo(() => {
    const options = [{ value: '', label: 'Cualquier profesional' }];
    const filteredEmployees = employeeFilter 
      ? employees.filter(employeeFilter)
      : employees;
    return [
      ...options,
      ...filteredEmployees.map(employee => ({
        value: employee.id,
        label: employee.fullName,
      })),
    ];
  }, [employees, employeeFilter]);

  const onSubmit = async (data: ServiceBookingFormData) => {
    setIsSubmitting(true);
    // Simular delay mínimo para UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSubmitting(false);
    onSubmitCallback(data);
  };

  if (isLoadingServices || isLoadingEmployees) {
    return (
      <Box className={classes.formContainer}>
        <Center py="xl">
          <Loader size="md" />
        </Center>
      </Box>
    );
  }

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
                  data={serviciosOptions}
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
                  data={profesionalesOptions}
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

