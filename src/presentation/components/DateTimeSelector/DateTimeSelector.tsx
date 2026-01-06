'use client';

import {
  Box,
  Button,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
  Loader,
  Center,
  Alert,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useAvailability } from '@/presentation/hooks';
import classes from './DateTimeSelector.module.css';

dayjs.locale('es');

interface DateTimeSelectorProps {
  serviceDuration?: number; // Duración en minutos
  employeeId?: string | null; // ID del empleado (opcional, puede ser null para "cualquier profesional")
  serviceId?: string | null; // ID del servicio (opcional)
  onSelectDateTime: (date: Date, time: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function DateTimeSelector({
  serviceDuration = 60,
  employeeId,
  serviceId,
  onSelectDateTime,
  onBack,
  showBackButton = false,
}: DateTimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Calcular rango de fechas (hoy hasta 3 meses)
  const minDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const maxDate = useMemo(
    () => dayjs().add(3, 'months').format('YYYY-MM-DD'),
    []
  );

  // Obtener disponibilidad de la API
  const {
    data: availability,
    isLoading,
    error,
    refetch,
  } = useAvailability(employeeId ?? null, serviceId ?? null, minDate, maxDate);

  // Resetear fecha y hora seleccionadas cuando cambie el servicio o empleado
  // Esto asegura que cuando el usuario cambie el servicio, se limpien las selecciones anteriores
  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
  }, [serviceId, employeeId]);

  // Obtener slots disponibles para la fecha seleccionada
  const availableSlotsForDate = useMemo(() => {
    if (!selectedDate || !availability) return [];

    const dayAvailability = availability.availability.find(
      (day) => day.date === selectedDate
    );

    if (!dayAvailability || !dayAvailability.hasActiveTimeSlots) return [];

    return dayAvailability.slots.filter((slot) => slot.available);
  }, [selectedDate, availability]);

  // Función para deshabilitar fechas sin disponibilidad o lunes/domingos
  const isDateDisabled = (date: string) => {
    // Deshabilitar lunes (1) y domingos (0)
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 1) return true;

    // Deshabilitar fechas sin disponibilidad
    if (!availability) return false;
    const dayAvailability = availability.availability.find(
      (day) => day.date === date
    );
    return !dayAvailability || !dayAvailability.hasActiveTimeSlots;
  };

  const handleDateChange = (date: string | null) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (timeStart: string) => {
    // Si ya está seleccionado, deseleccionar
    if (selectedTime === timeStart) {
      setSelectedTime(null);
    } else {
      setSelectedTime(timeStart);
    }
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      // Parsear la fecha manualmente para evitar problemas de zona horaria
      // selectedDate está en formato 'YYYY-MM-DD'
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      onSelectDateTime(dateObj, selectedTime);
    }
  };

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Center py="xl">
          <Loader size="md" />
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.container}>
        <Alert color="red" title="Error">
          No se pudo cargar la disponibilidad. Por favor, intenta nuevamente.
        </Alert>
      </Box>
    );
  }

  // Si no hay employeeId o serviceId, mostrar mensaje informativo pero permitir usar el componente
  // (útil para páginas informativas donde aún no se ha seleccionado servicio/empleado)
  if (!employeeId || !serviceId) {
    return (
      <Box className={classes.container}>
        <Stack gap="xl">
          <Text ta="center" size="md" fw={300} className={classes.title}>
            Hacé click en la fecha y la hora que desees
          </Text>
          <Alert title="Información">
            Por favor, selecciona un servicio y profesional para ver la
            disponibilidad.
          </Alert>
        </Stack>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Stack gap="xl">
        <Text ta="center" size="md" fw={300} className={classes.title}>
          Hacé click en la fecha y la hora que desees
        </Text>

        {/* Calendario */}
        <Box className={classes.calendarWrapper}>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            getDayProps={(date) => ({
              disabled: isDateDisabled(date),
            })}
            classNames={{
              day: classes.day,
            }}
            size="md"
          />
        </Box>

        {/* Franjas horarias */}
        {selectedDate && (
          <Box>
            <Text size="sm" fw={400} mb="md" ta="center" c="gray.7">
              Selecciona un horario:
            </Text>
            {availableSlotsForDate.length === 0 ? (
              <Alert title="Sin disponibilidad">
                No hay horarios disponibles para esta fecha.
              </Alert>
            ) : (
              <SimpleGrid
                cols={{ base: 2, xs: 2, sm: 3, md: 3 }}
                spacing="xs"
                className={classes.timeSlotsGrid}
              >
                {availableSlotsForDate.map((slot) => (
                  <UnstyledButton
                    key={slot.startTime}
                    onClick={() => handleTimeSelect(slot.startTime)}
                    className={`${classes.timeSlot} ${
                      selectedTime === slot.startTime
                        ? classes.timeSlotSelected
                        : ''
                    }`}
                  >
                    {slot.startTime} - {slot.endTime}
                  </UnstyledButton>
                ))}
              </SimpleGrid>
            )}
          </Box>
        )}

        {/* Botones de acción */}
        <Stack gap="sm">
          {selectedDate && selectedTime && (
            <Button
              onClick={handleContinue}
              size="lg"
              fullWidth
              className={classes.continueButton}
            >
              CONTINUAR
            </Button>
          )}

          {showBackButton && (
            <Button
              onClick={onBack}
              size="lg"
              fullWidth
              variant="outline"
              className={classes.backButton}
            >
              ATRÁS
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
