'use client';

import { Box, Text } from '@mantine/core';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { BookingConfirmationModal } from '@/presentation/components';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Client } from '@/domain/entities/Client';
import classes from './ConsultaModal.module.css';

dayjs.locale('es');

interface Step4ConfirmationProps {
  serviceName: string;
  consultaOption: ServiceOption;
  staffConsultasId: string;
  professionalName?: string;
  selectedDate: Date;
  selectedTime: string;
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

export default function Step4Confirmation({
  serviceName,
  consultaOption,
  staffConsultasId,
  professionalName,
  selectedDate,
  selectedTime,
  confirmationModalOpened,
  onConfirmationModalClose,
  onClientDataCollected,
}: Step4ConfirmationProps) {

  const formattedDate = dayjs(selectedDate).format("dddd D [de] MMMM, YYYY");

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

  return (
    <Box className={classes.stepContainer}>
      <Text className={classes.stepTitle}>Confirma tu consulta</Text>

      <div className={classes.summaryCard}>
        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Servicio:</Text>
          <Text className={classes.summaryValue}>{serviceName}</Text>
        </div>

        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Tipo de consulta:</Text>
          <Text className={classes.summaryValue}>{consultaOption.label}</Text>
        </div>

        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Profesional:</Text>
          <Text className={classes.summaryValue}>{professionalName || 'Staff Consultas'}</Text>
        </div>

        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Fecha:</Text>
          <Text className={classes.summaryValue}>{formattedDate}</Text>
        </div>

        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Hora:</Text>
          <Text className={classes.summaryValue}>{selectedTime}</Text>
        </div>

        <div className={classes.summaryRow}>
          <Text className={classes.summaryLabel}>Valor de la seña:</Text>
          <Text className={classes.summaryPrice}>
            {consultaOption.servicePrice !== undefined
              ? `AR$ ${consultaOption.servicePrice.toLocaleString('es-AR')}.-`
              : consultaOption.priceValue}
          </Text>
        </div>
      </div>

      <BookingConfirmationModal
        opened={confirmationModalOpened}
        onClose={onConfirmationModalClose}
        service={{
          id: consultaOption.serviceId || '',
          name: serviceName,
          slug: serviceName.toLowerCase().replace(/\s+/g, '-'),
          price: consultaOption.servicePrice || 50000,
          priceBook: consultaOption.servicePrice || 50000,
          duration: consultaOption.serviceDuration || 60,
          image: '/desk.svg',
        }}
        professional={{
          id: staffConsultasId,
          name: 'Staff Consultas',
          available: true,
          services: [],
        }}
        date={selectedDate}
        time={selectedTime}
        location="Mery García Office"
        onConfirm={handleCollectData}
      />
    </Box>
  );
}
