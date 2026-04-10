'use client';

import { useState } from 'react';
import { Stack, Text, Alert, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BookingService } from '@/infrastructure/http';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import classes from './RescheduleConfirmStep.module.css';

dayjs.locale('es');

export interface RescheduleData {
  bookingCode: string;
  dni: string;
  originalPrice: number;
  paidStatus: string; // 'PAID' | 'UNPAID' | 'PARTIALLY_PAID'
  originalServiceName: string;
  clientName: string;
}

interface RescheduleConfirmStepProps {
  rescheduleData: RescheduleData;
  newServiceName: string;
  newServicePrice: number;
  newServiceId: string;
  newEmployeeName: string;
  newEmployeeId: string;
  newDate: Date;
  newTime: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function RescheduleConfirmStep({
  rescheduleData,
  newServiceName,
  newServicePrice,
  newServiceId,
  newEmployeeName,
  newEmployeeId,
  newDate,
  newTime,
  onSuccess,
  onBack,
}: RescheduleConfirmStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isPaid = rescheduleData.paidStatus === 'PAID';
  const priceDiff = newServicePrice - rescheduleData.originalPrice;
  const hasPriceDiff = isPaid && Math.abs(priceDiff) > 0;

  const formattedDate = dayjs(newDate)
    .locale('es')
    .format('dddd D [de] MMMM');

  const formatPrice = (n: number) =>
    `$${Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await BookingService.reschedulePublic(rescheduleData.bookingCode, {
        date: dayjs(newDate).format('YYYY-MM-DD'),
        startTime: newTime,
        employeeId: newEmployeeId,
        serviceId: newServiceId,
        dni: rescheduleData.dni,
      });
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Error al reagendar la reserva';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={classes.successBox}>
        <div className={classes.successIcon}>✓</div>
        <Text className={classes.successTitle}>Reserva actualizada</Text>
        <Text className={classes.successText}>
          Tu turno fue reagendado correctamente. Te llega un email y un WhatsApp
          con los nuevos datos en los próximos minutos.
        </Text>
      </div>
    );
  }

  return (
    <Stack gap="lg">
      <div className={classes.header}>
        <Text className={classes.title}>Confirmar cambio</Text>
        <Text className={classes.subtitle}>
          Revisá los datos antes de confirmar.
        </Text>
      </div>

      <div className={classes.summaryCard}>
        <div className={classes.row}>
          <span className={classes.label}>Cliente</span>
          <span className={classes.value}>{rescheduleData.clientName}</span>
        </div>
        <div className={classes.row}>
          <span className={classes.label}>Servicio</span>
          <span className={classes.value}>{newServiceName}</span>
        </div>
        <div className={classes.row}>
          <span className={classes.label}>Profesional</span>
          <span className={classes.value}>{newEmployeeName}</span>
        </div>
        <div className={classes.row}>
          <span className={classes.label}>Fecha</span>
          <span className={classes.value} style={{ textTransform: 'capitalize' }}>
            {formattedDate}
          </span>
        </div>
        <div className={classes.row}>
          <span className={classes.label}>Horario</span>
          <span className={classes.value}>{newTime} hs</span>
        </div>
      </div>

      {hasPriceDiff && priceDiff > 0 && (
        <Alert color="yellow" variant="light" className={classes.alert}>
          <Text size="sm" fw={600}>
            Diferencia a abonar en el local
          </Text>
          <Text size="sm">
            El servicio <strong>{newServiceName}</strong> tiene un valor mayor al
            original (<strong>{rescheduleData.originalServiceName}</strong>).
            Vas a tener que abonar la diferencia de{' '}
            <strong>{formatPrice(priceDiff)}</strong> al momento de tu turno.
          </Text>
        </Alert>
      )}

      {hasPriceDiff && priceDiff < 0 && (
        <Alert color="blue" variant="light" className={classes.alert}>
          <Text size="sm" fw={600}>
            Diferencia a tu favor
          </Text>
          <Text size="sm">
            El servicio nuevo cuesta menos que el original. La diferencia de{' '}
            <strong>{formatPrice(priceDiff)}</strong> se resuelve directamente en
            el local.
          </Text>
        </Alert>
      )}

      <div className={classes.buttonGroup}>
        <button
          type="button"
          className={classes.buttonSecondary}
          onClick={onBack}
          disabled={isSubmitting}
        >
          ATRÁS
        </button>
        <button
          type="button"
          className={classes.buttonPrimary}
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader size="xs" color="white" /> CONFIRMANDO...
            </>
          ) : (
            'CONFIRMAR CAMBIO'
          )}
        </button>
      </div>
    </Stack>
  );
}
