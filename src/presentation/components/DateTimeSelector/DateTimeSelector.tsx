'use client';

import { Box, Button, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import classes from './DateTimeSelector.module.css';

dayjs.locale('es');

interface DateTimeSelectorProps {
  serviceDuration?: number; // Duración en minutos
  onSelectDateTime: (date: Date, time: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function DateTimeSelector({
  serviceDuration = 60,
  onSelectDateTime,
  onBack,
  showBackButton = false,
}: DateTimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generar franjas horarias desde las 9 AM con rango completo
  const generateTimeSlots = () => {
    const slots: Array<{ start: string; end: string; display: string }> = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM (último turno 17:00-18:00)
    const slotDuration = serviceDuration;

    let currentMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    while (currentMinutes + slotDuration <= endMinutes) {
      const startHours = Math.floor(currentMinutes / 60);
      const startMins = currentMinutes % 60;
      const startTime = `${startHours.toString().padStart(2, '0')}:${startMins.toString().padStart(2, '0')}`;
      
      const endCurrentMinutes = currentMinutes + slotDuration;
      const endHours = Math.floor(endCurrentMinutes / 60);
      const endMins = endCurrentMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
      
      slots.push({
        start: startTime,
        end: endTime,
        display: `${startTime} - ${endTime}`,
      });
      
      currentMinutes += slotDuration;
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Función para deshabilitar lunes (1) y domingos (0)
  const isDateDisabled = (date: string) => {
    // Parsear la fecha correctamente para evitar problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek === 0 || dayOfWeek === 1; // 0 = Domingo, 1 = Lunes
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
      const dateObj = new Date(selectedDate);
      onSelectDateTime(dateObj, selectedTime);
    }
  };

  return (
    <Box className={classes.container}>
      <Stack gap="xl">
        <Text
          ta="center"
          size="md"
          fw={300}
          className={classes.title}
        >
          Hacé click en la fecha y la hora que desees
        </Text>

        {/* Calendario */}
        <Box className={classes.calendarWrapper}>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            minDate={dayjs().format('YYYY-MM-DD')}
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
            <SimpleGrid
              cols={{ base: 2, xs: 2, sm: 3, md: 3 }}
              spacing="xs"
              className={classes.timeSlotsGrid}
            >
              {timeSlots.map((slot) => (
                <UnstyledButton
                  key={slot.start}
                  onClick={() => handleTimeSelect(slot.start)}
                  className={`${classes.timeSlot} ${
                    selectedTime === slot.start ? classes.timeSlotSelected : ''
                  }`}
                >
                  {slot.display}
                </UnstyledButton>
              ))}
            </SimpleGrid>
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

