'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Button,
  Divider,
  Image,
  Loader,
  Box,
  Checkbox,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCreditCard, IconCheck } from '@tabler/icons-react';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee } from '@/infrastructure/http/employeeService';
import type { ServiceEntity } from '@/infrastructure/http/serviceService';
import { EMPLOYEE_IDS, COMBO_TINTE_OFFER } from '@/config/constants';
import classes from './ReservaModal.module.css';

const MOCK_LOCATION = 'Mery García Office';

interface ClientData {
  name: string;
  surname: string;
  email: string;
  mobile: string;
  dni: string;
  notes?: string;
}

interface Step5PaymentSummaryProps {
  serviceName: string;
  serviceKey?: string;
  selectedOption: ServiceOption;
  selectedDate: Date;
  selectedTime: string;
  clientData: ClientData;
  employees: Employee[];
  services: ServiceEntity[];
  staffConsultasId?: string;
  meryGarciaId?: string;
  selectedEmployeeId?: string;
  informationalListPriceArs?: number;
  couponCode?: string;
  lmbInfo?: { lmbId: string; discountPercent: number };
  onBack: () => void;
}

export function Step5PaymentSummary({
  serviceName,
  serviceKey,
  selectedOption,
  selectedDate,
  selectedTime,
  clientData,
  employees,
  services,
  staffConsultasId,
  meryGarciaId,
  selectedEmployeeId,
  informationalListPriceArs,
  couponCode,
  lmbInfo,
  onBack,
}: Step5PaymentSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [includeTinteCombo, setIncludeTinteCombo] = useState(false);

  // Priorizar selectedEmployeeId de la página, luego selectedOption.employeeId, luego fallbacks
  const employeeId =
    selectedEmployeeId ||
    selectedOption.employeeId ||
    (selectedOption.contentType === 'consulta-sin-trabajo' ||
    selectedOption.contentType === 'consulta-con-trabajo'
      ? staffConsultasId
      : meryGarciaId);

  const employee = employees.find((e) => e.id === employeeId);
  const employeeName = employee?.fullName || 'Profesional asignado';
  const service = services.find((s) => s.id === selectedOption.serviceId);

  // La seña que cobramos online es SIEMPRE el precio full del servicio.
  // El descuento LMB es informativo: recepción ajusta el saldo al asistir al turno.
  const baseDepositAmount = service ? Number(service.price) : 0;
  const serviceDepositAmount = baseDepositAmount;
  // Solo informativo, para mostrar lo que se va a descontar en el local
  const lmbInformativeDiscount = lmbInfo
    ? Math.round(baseDepositAmount * (lmbInfo.discountPercent / 100))
    : 0;

  // Combo: ofrecer tinte de pestañas como addon SOLO si el profesional es Mery
  // y el servicio base NO es ya tinte de pestañas. LMB aplica solo al servicio
  // base; el tinte se cobra full.
  const isMeryProfessional = employeeId === EMPLOYEE_IDS.MERY_GARCIA;
  const isAlreadyTinteService = service?.id === COMBO_TINTE_OFFER.serviceId;
  const offerTinteCombo = isMeryProfessional && !isAlreadyTinteService;

  const addonAmount = offerTinteCombo && includeTinteCombo ? COMBO_TINTE_OFFER.price : 0;
  const depositAmount = serviceDepositAmount + addonAmount;

  const formattedDate = useMemo(() => {
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    const localDate = new Date(year, month, day);

    return localDate.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  const handlePayment = async () => {
    if (!service || !employeeId) {
      return;
    }

    setIsProcessing(true);

    try {
      // Formatear fecha para el backend
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const payload = {
        serviceName: service.name,
        servicePrice: depositAmount,
        serviceDuration: service.duration,
        depositAmount: depositAmount,
        clientData: {
          fullName: `${clientData.name} ${clientData.surname}`,
          email: clientData.email,
          phone: clientData.mobile,
          dni: clientData.dni,
          notes: clientData.notes,
          couponCode: couponCode || undefined,
          addonServiceId: includeTinteCombo ? COMBO_TINTE_OFFER.serviceId : undefined,
          addonPrice: includeTinteCombo ? COMBO_TINTE_OFFER.price : undefined,
        },
        bookingData: {
          employeeId: employeeId,
          serviceId: service.id,
          date: dateStr,
          startTime: selectedTime,
        },
      };

      // Crear preferencia de pago
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          'Error al crear la preferencia de pago';

        // Manejar error 409 (slot ya ocupado)
        if (response.status === 409) {
          notifications.show({
            title: 'Turno no disponible',
            message:
              errorMessage ||
              'Este horario fue reservado por otra persona. Por favor, selecciona otro turno.',
            color: 'orange',
            autoClose: 5000,
          });
          setIsProcessing(false);
          // Opcional: Volver al paso anterior para seleccionar otro turno
          // onBack();
          return;
        }

        // Otros errores
        notifications.show({
          title: 'Error',
          message: errorMessage,
          color: 'red',
          autoClose: 5000,
        });
        setIsProcessing(false);
        return;
      }

      const data = await response.json();

      // Redirigir a MercadoPago
      const checkoutUrl = data.init_point;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        notifications.show({
          title: 'Error',
          message: 'No se recibió URL de pago. Intenta nuevamente.',
          color: 'red',
          autoClose: 5000,
        });
        setIsProcessing(false);
      }
    } catch (error: any) {
      setIsProcessing(false);
      notifications.show({
        title: 'Error',
        message:
          error.message ||
          'Ocurrió un error al procesar el pago. Intenta nuevamente.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  if (!service || !employeeId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h3>Error: No se pueden cargar los datos del servicio o profesional</h3>
        <Button onClick={onBack}>Volver</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={classes.stepContent}
    >
      <Stack gap="xl">
        <Title order={2} ta="center">
          Resumen de tu Reserva
        </Title>

        {/* Servicio */}
        <Paper p="lg" radius="md" withBorder>
          <Group gap="md" align="flex-start">
            <Image
              src={service.urlImage || '/desk.svg'}
              alt={service.name}
              width={80}
              height={80}
              radius="md"
              fit="cover"
            />
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text fw={600} size="lg">
                {service.name}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Profesional:
                </Text>
                <Text size="sm" fw={500}>
                  {employeeName}
                </Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Fecha:
                </Text>
                <Text size="sm" fw={500}>
                  {formattedDate}
                </Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Hora:
                </Text>
                <Text size="sm" fw={500}>
                  {selectedTime} hs
                </Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Ubicación:
                </Text>
                <Text size="sm" fw={500}>
                  {MOCK_LOCATION}
                </Text>
              </Group>
            </Stack>
          </Group>
        </Paper>

        {/* Datos del Cliente */}
        <Paper p="lg" radius="md" bg="gray.0">
          <Stack gap="sm">
            <Text fw={600} size="md">
              Datos del Cliente
            </Text>
            <Group gap="xs">
              <IconCheck size={16} color="green" />
              <Text size="sm">
                {clientData.name} {clientData.surname}
              </Text>
            </Group>
            <Group gap="xs">
              <IconCheck size={16} color="green" />
              <Text size="sm">{clientData.email}</Text>
            </Group>
            <Group gap="xs">
              <IconCheck size={16} color="green" />
              <Text size="sm">{clientData.mobile}</Text>
            </Group>
            <Group gap="xs">
              <IconCheck size={16} color="green" />
              <Text size="sm">DNI: {clientData.dni}</Text>
            </Group>
          </Stack>
        </Paper>

        {/* Banner combo tinte (solo Mery + servicio !== tinte) */}
        {offerTinteCombo && (
          <Paper
            p="md"
            radius="md"
            style={{
              background: '#fbe8ea',
              border: '1px solid #660e1b',
            }}
          >
            <Group align="flex-start" gap="sm" wrap="nowrap">
              <Checkbox
                checked={includeTinteCombo}
                onChange={(e) => setIncludeTinteCombo(e.currentTarget.checked)}
                color="#660e1b"
                size="md"
                styles={{ root: { paddingTop: 2 } }}
              />
              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={700} style={{ color: '#660e1b' }}>
                  ¿Te gustaría agregar {COMBO_TINTE_OFFER.serviceName}?
                </Text>
                <Text size="xs" mt={2} style={{ color: '#660e1b' }}>
                  Sumá <strong>{COMBO_TINTE_OFFER.serviceName}</strong> a tu reserva
                  por <strong>AR$ {COMBO_TINTE_OFFER.price.toLocaleString('es-AR')}</strong>.
                  Se realiza en el mismo turno, sin demoras extra.
                </Text>
              </Box>
            </Group>
          </Paper>
        )}

        {/* Desglose de Precios */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={600} size="md">
              Desglose de Precios
            </Text>

            {typeof informationalListPriceArs === 'number' && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Precio de lista:
                </Text>
                <Text size="sm" fw={500}>
                  AR$ {informationalListPriceArs.toLocaleString('es-AR')}
                </Text>
              </Group>
            )}

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Seña del servicio:
              </Text>
              <Text size="sm" fw={500}>
                AR$ {baseDepositAmount.toLocaleString('es-AR')}
              </Text>
            </Group>

            {includeTinteCombo && (
              <Group justify="space-between">
                <Group gap={6}>
                  <Text size="sm">✨</Text>
                  <Text size="sm" fw={500} style={{ color: '#660e1b' }}>
                    + {COMBO_TINTE_OFFER.serviceName} (combo):
                  </Text>
                </Group>
                <Text size="sm" fw={600} style={{ color: '#660e1b' }}>
                  AR$ {COMBO_TINTE_OFFER.price.toLocaleString('es-AR')}
                </Text>
              </Group>
            )}

            <Group justify="space-between">
              <Text size="md" fw={600}>
                Total a pagar ahora:
              </Text>
              <Text
                size="md"
                fw={700}
                c={includeTinteCombo ? undefined : 'pink.5'}
                style={includeTinteCombo ? { color: '#660e1b' } : undefined}
              >
                AR$ {depositAmount.toLocaleString('es-AR')}
              </Text>
            </Group>

            {lmbInfo && (
              <Box
                style={{
                  background: '#fbe8ea',
                  border: '1px solid #660e1b',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginTop: 4,
                }}
              >
                <Group gap={6} mb={2}>
                  <Text size="sm">🔥</Text>
                  <Text size="sm" fw={700} style={{ color: '#660e1b' }}>
                    Last Minute Booking — {lmbInfo.discountPercent}% OFF
                  </Text>
                </Group>
                <Text size="xs" style={{ color: '#660e1b' }}>
                  Pagás la seña completa ahora (AR$ {baseDepositAmount.toLocaleString('es-AR')}). El descuento de
                  <strong> AR$ {lmbInformativeDiscount.toLocaleString('es-AR')}</strong> se ajusta en el local al asistir al turno.
                </Text>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Botones */}
        <Group gap="md" grow>
          <Button
            leftSection={<IconArrowLeft size={18} />}
            variant="default"
            onClick={onBack}
            disabled={isProcessing}
          >
            Volver
          </Button>
          <Button
            leftSection={
              isProcessing ? (
                <Loader size="xs" color="white" />
              ) : (
                <IconCreditCard size={18} />
              )
            }
            onClick={handlePayment}
            disabled={isProcessing}
            size="md"
          >
            {isProcessing ? 'Procesando...' : 'PAGAR'}
          </Button>
        </Group>
      </Stack>
    </motion.div>
  );
}
