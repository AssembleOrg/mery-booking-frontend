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
  Tooltip,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useAvailability } from '@/presentation/hooks';
import classes from './DateTimeSelector.module.css';

dayjs.locale('es');

export interface LmbSlotInfo {
  lmbId: string;
  discountPercent: number;
}

interface DateTimeSelectorProps {
  serviceDuration?: number; // Duración en minutos
  employeeId?: string | null; // ID del empleado (opcional, puede ser null para "cualquier profesional")
  serviceId?: string | null; // ID del servicio (opcional)
  onSelectDateTime: (date: Date, time: string, lmbInfo?: LmbSlotInfo) => void;
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

    if (dayData.dayState === 'closed') return 'disabled';
    if (dayData.dayState === 'fully_booked') return 'full';

    const availableSlots = dayData.slots.filter((s) => s.available).length;
    if (availableSlots === 0) return 'full';
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

  // Indica si un día tiene al menos un slot LMB activo
  const dayHasLmb = (date: string): boolean => {
    if (!availability) return false;
    const dayData = availability.availability.find((d) => d.date === date);
    if (!dayData) return false;
    return dayData.slots.some((s) => s.isLmb && s.available);
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
        const slot = availableSlotsForDate.find((s) => s.startTime === timeStart);
        const lmbInfo: LmbSlotInfo | undefined =
          slot && slot.isLmb && slot.lmbId && typeof slot.discountPercent === 'number'
            ? { lmbId: slot.lmbId, discountPercent: slot.discountPercent }
            : undefined;
        onSelectDateTime(dateObj, timeStart, lmbInfo);
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
              const hasLmb = dayHasLmb(date);

              const parts: string[] = [classes.day];
              if (level === 'full') parts.push(classes.dayFull);
              else if (level === 'limited') parts.push(classes.dayLimited);
              else if (level === 'available') parts.push(classes.dayAvailable);
              if (hasLmb) parts.push(classes.dayHasLmb);
              const dayClass = parts.join(' ');

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
                title: hasLmb ? `${title}${title ? ' · ' : ''}Last Minute disponible` : title,
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
            <span className={classes.legendStrike}>15</span>
            <span>Agenda completa</span>
          </div>
          <div className={classes.legendItem}>
            <span style={{ fontSize: '14px', lineHeight: 1 }}>🔥</span>
            <span>Last Minute Booking</span>
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
                {availableSlotsForDate.map((slot) => {
                  const slotButton = (
                    <UnstyledButton
                      key={`${slot.startTime}-${slot.isLmb ? 'lmb' : 'reg'}`}
                      onClick={() => handleTimeSelect(slot.startTime)}
                      className={`${classes.timeSlot} ${
                        selectedTime === slot.startTime
                          ? classes.timeSlotSelected
                          : ''
                      }`}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        {slot.isLmb && <span>🔥</span>}
                        <span>{slot.startTime} - {slot.endTime}</span>
                        {slot.isLmb && slot.discountPercent ? (
                          <span style={{ fontSize: '0.75em', color: '#660e1b', fontWeight: 600 }}>
                            -{slot.discountPercent}%
                          </span>
                        ) : null}
                      </span>
                    </UnstyledButton>
                  );
                  if (slot.isLmb) {
                    return (
                      <Tooltip
                        key={`${slot.startTime}-lmb`}
                        label={`Last Minute Booking · ${slot.discountPercent ?? 0}% off · No es reagendable`}
                        position="top"
                        withArrow
                        events={{ hover: true, focus: true, touch: true }}
                      >
                        {slotButton}
                      </Tooltip>
                    );
                  }
                  return slotButton;
                })}
              </SimpleGrid>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
