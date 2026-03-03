'use client';

import { useMemo } from 'react';
import { Box, Text } from '@mantine/core';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { BookingConfirmationModal } from '@/presentation/components';
import { Client } from '@/domain/entities';
import classes from './ReservaModal.module.css';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee } from '@/infrastructure/http/employeeService';
import type { ServiceEntity } from '@/infrastructure/http/serviceService';

dayjs.locale('es');

const MOCK_LOCATION = 'Mery García Office';

interface Step4ConfirmationProps {
  serviceName: string;
  selectedOption: ServiceOption;
  selectedDate: Date;
  selectedTime: string;
  employees: Employee[];
  services: ServiceEntity[];
  staffConsultasId?: string;
  meryGarciaId?: string;
  selectedEmployeeId?: string;
  confirmationModalOpened: boolean;
  onConfirmationModalClose: () => void;
  onClientDataCollected: (data: {
    name: string;
    surname: string;
    email: string;
    mobile: string;
    dni: string;
    notes?: string;
  }) => void;
}

export function Step4Confirmation({
  serviceName,
  selectedOption,
  selectedDate,
  selectedTime,
  employees,
  services,
  staffConsultasId,
  meryGarciaId,
  selectedEmployeeId,
  confirmationModalOpened,
  onConfirmationModalClose,
  onClientDataCollected,
}: Step4ConfirmationProps) {
  // Priorizar selectedEmployeeId de la página, luego selectedOption.employeeId, luego fallbacks
  const employeeId = selectedEmployeeId ||
                     selectedOption.employeeId ||
                     (selectedOption.contentType === 'consulta-sin-trabajo' ||
                      selectedOption.contentType === 'consulta-con-trabajo'
                       ? staffConsultasId
                       : meryGarciaId);

  const employee = employees.find(e => e.id === employeeId);
  const service = services.find(s => s.id === selectedOption.serviceId);

  // Transformar ServiceEntity a Service domain entity
  const serviceForModal = useMemo(() => {
    if (!service) return null;
    return {
      id: service.id,
      name: service.name,
      slug: service.name.toLowerCase().replace(/\s+/g, '-'),
      price: Number(service.price),
      priceBook: Number(service.price),
      duration: service.duration,
      image: service.urlImage || '/desk.svg',
    };
  }, [service]);

  // Transformar Employee a Professional domain entity
  const professionalForModal = useMemo(() => {
    if (!employee) return null;
    return {
      id: employee.id,
      name: employee.fullName,
      available: true,
      services: [],
    };
  }, [employee]);

  const handleCollectData = async (clientData: Client) => {
    if (!clientData.dni) {
      return;
    }

    onClientDataCollected({
      name: clientData.name,
      surname: clientData.surname,
      email: clientData.email,
      mobile: clientData.mobile,
      dni: clientData.dni,
      notes: clientData.notes,
    });
  };

  const formattedDate = dayjs(selectedDate).format("dddd D [de] MMMM, YYYY");

  if (!serviceForModal) {
    return null;
  }

  return (
    <Box className={classes.stepContainer}>
      <Text className={classes.stepTitle}>Confirma tu reserva</Text>

      <div className={classes.summaryCard}>
        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Servicio:</Text>
          <Text className={classes.summaryValue}>{serviceName}</Text>
        </div>

        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Opción:</Text>
          <Text className={classes.summaryValue}>{selectedOption.label}</Text>
        </div>

        {employee && (
          <div className={classes.summaryRow}>
            <Text className={classes.summaryLabel}>Profesional:</Text>
            <Text className={classes.summaryValue}>{employee.fullName}</Text>
          </div>
        )}

        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Fecha:</Text>
          <Text className={classes.summaryValue}>{formattedDate}</Text>
        </div>

        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Hora:</Text>
          <Text className={classes.summaryValue}>{selectedTime}</Text>
        </div>

        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Seña (a pagar ahora):</Text>
          <Text className={classes.summaryPrice}>
            AR$ {service ? Number(service.price).toLocaleString('es-AR') : ''}
          </Text>
        </div>
      </div>

      <BookingConfirmationModal
        opened={confirmationModalOpened}
        onClose={onConfirmationModalClose}
        service={serviceForModal}
        professional={professionalForModal || null}
        date={selectedDate}
        time={selectedTime}
        location={MOCK_LOCATION}
        onConfirm={handleCollectData}
      />
    </Box>
  );
}
