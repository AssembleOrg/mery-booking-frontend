'use client';

import { useMemo, useEffect } from 'react';
import { Text, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { DateTimeSelector } from '@/presentation/components';
import classes from './ReservaModal.module.css';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee } from '@/infrastructure/http/employeeService';
import type { ServiceEntity } from '@/infrastructure/http/serviceService';
import { EMPLOYEE_IDS } from '@/config/constants';

interface Step3CalendarProps {
  selectedOption: ServiceOption;
  employees: Employee[];
  services: ServiceEntity[];
  staffConsultasId?: string;
  meryGarciaId?: string;
  serviceEmployees?: Map<string, Employee[]>;
  selectedEmployeeId: string | null;
  onEmployeeSelect: (id: string) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDateTime: (date: Date, time: string) => void;
  onEmployeeResolved?: (employeeId: string | null) => void;
  onBack: () => void;
  showCalendar: boolean;
  onShowCalendarChange: (show: boolean) => void;
  onStep3IdsResolved: (employeeId: string | null, serviceId: string | null) => void;
}

export function Step3Calendar({
  selectedOption,
  employees,
  services,
  staffConsultasId,
  meryGarciaId,
  serviceEmployees,
  selectedEmployeeId,
  onEmployeeSelect,
  selectedDate,
  selectedTime,
  onSelectDateTime,
  onEmployeeResolved,
  onBack,
  showCalendar,
  onShowCalendarChange,
  onStep3IdsResolved,
}: Step3CalendarProps) {
  // IDs de constantes como fallback
  const STAFF_CONSULTAS_FALLBACK_ID = EMPLOYEE_IDS.STAFF_CONSULTAS;
  const MERY_GARCIA_FALLBACK_ID = EMPLOYEE_IDS.MERY_GARCIA;


  // Buscar service dinámicamente por label
  const currentService = useMemo(() => {
    if (!selectedOption.label || services.length === 0) return null;

    return services.find((s) => {
      const nameLower = s.name.toLowerCase();
      const labelLower = selectedOption.label.toLowerCase();
      return (
        s.showOnSite &&
        (nameLower.includes(labelLower) || labelLower.includes(nameLower))
      );
    });
  }, [selectedOption.label, services]);

  const serviceId = selectedOption.serviceId || currentService?.id || null;
  const serviceDuration =
    selectedOption.serviceDuration || currentService?.duration || 60;

  // Lista de profesionales habilitados para este servicio (many-to-many backend)
  const availableEmployees = useMemo<Employee[]>(() => {
    if (!serviceId || !serviceEmployees) return [];
    return serviceEmployees.get(serviceId) ?? [];
  }, [serviceId, serviceEmployees]);

  const hasMultipleEmployees = availableEmployees.length > 1;

  // employeeId efectivo: selección del usuario > opción explícita > primer disponible > fallbacks
  const employeeId = useMemo(() => {
    if (selectedEmployeeId) return selectedEmployeeId;
    if (selectedOption.employeeId) return selectedOption.employeeId;
    if (availableEmployees.length > 0) return availableEmployees[0].id;

    if (
      selectedOption.contentType === 'consulta-sin-trabajo' ||
      selectedOption.contentType === 'consulta-con-trabajo' ||
      selectedOption.contentType === 'consulta'
    ) {
      return staffConsultasId || STAFF_CONSULTAS_FALLBACK_ID;
    }

    return meryGarciaId || MERY_GARCIA_FALLBACK_ID;
  }, [selectedEmployeeId, selectedOption, availableEmployees, staffConsultasId, meryGarciaId]);

  // Auto-seleccionar el único profesional disponible
  useEffect(() => {
    if (!selectedEmployeeId && availableEmployees.length === 1) {
      onEmployeeSelect(availableEmployees[0].id);
    }
  }, [availableEmployees, selectedEmployeeId, onEmployeeSelect]);

  useEffect(() => {
    onEmployeeResolved?.(employeeId || null);
  }, [employeeId, onEmployeeResolved]);

  useEffect(() => {
    onStep3IdsResolved(employeeId || null, serviceId);
  }, [employeeId, serviceId]);

  // Determinar nombre del profesional
  const professionalName = useMemo(() => {
    // 1) Lookup en availableEmployees (lista filtrada por servicio)
    const fromAvailable = availableEmployees.find((e: Employee) => e.id === employeeId);
    if (fromAvailable?.fullName) return fromAvailable.fullName;

    // 2) Fallbacks hardcoded para staff consultas / mery garcia (cuando la API no responde)
    if (
      employeeId === staffConsultasId ||
      employeeId === STAFF_CONSULTAS_FALLBACK_ID
    )
      return 'Staff Consultas';
    if (employeeId === meryGarciaId || employeeId === MERY_GARCIA_FALLBACK_ID)
      return 'Mery Garcia';

    // 3) Lookup en employees globales
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.fullName || 'Profesional';
  }, [employeeId, availableEmployees, staffConsultasId, meryGarciaId, employees]);

  // Handler para volver a Step 2
  const handleBackToStep2 = () => {
    onShowCalendarChange(false);
    onBack();
  };

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
              {hasMultipleEmployees ? 'Elegí tu profesional' : 'Seleccionar profesional'}
            </Text>
            <Text className={classes.stepDescription}>
              {hasMultipleEmployees
                ? 'Seleccioná el profesional de tu preferencia para este servicio'
                : 'Confirmá el profesional asignado para este servicio'}
            </Text>
          </div>

          {hasMultipleEmployees ? (
            <div className={classes.employeeSelector}>
              {availableEmployees.map((emp: Employee) => (
                <button
                  key={emp.id}
                  type="button"
                  className={`${classes.employeeCard} ${
                    employeeId === emp.id ? classes.employeeCardSelected : ''
                  }`}
                  onClick={() => onEmployeeSelect(emp.id)}
                >
                  <Text className={classes.professionalName}>{emp.fullName}</Text>
                </button>
              ))}
            </div>
          ) : (
            <div className={classes.professionalCard}>
              <Text className={classes.professionalLabel}>Profesional:</Text>
              <Text className={classes.professionalName}>{professionalName}</Text>
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
          employeeId={employeeId}
          serviceId={serviceId}
          serviceDuration={serviceDuration}
          onSelectDateTime={onSelectDateTime}
        />
      </Stack>
    </motion.div>
  );
}
