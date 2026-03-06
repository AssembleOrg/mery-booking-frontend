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

  // Función para deshabilitar fechas sin disponibilidad o lunes/domingos
  const isDateDisabled = (date: string) => {
    // Si el backend indica que hay franjas activas para esta fecha específica, habilitarla siempre
    if (availability) {
      const dayAvailability = availability.availability.find(
        (d) => d.date === date
      );
      if (dayAvailability && dayAvailability.hasActiveTimeSlots) return false;
    }

    // Fallback: deshabilitar lunes (1) y domingos (0) si no hay disponibilidad específica
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 1) return true;

    // Sin datos del backend = deshabilitar
    if (!availability) return false;
    return true;
  };

  // Función para calcular el nivel de disponibilidad de un día
  const getAvailabilityLevel = (
    date: string
  ): 'full' | 'limited' | 'available' | 'disabled' => {
    if (!availability) return 'disabled';

    const dayData = availability.availability.find((d) => d.date === date);

    // Día sin timeslots activos o día deshabilitado
    if (!dayData || !dayData.hasActiveTimeSlots) {
      return 'disabled';
    }

    const totalSlots = dayData.slots.length;
    const availableSlots = dayData.slots.filter((s) => s.available).length;

    if (totalSlots === 0) return 'disabled';

    const percentage = (availableSlots / totalSlots) * 100;

    // 0% disponibilidad = día lleno
    if (percentage === 0) return 'full';
    // < 40% disponibilidad = disponibilidad limitada
    if (percentage < 40) return 'limited';
    // >= 40% disponibilidad = buena disponibilidad
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
            getDayProps={(date) => {
              const level = getAvailabilityLevel(date);
              const isDisabled = isDateDisabled(date);
              const availableCount = getAvailabilityInfo(date);

              // Determinar clase CSS según nivel de disponibilidad
              let dayClass = classes.day;
              if (level === 'full') dayClass = `${classes.day} ${classes.dayFull}`;
              else if (level === 'limited')
                dayClass = `${classes.day} ${classes.dayLimited}`;
              else if (level === 'available')
                dayClass = `${classes.day} ${classes.dayAvailable}`;

              // Construir título para tooltip
              let title = '';
              if (isDisabled) {
                title = 'Cerrado';
              } else if (level === 'full') {
                title = 'Sin turnos disponibles';
              } else if (availableCount) {
                title = `${availableCount} turno${availableCount !== 1 ? 's' : ''} disponible${availableCount !== 1 ? 's' : ''}`;
              }

              return {
                disabled: isDisabled,
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

        {/* Leyenda de disponibilidad */}
        <Box className={classes.availabilityLegend}>
          <div className={classes.legendItem}>
            <div
              className={classes.legendColor}
              style={{ backgroundColor: '#FBE8EA' }}
            />
            <span>Disponible</span>
          </div>

          <div className={classes.legendItem}>
            <div
              className={classes.legendColor}
              style={{ backgroundColor: '#F7CBCB' }}
            />
            <span>Pocos turnos</span>
          </div>

          <div className={classes.legendItem}>
            <div
              className={classes.legendColor}
              style={{ backgroundColor: '#EBA2A8' }}
            />
            <span>Sin turnos</span>
          </div>

          <div className={classes.legendItem}>
            <div
              className={classes.legendColor}
              style={{ backgroundColor: '#e9ecef' }}
            />
            <span>Cerrado</span>
          </div>
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
      </Stack>
    </Box>
  );
}
