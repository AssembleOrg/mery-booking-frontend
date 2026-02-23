'use client';

import { useMemo, useEffect } from 'react';
import { Text, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { DateTimeSelector } from '@/presentation/components';
import classes from './ConsultaModal.module.css';
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
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDateTime: (date: Date, time: string) => void;
  showCalendar: boolean;
  onCanContinueChange: (can: boolean) => void;
}

export default function Step3Calendar({
  selectedOption,
  employees,
  services,
  staffConsultasId,
  meryGarciaId,
  selectedDate,
  selectedTime,
  onSelectDateTime,
  showCalendar,
  onCanContinueChange,
}: Step3CalendarProps) {
  // IDs de constantes como fallback
  const STAFF_CONSULTAS_FALLBACK_ID = EMPLOYEE_IDS.STAFF_CONSULTAS;
  const MERY_GARCIA_FALLBACK_ID = EMPLOYEE_IDS.MERY_GARCIA;

  // Buscar service dinámicamente por label (como FALLBACK)
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

  // Determinar employeeId dinámicamente con fallbacks
  const employeeId = useMemo(() => {
    if (selectedOption.employeeId) return selectedOption.employeeId;

    if (
      selectedOption.contentType === 'consulta-sin-trabajo' ||
      selectedOption.contentType === 'consulta-con-trabajo' ||
      selectedOption.contentType === 'consulta'
    ) {
      return staffConsultasId || STAFF_CONSULTAS_FALLBACK_ID;
    }

    return meryGarciaId || MERY_GARCIA_FALLBACK_ID;
  }, [selectedOption, staffConsultasId, meryGarciaId]);

  // CLAVE: Usar selectedOption.serviceId PRIMERO, fallback a búsqueda dinámica
  const serviceId = selectedOption.serviceId || currentService?.id || null;
  const serviceDuration =
    selectedOption.serviceDuration || currentService?.duration || 60;

  // Determinar nombre del profesional
  const professionalName = useMemo(() => {
    if (
      employeeId === staffConsultasId ||
      employeeId === STAFF_CONSULTAS_FALLBACK_ID
    )
      return 'Staff Consultas';
    if (employeeId === meryGarciaId || employeeId === MERY_GARCIA_FALLBACK_ID)
      return 'Mery Garcia';

    const employee = employees.find((e) => e.id === employeeId);
    return employee?.fullName || 'Profesional';
  }, [employeeId, staffConsultasId, meryGarciaId, employees]);

  // Debug log
  useEffect(() => {
    console.log('🔍 ConsultaModal Step3Calendar Debug:', {
      'selectedOption.id': selectedOption.id,
      'selectedOption.label': selectedOption.label,
      'selectedOption.contentType': selectedOption.contentType,
      'selectedOption.serviceId': selectedOption.serviceId,
      'selectedOption.employeeId': selectedOption.employeeId,
      'selectedOption.serviceDuration': selectedOption.serviceDuration,
      'props.staffConsultasId': staffConsultasId,
      'props.meryGarciaId': meryGarciaId,
      'employees.length': employees.length,
      'services.length': services.length,
      'calculated employeeId': employeeId,
      'calculated serviceId': serviceId,
      'calculated professionalName': professionalName,
    });
  }, [
    selectedOption,
    employeeId,
    serviceId,
    professionalName,
    staffConsultasId,
    meryGarciaId,
    employees.length,
    services.length,
  ]);

  // Reportar al shell si se puede continuar
  useEffect(() => {
    if (!showCalendar) {
      onCanContinueChange(!!employeeId && !!serviceId);
    } else {
      onCanContinueChange(!!selectedDate && !!selectedTime);
    }
  }, [showCalendar, employeeId, serviceId, selectedDate, selectedTime]);

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
            <Text className={classes.stepTitle}>Seleccionar profesional</Text>
            <Text className={classes.stepDescription}>
              Confirmá el profesional asignado para este servicio
            </Text>
          </div>

          {/* Professional Card */}
          <div className={classes.professionalCard}>
            <Text className={classes.professionalLabel}>Profesional:</Text>
            <Text className={classes.professionalName}>{professionalName}</Text>
          </div>
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
