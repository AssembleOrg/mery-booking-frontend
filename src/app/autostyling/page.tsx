'use client';

import { Box, Container, Stack, Text, Loader, Center } from '@mantine/core';
import {
  Header,
  Footer,
  ServiceBookingForm,
  DateTimeSelector,
  FadeInSection,
  ImageCrossfade,
} from '@/presentation/components';
import { EstilismoReservaModal } from '@/presentation/components/EstilismoReservaModal';
import { useState } from 'react';
import { useServices, useEmployees } from '@/presentation/hooks';
import type { ServiceEntity, Employee } from '@/infrastructure/http';
import classes from './page.module.css';
import { CATEGORY_IDS } from '@/config/constants';
import { formatArs, getEstilismoListPriceArs } from '@/config/estilismoPricing';

interface ServiceBookingData {
  servicio: string;
  profesional: string;
}

export default function AutostylingPage() {
  const [bookingData, setBookingData] = useState<ServiceBookingData | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [reservaModalOpened, setReservaModalOpened] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceEntity | null>(
    null
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const { data: services = [], isLoading: isLoadingServices } = useServices(
    CATEGORY_IDS.AUTOSTYLING
  );

  const currentService = bookingData?.servicio
    ? (services.find((s) => s.id === bookingData.servicio) as
        | ServiceEntity
        | undefined)
    : null;

  const isLoadingService = isLoadingServices && !!bookingData?.servicio;

  const { data: employees = [] } = useEmployees(
    bookingData?.servicio ? CATEGORY_IDS.AUTOSTYLING : undefined,
    bookingData?.servicio || undefined
  );

  const currentEmployee = bookingData?.profesional
    ? employees.find((e) => e.id === bookingData.profesional)
    : null;

  const informationalListPriceArs = currentService
    ? getEstilismoListPriceArs(currentService.name)
    : null;

  const handleServiceSubmit = (data: ServiceBookingData) => {
    setBookingData(data);

    if (data.servicio && data.profesional) {
      setTimeout(() => {
        const calendarElement = document.getElementById('calendar-anchor');
        if (calendarElement) {
          calendarElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);

    if (!currentService || !currentEmployee) return;

    setSelectedService(currentService);
    setSelectedEmployee(currentEmployee);

    setReservaModalOpened(true);
  };
  return (
    <>
      <Header />

      <Box className={classes.pageWrapper}>
        <Box className={classes.heroSection}>
          <ImageCrossfade
            images={[
              '/images/estilismo-cejas.webp',
              '/images/im.2-op-2-scaled-1.webp',
            ]}
            interval={6000}
            transitionDuration={1.0}
            className={classes.heroImage}
            alt="Autostyling"
            objectPosition="center"
          />
          <Box className={classes.heroOverlay} />
          <span className={classes.heroNumber}>05</span>
        </Box>

        <Box className={classes.contentSection}>
          <Container size="xl">
            <FadeInSection direction="up" delay={0.2}>
              <div className={classes.pageTitleBlock}>
                <span className={classes.pageTitleOverline}>AUTOSTYLING</span>
                <hr className={classes.pageTitleDivider} />
              </div>
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
            </FadeInSection>

            <Stack gap="xl" align="center">
              <Box w="100%" maw={1200}>
                <Box className={classes.formLayout}>
                  <Box className={classes.formColumn}>
                    <ServiceBookingForm
                      onSubmit={handleServiceSubmit}
                      onChange={handleServiceSubmit}
                      categoryId={CATEGORY_IDS.AUTOSTYLING}
                    />
                    {typeof informationalListPriceArs === 'number' && (
                      <Text mt="md" size="sm" c="dimmed">
                        Precio de lista:{' '}
                        <Text component="span" c="dark" fw={500}>
                          {formatArs(informationalListPriceArs)}
                        </Text>
                      </Text>
                    )}
                  </Box>

                  <Box id="calendar-anchor" className={classes.calendarColumn}>
                    {isLoadingService ? (
                      <Center py="xl" h={400}>
                        <Loader size="md" color="var(--mg-pink)" />
                      </Center>
                    ) : currentService && bookingData?.profesional && currentEmployee ? (
                      <DateTimeSelector
                        serviceDuration={currentService.duration}
                        employeeId={bookingData.profesional}
                        serviceId={currentService.id}
                        onSelectDateTime={handleDateTimeSelect}
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

      {selectedService && selectedEmployee && selectedDate && selectedTime && (
        <EstilismoReservaModal
          opened={reservaModalOpened}
          onClose={() => {
            setReservaModalOpened(false);
            setSelectedService(null);
            setSelectedEmployee(null);
            setSelectedDate(null);
            setSelectedTime(null);
          }}
          serviceName={selectedService.name}
          service={selectedService}
          employee={selectedEmployee}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          services={services as ServiceEntity[]}
          employees={employees as Employee[]}
        />
      )}

    </>
  );
}
