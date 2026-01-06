'use client';

import { Box, Container, Stack, Text, Loader, Center } from '@mantine/core';
import {
  Header,
  Footer,
  ServiceBookingForm,
  DateTimeSelector,
  BookingConfirmationModal,
  FadeInSection,
  ImageCrossfade,
} from '@/presentation/components';
import { useState, useMemo } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  useServices,
  useEmployees,
  useCreateClient,
  useCreateBooking,
} from '@/presentation/hooks';
import { Client } from '@/domain/entities';
import type { ServiceEntity } from '@/infrastructure/http';
import classes from './page.module.css';
import dayjs from 'dayjs';

interface ServiceBookingData {
  servicio: string;
  profesional: string;
}

const MOCK_LOCATION = 'Mery García Office';
const ESTILISMO_CEJAS_CATEGORY_ID = '316f01a6-ef73-4b05-a322-8da598ba50aa';

export default function EstilismoCejasPage() {
  const [bookingData, setBookingData] = useState<ServiceBookingData | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const createClientMutation = useCreateClient();
  const createBookingMutation = useCreateBooking();

  const { data: services = [], isLoading: isLoadingServices } = useServices(
    ESTILISMO_CEJAS_CATEGORY_ID
  );

  const currentService = bookingData?.servicio
    ? (services.find((s) => s.id === bookingData.servicio) as
        | ServiceEntity
        | undefined)
    : null;

  const isLoadingService = isLoadingServices && !!bookingData?.servicio;

  const { data: employees = [] } = useEmployees(
    ESTILISMO_CEJAS_CATEGORY_ID,
    bookingData?.servicio || undefined
  );

  const currentEmployee = bookingData?.profesional
    ? employees.find((e) => e.id === bookingData.profesional)
    : null;

  const handleServiceSubmit = (data: ServiceBookingData) => {
    setBookingData(data);
    // Scroll automático hacia el calendario en mobile
    setTimeout(() => {
      const calendarElement = document.getElementById('calendar-anchor');
      if (calendarElement) {
        calendarElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    open();
  };

  const handleConfirmBooking = async (clientData: Client) => {
    if (!bookingData || !selectedDate || !selectedTime || !currentService)
      return;
    if (!bookingData.profesional) return;

    try {
      if (!clientData.dni) throw new Error('El DNI es requerido');

      const client = await createClientMutation.mutateAsync({
        fullName: `${clientData.name} ${clientData.surname}`,
        email: clientData.email,
        phone: clientData.mobile,
        dni: clientData.dni,
      } as any);

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
      setBookingData(null);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error('Error al crear reserva:', error);
    }
  };

  const serviceForModal = useMemo(() => {
    if (!currentService) return null;
    return {
      id: currentService.id,
      name: currentService.name,
      slug: currentService.name.toLowerCase().replace(/\s+/g, '-'),
      price: Number(currentService.price),
      priceBook: Number(currentService.price),
      duration: currentService.duration,
      image: currentService.urlImage || '/desk.svg',
    };
  }, [currentService]);

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
        <Box className={classes.heroSection}>
          <ImageCrossfade
            images={[
              '/images/estilismo-cejas.webp',
              '/images/nano-scallping.webp',
              '/images/im.2-op-2-scaled-1.webp',
            ]}
            interval={6000}
            transitionDuration={1.0}
            className={classes.heroImage}
            alt="Estilismo de Cejas"
            objectPosition="center"
          />
          <Box className={classes.heroOverlay} />
          <Box className={classes.heroContent}>
            <FadeInSection direction="up" delay={0.2}>
              <Text className={classes.heroOverline}>MERY GARCÍA</Text>
              <Text className={classes.heroTitle}>
                ESTILISMO DE
                <br />
                CEJAS
              </Text>
            </FadeInSection>
          </Box>
          <span className={classes.heroNumber}>01</span>
        </Box>

        <Box className={classes.contentSection}>
          <Container size="xl" py={{ base: 40, sm: 60, md: 80 }}>
            <Stack gap="xl" align="center">
              <FadeInSection direction="up" delay={0.3}>
                <Box maw={1100} w="100%">
                  <Text
                    ta="center"
                    size="sm"
                    c="dimmed"
                    fw={300}
                    className={classes.descriptiveText}
                  >
                    Si es tu primera vez podés conocer todos nuestros servicios
                    ingresando{' '}
                    <Text
                      component="a"
                      href="https://merygarcia.com.ar/"
                      c="pink.6"
                      fw={400}
                      className={classes.linkText}
                    >
                      AQUÍ
                    </Text>
                    .
                  </Text>
                </Box>
              </FadeInSection>

              <Box w="100%" maw={1200}>
                <Box className={classes.formLayout}>
                  <Box className={classes.formColumn}>
                    <ServiceBookingForm
                      onSubmit={handleServiceSubmit}
                      onChange={handleServiceSubmit}
                      categoryId={ESTILISMO_CEJAS_CATEGORY_ID}
                      employeeFilter={(employee) =>
                        employee.fullName
                          .toLowerCase()
                          .includes('rosario staff') ||
                        employee.fullName.toLowerCase() === 'rosario staff'
                      }
                    />
                  </Box>

                  <Box id="calendar-anchor" className={classes.calendarColumn}>
                    {isLoadingService ? (
                      <Center py="xl" h={400}>
                        <Loader size="md" color="var(--mg-pink)" />
                      </Center>
                    ) : currentService ? (
                      <DateTimeSelector
                        serviceDuration={currentService.duration}
                        employeeId={bookingData?.profesional || null}
                        serviceId={currentService.id}
                        onSelectDateTime={handleDateTimeSelect}
                        onBack={() => {}}
                        showBackButton={false}
                      />
                    ) : (
                      <Box className={classes.infoBox}>
                        <Text
                          fw={600}
                          size="sm"
                          mb={8}
                          style={{ color: 'var(--mg-pink)' }}
                        >
                          INFORMACIÓN
                        </Text>
                        <Text size="sm" style={{ color: 'var(--mg-gray)' }}>
                          Por favor, seleccioná un servicio y profesional arriba
                          para ver la disponibilidad.
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />

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
