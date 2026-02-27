'use client';

import { useMemo, useEffect } from 'react';
import { Text, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { DateTimeSelector } from '@/presentation/components';
import classes from './ConsultaModal.module.css';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee } from '@/infrastructure/http/employeeService';
import type { ServiceEntity } from '@/infrastructure/http/serviceService';

interface Step3CalendarProps {
  selectedOption: ServiceOption;
  employees: Employee[];
  services: ServiceEntity[];
  staffConsultasId?: string;
  meryGarciaId?: string;
  availableEmployees: Employee[];
  selectedEmployeeId: string | null;
  onEmployeeSelect: (id: string) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDateTime: (date: Date, time: string) => void;
  showCalendar: boolean;
  onCanContinueChange: (can: boolean) => void;
}

export default function Step3Calendar({
  selectedOption,
  services,
  availableEmployees,
  selectedEmployeeId,
  onEmployeeSelect,
  selectedDate,
  selectedTime,
  onSelectDateTime,
  showCalendar,
  onCanContinueChange,
}: Step3CalendarProps) {
  // CLAVE: Usar selectedOption.serviceId PRIMERO, fallback a búsqueda dinámica
  const currentService = useMemo(() => {
    if (selectedOption.serviceId || !selectedOption.label || services.length === 0) return null;
    return services.find((s) => {
      const nameLower = s.name.toLowerCase();
      const labelLower = selectedOption.label.toLowerCase();
      return s.showOnSite && (nameLower.includes(labelLower) || labelLower.includes(nameLower));
    });
  }, [selectedOption.serviceId, selectedOption.label, services]);

  const serviceId = selectedOption.serviceId || currentService?.id || null;
  const serviceDuration = selectedOption.serviceDuration || currentService?.duration || 60;

  // employeeId efectivo: lo que seleccionó el usuario > lo que viene en la opción > primero disponible
  const effectiveEmployeeId = useMemo(() => {
    if (selectedEmployeeId) return selectedEmployeeId;
    if (selectedOption.employeeId) return selectedOption.employeeId;
    if (availableEmployees.length > 0) return availableEmployees[0].id;
    return null;
  }, [selectedEmployeeId, selectedOption.employeeId, availableEmployees]);

  // Auto-seleccionar cuando hay exactamente 1 empleado y no hay selección aún
  useEffect(() => {
    if (!selectedEmployeeId && availableEmployees.length === 1) {
      onEmployeeSelect(availableEmployees[0].id);
    }
  }, [availableEmployees, selectedEmployeeId]);

  // Reportar al shell si se puede continuar
  useEffect(() => {
    if (!showCalendar) {
      // En la pantalla de selección de profesional, se puede continuar si hay employeeId y serviceId
      onCanContinueChange(!!effectiveEmployeeId && !!serviceId);
    } else {
      onCanContinueChange(!!selectedDate && !!selectedTime);
    }
  }, [showCalendar, effectiveEmployeeId, serviceId, selectedDate, selectedTime]);

  // Debug log
  useEffect(() => {
    console.log('🔍 ConsultaModal Step3Calendar Debug:', {
      'selectedOption.id': selectedOption.id,
      'selectedOption.label': selectedOption.label,
      'selectedOption.serviceId': selectedOption.serviceId,
      'selectedOption.employeeId': selectedOption.employeeId,
      'availableEmployees.length': availableEmployees.length,
      'availableEmployees': availableEmployees.map(e => `${e.fullName} (${e.id})`),
      'selectedEmployeeId': selectedEmployeeId,
      'effectiveEmployeeId': effectiveEmployeeId,
      'serviceId': serviceId,
    });
  }, [selectedOption, availableEmployees, selectedEmployeeId, effectiveEmployeeId, serviceId]);

  const hasMultipleEmployees = availableEmployees.length > 1;

  // ESTADO 1: Selección de Profesional (ANTES del calendario)
  if (!showCalendar) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={classes.stepContainer}
      >
        <Stack gap="xl">
          <div>
            <Text className={classes.stepTitle}>
              {hasMultipleEmployees ? 'Elegí tu profesional' : 'Profesional asignado'}
            </Text>
            <Text className={classes.stepDescription}>
              {hasMultipleEmployees
                ? 'Seleccioná el profesional de tu preferencia para este servicio'
                : 'Confirmá el profesional asignado para este servicio'}
            </Text>
          </div>

          {hasMultipleEmployees ? (
            // Selector de profesionales cuando hay más de uno
            <div className={classes.employeeSelector}>
              {availableEmployees.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  className={`${classes.employeeCard} ${
                    (selectedEmployeeId || effectiveEmployeeId) === emp.id
                      ? classes.employeeCardSelected
                      : ''
                  }`}
                  onClick={() => onEmployeeSelect(emp.id)}
                >
                  <Text className={classes.professionalName}>{emp.fullName}</Text>
                </button>
              ))}
            </div>
          ) : (
            // Card fija cuando hay un solo profesional
            <div className={classes.professionalCard}>
              <Text className={classes.professionalLabel}>Profesional:</Text>
              <Text className={classes.professionalName}>
                {availableEmployees[0]?.fullName || 'Profesional'}
              </Text>
            </div>
          )}
        </Stack>
      </motion.div>
    );
  }

  // ESTADO 2: Calendario (DESPUÉS de confirmar profesional)
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={classes.stepContainer}
    >
      <Stack gap="xl">
        <div>
          <Text className={classes.stepTitle}>Elegí fecha y hora</Text>
          <Text className={classes.stepDescription}>
            Seleccioná el día y horario que mejor te quede
          </Text>
        </div>

        <DateTimeSelector
          employeeId={effectiveEmployeeId}
          serviceId={serviceId}
          serviceDuration={serviceDuration}
          onSelectDateTime={onSelectDateTime}
        />
      </Stack>
    </motion.div>
  );
}
