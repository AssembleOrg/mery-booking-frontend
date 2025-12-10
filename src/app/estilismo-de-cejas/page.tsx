'use client';

import { Box, Container, Stack, Text, Loader, Center } from '@mantine/core';
import {
  Header,
  Footer,
  ServiceBookingForm,
  DateTimeSelector,
  BookingConfirmationModal,
} from '@/presentation/components';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useServices, useEmployees, useCreateClient, useCreateBooking } from '@/presentation/hooks';
import { Client } from '@/domain/entities';
import type { ServiceEntity } from '@/infrastructure/http';
import classes from './page.module.css';
import dayjs from 'dayjs';

interface ServiceBookingData {
  servicio: string;
  profesional: string;
}

const MOCK_LOCATION = 'Mery García Office';
// ID de la categoría "Estilismo de Cejas y Pestañas"
const ESTILISMO_CEJAS_CATEGORY_ID = '316f01a6-ef73-4b05-a322-8da598ba50aa';

export default function EstilismoCejasPage() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<ServiceBookingData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // Hooks para crear cliente y reserva
  const createClientMutation = useCreateClient();
  const createBookingMutation = useCreateBooking();

  // Cargar lista de servicios para buscar el servicio seleccionado
  const { data: services = [], isLoading: isLoadingServices } = useServices(ESTILISMO_CEJAS_CATEGORY_ID);
  
  // Buscar el servicio seleccionado en la lista ya cargada
  const currentService = bookingData?.servicio 
    ? (services.find(s => s.id === bookingData.servicio) as ServiceEntity | undefined)
    : null;
  
  // Solo mostrar loading si estamos cargando servicios Y hay un servicio seleccionado
  const isLoadingService = isLoadingServices && !!bookingData?.servicio;
  
  // Cargar lista de empleados para buscar el empleado seleccionado
  const { data: employees = [] } = useEmployees(ESTILISMO_CEJAS_CATEGORY_ID, bookingData?.servicio || undefined);
  
  // Buscar el empleado seleccionado en la lista ya cargada
  const currentEmployee = bookingData?.profesional 
    ? employees.find(e => e.id === bookingData.profesional)
    : null;

  const handleServiceSubmit = (data: ServiceBookingData) => {
    setBookingData(data);
    // No cambiar a step 2 inmediatamente, esperar a que se cargue el servicio
    // El step 2 se mostrará cuando currentService esté disponible
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    open(); // Abrir modal de confirmación
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirmBooking = async (clientData: Client) => {
    if (!bookingData || !selectedDate || !selectedTime || !currentService) return;

    // Validar que haya un empleado seleccionado
    if (!bookingData.profesional) {
      // Si no hay empleado seleccionado, no podemos crear la reserva
      // Esto no debería pasar porque DateTimeSelector requiere employeeId
      return;
    }

    try {
      // 1. Crear cliente primero (usando endpoint público si no está autenticado)
      // El DNI es requerido en el formulario, así que siempre debería estar presente
      if (!clientData.dni) {
        throw new Error('El DNI es requerido para completar la reserva');
      }
      
      const client = await createClientMutation.mutateAsync({
        fullName: `${clientData.name} ${clientData.surname}`,
        email: clientData.email,
        phone: clientData.mobile,
        dni: clientData.dni,
      } as any);

      // 2. Crear reserva
      const dateString = dayjs(selectedDate).format('YYYY-MM-DD');
      await createBookingMutation.mutateAsync({
        clientId: client.id,
        employeeId: bookingData.profesional,
        serviceId: currentService.id,
        date: dateString,
        startTime: selectedTime,
        quantity: 1,
        paid: false,
        notes: clientData.notes,
      });

      close();
      
      // Resetear estado
      setStep(1);
      setBookingData(null);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      // Los errores ya se manejan en los hooks con notificaciones
      console.error('Error al crear reserva:', error);
    }
  };

  // Transformar ServiceEntity a Service para el modal (compatibilidad)
  const serviceForModal = useMemo(() => {
    if (!currentService) return null;
    return {
      id: currentService.id,
      name: currentService.name,
      slug: currentService.name.toLowerCase().replace(/\s+/g, '-'),
      price: Number(currentService.price),
      priceBook: Number(currentService.price), // Usar el mismo precio por ahora
      duration: currentService.duration,
      image: currentService.urlImage || '/desk.svg',
    };
  }, [currentService]);

  // Transformar Employee a Professional para el modal (compatibilidad)
  const professionalForModal = useMemo(() => {
    if (!currentEmployee) return null;
    return {
      id: currentEmployee.id,
      name: currentEmployee.fullName,
      available: true,
      services: [],
    };
  }, [currentEmployee]);

  return (
    <>
      <Header />
      
      <Box className={classes.pageWrapper}>
        {/* Hero Section con imagen de fondo */}
        <Box className={classes.heroSection}>
          <Image
            src="/images/estilismo-cejas.webp"
            alt="Estilismo de Cejas"
            fill
            priority
            className={classes.heroImage}
            quality={90}
          />
          <Box className={classes.heroOverlay} />
          <Container size="xl" className={classes.heroContent}>
            <Text className={classes.heroTitle}>
              ESTILISMO DE CEJAS
            </Text>
          </Container>
        </Box>

        {/* Content Section */}
        <Box className={classes.contentSection}>
          <Container size="xl" py={{ base: 40, sm: 60, md: 80 }}>
            <Stack gap="xl" align="center">
              {/* Texto descriptivo */}
              <Box maw={1100} w="100%">
                <Text
                  ta="center"
                  size="sm"
                  c="dimmed"
                  fw={300}
                  className={classes.descriptiveText}
                >
                  Si es tu primera vez podés conocer todos nuestros servicios ingresando{' '}
                  <Text
                    component="a"
                    href="#"
                    c="pink.6"
                    fw={400}
                    className={classes.linkText}
                  >
                    AQUÍ
                  </Text>
                  . Te recomendamos en tu primera cita que reserves Asesoramiento de Estilismo de Cejas.
                  Para Microblading / Tattoo Cosmético deberás tomar una cita de Consulta, las cuales se
                  abren de acuerdo a la disponibilidad de agenda.
                </Text>
              </Box>

              {/* Layout Desktop: Calendario a la izquierda, Form a la derecha */}
              <Box w="100%" maw={1100}>
                <Box className={classes.formLayout}>
                  {/* Paso 2: Selector de fecha y hora - Izquierda en Desktop */}
                  {/* Mostrar cuando hay bookingData y el servicio está cargado */}
                  {bookingData?.servicio && (
                    <>
                      {isLoadingService ? (
                        <Box className={classes.calendarColumn}>
                          <Center py="xl">
                            <Loader size="md" />
                          </Center>
                        </Box>
                      ) : currentService ? (
                        <Box className={classes.calendarColumn}>
                          <DateTimeSelector
                            serviceDuration={currentService.duration}
                            employeeId={bookingData?.profesional || null}
                            serviceId={currentService.id}
                            onSelectDateTime={handleDateTimeSelect}
                            onBack={handleBack}
                            showBackButton={true}
                          />
                        </Box>
                      ) : null}
                    </>
                  )}

                  {/* Paso 1: Formulario de servicio - Derecha en Desktop */}
                  {/* Ocultar en mobile solo si hay servicio seleccionado y cargado */}
                  <Box 
                    className={`${classes.formColumn} ${bookingData?.servicio && currentService ? classes.hiddenOnMobile : ''}`}
                  >
                    <ServiceBookingForm 
                      onSubmit={handleServiceSubmit}
                      onChange={handleServiceSubmit}
                      categoryId={ESTILISMO_CEJAS_CATEGORY_ID}
                      employeeFilter={(employee) => 
                        employee.fullName.toLowerCase().includes('rosario staff') ||
                        employee.fullName.toLowerCase() === 'rosario staff'
                      }
                    />
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />

      {/* Modal de Confirmación */}
      {serviceForModal && selectedDate && selectedTime && (
        <BookingConfirmationModal
          opened={opened}
          onClose={close}
          service={serviceForModal}
          professional={professionalForModal || null}
          date={selectedDate}
          time={selectedTime}
          location={MOCK_LOCATION}
          onConfirm={handleConfirmBooking}
        />
      )}
    </>
  );
}

