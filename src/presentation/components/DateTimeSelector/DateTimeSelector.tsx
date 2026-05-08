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
  selectedDate?: Date; // Fecha pre-seleccionada desde ServiceBookingForm
  onBack?: () => void; // Callback para retroceder (opcional)
  showBackButton?: boolean; // Mostrar botón de retroceso (opcional)
}

export function DateTimeSelector({
  serviceDuration = 60,
  employeeId,
  serviceId,
  onSelectDateTime,
  selectedDate: preSelectedDate,
  onBack,
  showBackButton = false,
}: DateTimeSelectorProps) {
  // Convertir la fecha pre-seleccionada a string formato YYYY-MM-DD si existe
  const initialDate = preSelectedDate
    ? dayjs(preSelectedDate).format('YYYY-MM-DD')
    : null;

  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
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

  // Set de días de la semana en los que el empleado trabaja al menos una vez en el rango.
  // Permite distinguir "agenda completa" (día laborable sin slots libres) de "cerrado"
  // ya que el backend colapsa ambos casos a hasActiveTimeSlots:false.
  const workingDaysOfWeek = useMemo(() => {
    const set = new Set<string>();
    if (!availability) return set;
    for (const d of availability.availability) {
      if (d.hasActiveTimeSlots) set.add(d.dayOfWeek);
    }
    return set;
  }, [availability]);

  // Actualizar fecha seleccionada cuando cambie la fecha pre-seleccionada
  useEffect(() => {
    if (preSelectedDate) {
      const dateStr = dayjs(preSelectedDate).format('YYYY-MM-DD');
      setSelectedDate(dateStr);
    }
  }, [preSelectedDate]);

  // Resetear fecha y hora seleccionadas cuando cambie el servicio o empleado
  // Esto asegura que cuando el usuario cambie el servicio, se limpien las selecciones anteriores
  useEffect(() => {
    // Solo resetear si no hay fecha pre-seleccionada
    if (!preSelectedDate) {
      setSelectedDate(null);
      setSelectedTime(null);
    } else {
      setSelectedTime(null);
    }
  }, [serviceId, employeeId, preSelectedDate]);

  // Obtener slots disponibles para la fecha seleccionada
  const availableSlotsForDate = useMemo(() => {
    if (!selectedDate || !availability) return [];

    const dayAvailability = availability.availability.find(
      (day) => day.date === selectedDate
    );

    if (!dayAvailability || !dayAvailability.hasActiveTimeSlots) return [];

    return dayAvailability.slots.filter((slot) => slot.available);
  }, [selectedDate, availability]);

  // Función para calcular el nivel de disponibilidad de un día
  const getAvailabilityLevel = (
    date: string
  ): 'full' | 'limited' | 'available' | 'disabled' => {
    if (!availability) return 'disabled';

    const dayData = availability.availability.find((d) => d.date === date);
    if (!dayData) return 'disabled';

    // Backend colapsa "agenda completa" y "no laborable" en hasActiveTimeSlots:false.
    // Heurística: si el empleado trabaja ese dayOfWeek en otro día del rango,
    // este día sin slots es agenda completa, no cerrado.
    if (!dayData.hasActiveTimeSlots) {
      return workingDaysOfWeek.has(dayData.dayOfWeek) ? 'full' : 'disabled';
    }

    const availableSlots = dayData.slots.filter((s) => s.available).length;
    if (availableSlots === 0) return 'disabled';
    if (availableSlots <= 2) return 'limited';
    return 'available';
  };

  // Función para obtener información de disponibilidad para tooltips
  const getAvailabilityInfo = (date: string) => {
    if (!availability) return null;

    const dayData = availability.availability.find((d) => d.date === date);
    if (!dayData || !dayData.hasActiveTimeSlots) return null;

    const availableCount = dayData.slots.filter((s) => s.available).length;
    return availableCount;
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
      // Notificar al padre con la fecha y hora seleccionadas
      if (selectedDate) {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        onSelectDateTime(dateObj, timeStart);
      }
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
            Elegí día y horario
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
          Elegí día y horario
        </Text>

        {/* Calendario */}
        <Box className={classes.calendarWrapper}>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            getDayProps={(date) => {
              const level = getAvailabilityLevel(date);
              const availableCount = getAvailabilityInfo(date);

              let dayClass = classes.day;
              if (level === 'full') dayClass = `${classes.day} ${classes.dayFull}`;
              else if (level === 'limited')
                dayClass = `${classes.day} ${classes.dayLimited}`;
              else if (level === 'available')
                dayClass = `${classes.day} ${classes.dayAvailable}`;

              let title = '';
              if (level === 'disabled') {
                title = '';
              } else if (level === 'full') {
                title = 'Agenda completa';
              } else if (level === 'limited' && availableCount) {
                title = `Solo quedan ${availableCount} turno${availableCount !== 1 ? 's' : ''}`;
              } else if (availableCount) {
                title = `${availableCount} turno${availableCount !== 1 ? 's' : ''} disponible${availableCount !== 1 ? 's' : ''}`;
              }

              return {
                disabled: level === 'disabled' || level === 'full',
                className: dayClass,
                title,
              };
            }}
            classNames={{
              day: classes.day,
            }}
            style={{ maxWidth: '100%' }}
            size="sm"
          />
        </Box>

        {/* Leyenda con texto compacto */}
        <Box className={classes.availabilityLegend}>
          <div className={classes.legendItem}>
            <div className={classes.legendDots}>
              <div
                className={classes.legendDot}
                style={{ backgroundColor: '#eba2a8' }}
              />
              <div
                className={classes.legendDot}
                style={{ backgroundColor: '#eba2a8' }}
              />
            </div>
            <span>Disponible</span>
          </div>
          <div className={classes.legendItem}>
            <div
              className={classes.legendDot}
              style={{ backgroundColor: '#eba2a8' }}
            />
            <span>Pocos turnos</span>
          </div>
          <div className={classes.legendItem}>
            <div className={classes.legendDash} />
            <span>Agenda completa</span>
          </div>
        </Box>

        {/* Franjas horarias */}
        {selectedDate && (
          <Box>
            <Text size="sm" fw={500} mb="md" ta="center" c="gray.7">
              Horarios disponibles
            </Text>
            {availableSlotsForDate.length === 0 ? (
              <Alert>
                No quedan horarios libres este día. Probá otro.
              </Alert>
            ) : (
              <SimpleGrid
                cols={{ base: 2, sm: 3 }}
                spacing="sm"
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
      </Stack>
    </Box>
  );
}
