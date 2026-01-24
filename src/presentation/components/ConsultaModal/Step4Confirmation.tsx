'use client';

import { useState } from 'react';
import { Box, Text, Button } from '@mantine/core';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { BookingConfirmationModal } from '@/presentation/components';
import { useCreateClient } from '@/presentation/hooks/useClients';
import { useCreateBooking } from '@/presentation/hooks/useBookings';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Client } from '@/domain/entities/Client';
import classes from './ConsultaModal.module.css';

dayjs.locale('es');

interface Step4ConfirmationProps {
  serviceName: string;
  consultaOption: ServiceOption;
  staffConsultasId: string;
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function Step4Confirmation({
  serviceName,
  consultaOption,
  staffConsultasId,
  selectedDate,
  selectedTime,
  onBack,
  onSuccess,
}: Step4ConfirmationProps) {
  const [confirmationModalOpened, setConfirmationModalOpened] = useState(false);
  const createClientMutation = useCreateClient();
  const createBookingMutation = useCreateBooking();

  const formattedDate = dayjs(selectedDate).format("dddd D [de] MMMM, YYYY");

  const handleConfirmBooking = async (clientData: Client) => {
    try {
      // Create client
      const clientResponse = await createClientMutation.mutateAsync({
        fullName: `${clientData.name} ${clientData.surname}`,
        email: clientData.email,
        phone: clientData.mobile,
        dni: clientData.dni,
      });

      // Create booking
      await createBookingMutation.mutateAsync({
        clientId: clientResponse.id,
        employeeId: staffConsultasId,
        serviceId: consultaOption.serviceId!,
        date: dayjs(selectedDate).format('YYYY-MM-DD'),
        startTime: selectedTime,
        quantity: 1,
        paid: false,
        notes: clientData.notes,
      });

      setConfirmationModalOpened(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating consultation booking:', error);
    }
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
          <Text className={classes.summaryValue}>Staff Consultas</Text>
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
          <Text className={classes.summaryLabel}>Precio:</Text>
          <Text className={classes.summaryPrice}>
            {consultaOption.priceValue}
          </Text>
        </div>
      </div>

      <div className={classes.buttonGroup}>
        <button onClick={onBack} className={classes.buttonSecondary}>
          ATRÁS
        </button>
        <button
          onClick={() => setConfirmationModalOpened(true)}
          className={classes.buttonPrimary}
        >
          CONFIRMAR CONSULTA
        </button>
      </div>

      <BookingConfirmationModal
        opened={confirmationModalOpened}
        onClose={() => setConfirmationModalOpened(false)}
        service={{
          id: consultaOption.serviceId || '',
          name: serviceName,
          slug: serviceName.toLowerCase().replace(/\s+/g, '-'),
          price: 50000,
          priceBook: 50000,
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
        onConfirm={handleConfirmBooking}
      />
    </Box>
  );
}
