'use client';

import { useMemo, useState, useEffect } from 'react';
import { Text, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import { DateTimeSelector } from '@/presentation/components';
import classes from './ReservaModal.module.css';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee } from '@/infrastructure/http/employeeService';
import type { ServiceEntity } from '@/infrastructure/http/serviceService';

interface Step3CalendarProps {
  selectedOption: ServiceOption;
  employees: Employee[];
  services: ServiceEntity[];
  staffConsultasId?: string;
  meryGarciaId?: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDateTime: (date: Date, time: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step3Calendar({
  selectedOption,
  employees,
  services,
  staffConsultasId,
  meryGarciaId,
  selectedDate,
  selectedTime,
  onSelectDateTime,
  onContinue,
  onBack,
}: Step3CalendarProps) {
  // IDs hardcoded como fallback (igual que en ConsultaContent)
  const STAFF_CONSULTAS_FALLBACK_ID = '2d283dc6-6940-46fc-9166-eb6b17b8cc0f';
  // ID real de Mery Garcia obtenido de la base de datos
  const MERY_GARCIA_FALLBACK_ID = '8eda28e3-a122-4eb6-8673-356333558d78';

  // Estado para controlar si se muestra el calendario (como en dropdown flow)
  const [showCalendar, setShowCalendar] = useState(false);

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

  const serviceId = selectedOption.serviceId || currentService?.id || null;
  const serviceDuration =
    selectedOption.serviceDuration || currentService?.duration || 60;

  // Determinar nombre del profesional
  const professionalName = useMemo(() => {
    // Verificamos contra props O contra los fallbacks (fix visual crucial cuando falla la API)
    if (
      employeeId === staffConsultasId ||
      employeeId === STAFF_CONSULTAS_FALLBACK_ID
    )
      return 'Staff Consultas';
    if (employeeId === meryGarciaId || employeeId === MERY_GARCIA_FALLBACK_ID)
      return 'Mery Garcia';

    // Buscar en employees array
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.fullName || 'Profesional';
  }, [employeeId, staffConsultasId, meryGarciaId, employees]);

  // Debug log
  useEffect(() => {
    console.log('🔍 Step3Calendar Debug:', {
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

  // Handler para mostrar el calendario
  const handleContinue = () => {
    if (employeeId && serviceId) {
      setShowCalendar(true);
    }
  };

  // Handler para volver desde el calendario a selección de profesional
  const handleBackFromCalendar = () => {
    setShowCalendar(false);
  };

  // Handler para volver a Step 2
  const handleBackToStep2 = () => {
    setShowCalendar(false);
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

          <div className={classes.buttonGroup}>
            <button
              onClick={handleBackToStep2}
              className={classes.buttonSecondary}
            >
              ATRÁS
            </button>
            <button
              onClick={handleContinue}
              disabled={!employeeId || !serviceId}
              className={classes.buttonPrimary}
            >
              CONTINUAR
            </button>
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

        <div className={classes.buttonGroup}>
          <button
            onClick={handleBackFromCalendar}
            className={classes.buttonSecondary}
          >
            ATRÁS
          </button>
          <button
            onClick={onContinue}
            disabled={!selectedDate || !selectedTime}
            className={classes.buttonPrimary}
          >
            CONTINUAR
          </button>
        </div>
      </Stack>
    </motion.div>
  );
}
