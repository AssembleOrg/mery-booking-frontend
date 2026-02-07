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
import ConsultaModal from '@/presentation/components/ConsultaModal';
import { useState, useMemo } from 'react';
import { useServices, useEmployees } from '@/presentation/hooks';
import type { ServiceEntity, Employee } from '@/infrastructure/http';
import type { ServiceOption } from '@/infrastructure/types/services';
import classes from './page.module.css';
import { CATEGORY_IDS, EMPLOYEE_IDS } from '@/config/constants';

interface ServiceBookingData {
  servicio: string;
  profesional: string;
}

export default function EstilismoCejasPage() {
  const [bookingData, setBookingData] = useState<ServiceBookingData | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Estados para modales de reserva
  const [reservaModalOpened, setReservaModalOpened] = useState(false);
  const [consultaModalOpened, setConsultaModalOpened] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceEntity | null>(
    null
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const { data: services = [], isLoading: isLoadingServices } = useServices(
    CATEGORY_IDS.ESTILISMO_CEJAS
  );

  const currentService = bookingData?.servicio
    ? (services.find((s) => s.id === bookingData.servicio) as
        | ServiceEntity
        | undefined)
    : null;

  const isLoadingService = isLoadingServices && !!bookingData?.servicio;

  const { data: employees = [] } = useEmployees(
    CATEGORY_IDS.ESTILISMO_CEJAS,
    bookingData?.servicio || undefined
  );

  const currentEmployee = bookingData?.profesional
    ? employees.find((e) => e.id === bookingData.profesional)
    : null;

  // Detectar si un servicio es consulta
  const isConsultaService = (service: ServiceEntity): boolean => {
    const serviceName = service.name.toLowerCase();
    return serviceName.includes('consulta') || serviceName.includes('asesor');
  };

  const handleServiceSubmit = (data: ServiceBookingData) => {
    setBookingData(data);

    // ONLY scroll if BOTH service AND professional are selected
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

    // Guardar servicio y empleado seleccionados
    setSelectedService(currentService);
    setSelectedEmployee(currentEmployee);

    // Abrir modal según tipo de servicio
    if (isConsultaService(currentService)) {
      setConsultaModalOpened(true);
    } else {
      setReservaModalOpened(true);
    }
  };


  // Crear ServiceOption para el modal de consulta
  const consultaOptionsForModal = useMemo(() => {
    if (!selectedService) return [];

    return [
      {
        id: selectedService.id,
        label: selectedService.name,
        contentType: 'consulta' as const,
        description: `Consulta de ${selectedService.name}`,
        priceLabel: 'Precio de lista del servicio:',
        priceValue: `AR$ ${selectedService.price}.-`,
        serviceId: selectedService.id,
        employeeId: EMPLOYEE_IDS.STAFF_CONSULTAS,
        serviceDuration: selectedService.duration,
      },
    ];
  }, [selectedService]);

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
                      categoryId={CATEGORY_IDS.ESTILISMO_CEJAS}
                    />
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

      {/* Modal de Reserva para sesiones regulares */}
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

      {/* Modal de Consulta */}
      {selectedService && consultaOptionsForModal.length > 0 && (
        <ConsultaModal
          opened={consultaModalOpened}
          onClose={() => {
            setConsultaModalOpened(false);
            setSelectedService(null);
            setSelectedDate(null);
            setSelectedTime(null);
          }}
          serviceName={selectedService.name}
          serviceKey={selectedService.name.toLowerCase().replace(/\s+/g, '-')}
          consultaOptions={consultaOptionsForModal}
          services={services as ServiceEntity[]}
          employees={employees as Employee[]}
          staffConsultasId={EMPLOYEE_IDS.STAFF_CONSULTAS}
          meryGarciaId={EMPLOYEE_IDS.MERY_GARCIA}
        />
      )}
    </>
  );
}
