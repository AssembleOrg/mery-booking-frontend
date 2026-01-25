'use client';

import { Box, Button, Select, Stack, Text, Loader, Center } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm, Controller } from 'react-hook-form';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useServices, useEmployees } from '@/presentation/hooks';
import dayjs from 'dayjs';
import { BookingService } from '@/infrastructure/http/bookingService';
import type { Employee } from '@/infrastructure/http';
import classes from './ServiceBookingForm.module.css';

export interface ServiceBookingFormData {
  servicio: string;
  profesional: string;
  fecha: Date;
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
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  
  // Cargar servicios y empleados desde la API
  const { data: services = [], isLoading: isLoadingServices } = useServices(categoryId);
  // Cargar TODOS los empleados sin filtro (el filtro se hará por disponibilidad)
  const { data: allEmployees = [], isLoading: isLoadingEmployees } = useEmployees(categoryId, selectedServiceId || undefined);
  
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

    // Solo llamar si hay un servicio seleccionado, fecha y los valores han cambiado
    if (currentServicio && selectedDateStr && onChangeRef.current) {
      const prevValues = prevValuesRef.current;
      const selectedDate = dayjs(selectedDateStr).toDate();

      // Verificar si los valores realmente cambiaron
      if (prevValues.servicio !== currentServicio || prevValues.profesional !== currentProfesional) {
        prevValuesRef.current = {
          servicio: currentServicio,
          profesional: currentProfesional,
        };

        onChangeRef.current({
          servicio: currentServicio,
          profesional: currentProfesional,
          fecha: selectedDate,
        });
      }
    }
  }, [servicioValue, profesionalValue, selectedDateStr]);

  // Función para filtrar profesionales por disponibilidad en una fecha específica
  const filterEmployeesByDate = async (dateStr: string) => {
    if (!selectedServiceId || !allEmployees || allEmployees.length === 0) {
      return;
    }

    setIsLoadingAvailability(true);

    try {
      // Llamar availability para cada profesional en paralelo

      const availabilityPromises = allEmployees.map(async (employee) => {
        try {
          const result = await BookingService.getAvailability(
            employee.id,
            selectedServiceId,
            dateStr,
            dateStr
          );

          // Verificar si tiene slots disponibles ese día
          const hasAvailability = result.availability[0]?.hasActiveTimeSlots ?? false;

          return hasAvailability ? employee : null;
        } catch (error) {
          console.error(`Error fetching availability for employee ${employee.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(availabilityPromises);
      const available = results.filter((emp): emp is Employee => emp !== null);

      setFilteredEmployees(available);
    } catch (error) {
      console.error('Error filtrando profesionales:', error);
      setFilteredEmployees([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Handler para cambio de fecha
  const handleDateChange = (value: string | null) => {
    setSelectedDateStr(value);

    if (value) {
      filterEmployeesByDate(value);
    } else {
      setFilteredEmployees([]);
    }
  };

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
    // Si no hay fecha seleccionada, no mostrar opciones
    if (!selectedDateStr || filteredEmployees.length === 0) return [];

    return filteredEmployees.map(employee => ({
      value: employee.id,
      label: employee.fullName,
    }));
  }, [filteredEmployees, selectedDateStr]);

  const onSubmit = async (data: ServiceBookingFormData) => {
    if (!selectedDateStr) {
      return;
    }

    const selectedDate = dayjs(selectedDateStr).toDate();

    setIsSubmitting(true);
    // Simular delay mínimo para UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSubmitting(false);
    onSubmitCallback({
      ...data,
      fecha: selectedDate,
    });
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

          {/* Date Picker - Solo si hay servicio seleccionado */}
          {selectedServiceId && (
            <Box>
              <Text size="sm" fw={400} mb="xs" c="gray.8" className={classes.fieldLabel}>
                * Fecha:
              </Text>
              <Box className={classes.datePickerWrapper}>
                <DatePicker
                  value={selectedDateStr}
                  onChange={handleDateChange}
                  minDate={dayjs().format('YYYY-MM-DD')}
                  maxDate={dayjs().add(30, 'days').format('YYYY-MM-DD')}
                  locale="es"
                  size="md"
                />
              </Box>
            </Box>
          )}

          {/* Profesional Select - Solo si hay fecha seleccionada */}
          {selectedServiceId && selectedDateStr && (
            <Controller
              name="profesional"
              control={control}
              rules={{ required: 'Por favor selecciona un profesional' }}
              render={({ field }) => (
                <Box>
                  <Text size="sm" fw={400} mb="xs" c="gray.8" className={classes.fieldLabel}>
                    * Profesional:
                  </Text>
                  <Select
                    {...field}
                    placeholder={
                      isLoadingAvailability
                        ? "Cargando disponibilidad..."
                        : filteredEmployees.length === 0
                        ? "No hay profesionales disponibles para esta fecha"
                        : "Selecciona un profesional"
                    }
                    data={profesionalesOptions}
                    size="md"
                    classNames={{
                      input: classes.selectInput,
                      dropdown: classes.selectDropdown,
                    }}
                    disabled={isLoadingAvailability || filteredEmployees.length === 0}
                    searchable
                    clearable
                  />
                  {isLoadingAvailability && (
                    <Center mt="xs">
                      <Loader size="sm" />
                    </Center>
                  )}
                </Box>
              )}
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            disabled={!selectedServiceId || !selectedDateStr || !profesionalValue || isLoadingAvailability}
            className={classes.submitButton}
            fw={300}
            style={{
              letterSpacing: '0.1em',
              backgroundColor: '#F7CBCB',
              color: '#ffffff',
            }}
          >
            CONTINUAR
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

