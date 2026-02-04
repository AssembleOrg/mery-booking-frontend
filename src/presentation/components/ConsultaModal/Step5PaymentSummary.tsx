'use client';

import { useState, useMemo, useEffect } from 'react';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCreditCard, IconCheck } from '@tabler/icons-react';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee } from '@/infrastructure/http/employeeService';
import type { ServiceEntity } from '@/infrastructure/http/serviceService';
import classes from './ConsultaModal.module.css';

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
  selectedOption: ServiceOption;
  selectedDate: Date;
  selectedTime: string;
  clientData: ClientData;
  employees: Employee[];
  services: ServiceEntity[];
  staffConsultasId?: string;
  onBack: () => void;
}

export function Step5PaymentSummary({
  serviceName,
  selectedOption,
  selectedDate,
  selectedTime,
  clientData,
  employees,
  services,
  staffConsultasId,
  onBack,
}: Step5PaymentSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Para consultas, siempre usar staffConsultasId
  const employeeId = selectedOption.employeeId || staffConsultasId;

  const employee = employees.find((e) => e.id === employeeId);
  const service = services.find((s) => s.id === selectedOption.serviceId);

  useEffect(() => {
    console.log('[ConsultaModal Step5] Componente montado');
    console.log('[ConsultaModal Step5] Props recibidas:', {
      serviceName,
      selectedOption: {
        label: selectedOption.label,
        serviceId: selectedOption.serviceId,
        employeeId: selectedOption.employeeId,
        contentType: selectedOption.contentType,
      },
      selectedDate: selectedDate.toISOString(),
      selectedTime,
      clientData,
      employeesCount: employees.length,
      servicesCount: services.length,
      staffConsultasId,
    });
    console.log('[ConsultaModal Step5] Validación de datos:', {
      employeeIdCalculado: employeeId,
      employeeEncontrado: !!employee,
      employeeName: employee?.fullName || 'NO ENCONTRADO',
      serviceEncontrado: !!service,
      serviceName: service?.name || 'NO ENCONTRADO',
    });
  }, []);

  // Calcular depósito (misma lógica que BookingConfirmationModal)
  const calculateDeposit = (serviceData: ServiceEntity): number => {
    const price = Number(serviceData.price);
    const duration = serviceData.duration;

    // Consultas (≤60min, $50.000): 100% del precio
    if (duration <= 60 && price === 50000) {
      return price;
    }

    // Servicios largos (≥120min): AR$ 150.000
    let standardDeposit = 150000;
    if (duration >= 120) {
      // Si el precio total es menor que el depósito estándar, cobrar 100% del precio
      return Math.min(price, standardDeposit);
    }

    // Servicios cortos (<120min): AR$ 100.000
    standardDeposit = 100000;
    // Si el precio total es menor que el depósito estándar, cobrar 100% del precio
    return Math.min(price, standardDeposit);
  };

  const depositAmount = service ? calculateDeposit(service) : 0;
  const totalPrice = service ? Number(service.price) : 0;
  const remainingAmount = totalPrice - depositAmount;

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
    console.log('[ConsultaModal Step5] handlePayment iniciado');
    console.log('[ConsultaModal Step5] Validación previa:', {
      service: !!service,
      employeeId: !!employeeId,
    });

    if (!service || !employeeId) {
      console.error('[ConsultaModal Step5] ERROR: Faltan datos críticos', {
        service: !!service,
        employeeId: !!employeeId,
      });
      return;
    }

    setIsProcessing(true);
    console.log('[ConsultaModal Step5] Estado isProcessing = true');

    try {
      // Formatear fecha para el backend
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const payload = {
        serviceName: service.name,
        servicePrice: totalPrice,
        serviceDuration: service.duration,
        depositAmount: depositAmount,
        clientData: {
          fullName: `${clientData.name} ${clientData.surname}`,
          email: clientData.email,
          phone: clientData.mobile,
          dni: clientData.dni,
          notes: clientData.notes,
        },
        bookingData: {
          employeeId: employeeId,
          serviceId: service.id,
          date: dateStr,
          startTime: selectedTime,
        },
      };

      console.log('[ConsultaModal Step5] Payload a enviar a API:', payload);
      console.log(
        '[ConsultaModal Step5] Iniciando llamada a /api/create-preference...'
      );

      // Crear preferencia de pago
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[ConsultaModal Step5] Respuesta recibida:', {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          'Error al crear la preferencia de pago';

        console.error('[ConsultaModal Step5] ERROR en respuesta:', {
          status: response.status,
          error: errorData,
        });

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
      console.log(
        '[ConsultaModal Step5] Datos de MercadoPago recibidos:',
        data
      );

      // Redirigir a MercadoPago
      // En producción usar init_point, en desarrollo sandbox_init_point
      const checkoutUrl = data.sandbox_init_point || data.init_point;

      console.log('[ConsultaModal Step5] URL de checkout:', checkoutUrl);

      if (checkoutUrl) {
        console.log('[ConsultaModal Step5] Redirigiendo a MercadoPago...');
        window.location.href = checkoutUrl;
      } else {
        console.error(
          '[ConsultaModal Step5] ERROR: No se recibió URL de pago en la respuesta'
        );
        notifications.show({
          title: 'Error',
          message: 'No se recibió URL de pago. Intenta nuevamente.',
          color: 'red',
          autoClose: 5000,
        });
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('[ConsultaModal Step5] ERROR al procesar el pago:', error);
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

  if (!service || !employee) {
    console.error(
      '[ConsultaModal Step5] ERROR: Componente no puede renderizar',
      {
        service: !!service,
        serviceId: selectedOption.serviceId,
        employee: !!employee,
        employeeId: employeeId,
        availableServices: services.map((s) => ({ id: s.id, name: s.name })),
        availableEmployees: employees.map((e) => ({
          id: e.id,
          name: e.fullName,
        })),
      }
    );
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h3>Error: No se pueden cargar los datos del servicio o profesional</h3>
        <p>Service encontrado: {service ? 'Sí' : 'No'}</p>
        <p>Employee encontrado: {employee ? 'Sí' : 'No'}</p>
        <p>Ver consola para más detalles</p>
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
          Resumen de tu Consulta
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
                  {employee.fullName}
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

        {/* Desglose de Precios */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={600} size="md">
              Desglose de Precios
            </Text>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Precio base:
              </Text>
              <Text size="sm" fw={500}>
                AR$ {totalPrice.toLocaleString('es-AR')}
              </Text>
            </Group>

            <Divider />

            <Group justify="space-between">
              <Text size="md" fw={600}>
                Depósito (Pagar ahora):
              </Text>
              <Text size="md" fw={700} c="pink.5">
                AR$ {depositAmount.toLocaleString('es-AR')}
              </Text>
            </Group>

            {remainingAmount > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  A pagar en consulta:
                </Text>
                <Text size="sm" fw={500}>
                  AR$ {remainingAmount.toLocaleString('es-AR')}
                </Text>
              </Group>
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
            {isProcessing ? 'Procesando...' : 'Pagar con MercadoPago'}
          </Button>
        </Group>
      </Stack>
    </motion.div>
  );
}
