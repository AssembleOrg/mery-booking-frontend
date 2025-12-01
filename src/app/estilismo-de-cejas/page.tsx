'use client';

import { Box, Container, Stack, Text } from '@mantine/core';
import {
  Header,
  Footer,
  ServiceBookingForm,
  DateTimeSelector,
  BookingConfirmationModal,
} from '@/presentation/components';
import Image from 'next/image';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { MOCK_SERVICES, MOCK_PROFESSIONALS, MOCK_LOCATION } from '@/infrastructure/data/mockData';
import { Service, Professional, Client, BuyIntention } from '@/domain/entities';
import classes from './page.module.css';

interface ServiceBookingData {
  servicio: string;
  profesional: string;
}

export default function EstilismoCejasPage() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<ServiceBookingData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleServiceSubmit = (data: ServiceBookingData) => {
    setBookingData(data);
    setStep(2);
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    open(); // Abrir modal de confirmación
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirmBooking = (client: Client) => {
    if (!bookingData || !selectedDate || !selectedTime) return;

    // Obtener servicio y profesional de los datos mock
    const service = MOCK_SERVICES.find((s) => s.id === bookingData.servicio);
    const professional = bookingData.profesional
      ? MOCK_PROFESSIONALS.find((p) => p.id === bookingData.profesional)
      : null;

    if (!service) return;

    const buyIntention: BuyIntention = {
      professional: professional?.id || '',
      date: selectedDate.toISOString(),
      time: selectedTime,
      location: MOCK_LOCATION,
      client,
      service: service.id,
      price: service.priceBook,
      deposit: Math.round(service.priceBook * 0.8),
    };

    console.log('Buy Intention:', buyIntention);
    
    close();
    alert('¡Reserva confirmada! Los datos se han guardado en la consola.');
    
    // Aquí irá la llamada al backend
    // await createBooking(buyIntention);
  };

  // Obtener servicio y profesional actuales para el modal
  const currentService = bookingData
    ? MOCK_SERVICES.find((s) => s.id === bookingData.servicio)
    : null;
  const currentProfessional = bookingData?.profesional
    ? MOCK_PROFESSIONALS.find((p) => p.id === bookingData.profesional)
    : null;

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
                  {step === 2 && currentService && (
                    <Box className={classes.calendarColumn}>
                      <DateTimeSelector
                        serviceDuration={currentService.duration}
                        onSelectDateTime={handleDateTimeSelect}
                        onBack={handleBack}
                        showBackButton={true}
                      />
                    </Box>
                  )}

                  {/* Paso 1: Formulario de servicio - Derecha en Desktop */}
                  <Box 
                    className={`${classes.formColumn} ${step === 2 ? classes.hiddenOnMobile : ''}`}
                  >
                    <ServiceBookingForm onSubmit={handleServiceSubmit} />
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />

      {/* Modal de Confirmación */}
      {currentService && selectedDate && selectedTime && (
        <BookingConfirmationModal
          opened={opened}
          onClose={close}
          service={currentService}
          professional={currentProfessional || null}
          date={selectedDate}
          time={selectedTime}
          location={MOCK_LOCATION}
          onConfirm={handleConfirmBooking}
        />
      )}
    </>
  );
}

