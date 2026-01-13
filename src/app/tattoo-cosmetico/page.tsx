'use client';

import { Box, Container, Text, Collapse, Select, Button } from '@mantine/core';
import {
  Header,
  Footer,
  DateTimeSelector,
  BookingConfirmationModal,
  ReservaModal,
  FadeInSection,
} from '@/presentation/components';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import {
  useAvailability,
  useServices,
  useEmployees,
  useCreateClient,
  useCreateBooking,
} from '@/presentation/hooks';
import {
  CategoryService,
  type Category,
  type ServiceEntity,
  type Employee,
} from '@/infrastructure/http';
import { useAuth } from '@/presentation/contexts';
import { Client } from '@/domain/entities';
import dayjs from 'dayjs';
import classes from './page.module.css';

// Tipos de contenido del acordeón
type AccordionContentType =
  | 'consulta-sin-trabajo'
  | 'consulta-con-trabajo'
  | 'sesion-calendario'
  | 'retoque-calendario'
  | 'mantenimiento-calendario'
  | 'last-minute';

interface ServiceOption {
  id: string;
  label: string;
  contentType: AccordionContentType;
  description?: string;
  extraDescription?: string;
  priceLabel?: string;
  priceValue?: string;
  priceEffective?: string;
  depositLabel?: string;
  depositValue?: string;
  promoText?: string;
  footerNote?: string;
  footerNote2?: string;
  cuotasText?: string;
  serviceId?: string; // ID del servicio en el backend
  employeeId?: string; // ID del empleado en el backend
  serviceDuration?: number; // Duración del servicio en minutos
}

interface AccordionItemProps {
  option: ServiceOption;
  isOpen: boolean;
  onToggle: () => void;
}

// Componente para el contenido de Consulta (con selector de profesional)
function ConsultaContent({
  option,
  staffConsultasId,
  services = [],
  employees = [],
}: {
  option: ServiceOption;
  staffConsultasId?: string;
  services?: ServiceEntity[];
  employees?: Employee[];
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // ID hardcodeado de "Staff Consultas" como fallback
  const STAFF_CONSULTAS_ID = '2d283dc6-6940-46fc-9166-eb6b17b8cc0f';

  // Usar el ID proporcionado o el hardcodeado como fallback
  const effectiveStaffConsultasId = staffConsultasId || STAFF_CONSULTAS_ID;

  // Hooks para crear cliente y reserva
  const createClientMutation = useCreateClient();
  const createBookingMutation = useCreateBooking();

  // Buscar el servicio actual
  const currentService = option.serviceId
    ? services.find((s) => s.id === option.serviceId)
    : null;

  // Buscar el empleado actual
  const currentEmployee = effectiveStaffConsultasId
    ? employees.find((e) => e.id === effectiveStaffConsultasId)
    : null;

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    open(); // Abrir modal de confirmación
  };

  const handleConfirmBooking = async (clientData: Client) => {
    if (!option.serviceId || !selectedDate || !selectedTime || !currentService)
      return;

    if (!effectiveStaffConsultasId) {
      return;
    }

    try {
      // 1. Crear cliente primero (usando endpoint público si no está autenticado)
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
        employeeId: effectiveStaffConsultasId,
        serviceId: currentService.id,
        date: dateString,
        startTime: selectedTime,
        quantity: 1,
        paid: false,
        notes: clientData.notes,
      });

      close();

      // Resetear estado
      setShowCalendar(false);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      // Los errores ya se manejan en los hooks con notificaciones
      console.error('Error al crear reserva:', error);
    }
  };

  const handleBack = () => {
    setShowCalendar(false);
  };

  const handleContinue = () => {
    console.log(
      'Continuar clicked - staffConsultasId:',
      effectiveStaffConsultasId,
      'serviceId:',
      option.serviceId
    );
    // Permitir continuar aunque staffConsultasId sea undefined temporalmente
    // El hook useAvailability manejará el caso cuando no hay employeeId
    if (option.serviceId) {
      setShowCalendar(true);
    } else {
      console.warn('Falta serviceId - serviceId:', option.serviceId);
    }
  };

  // Calcular rango de fechas (hoy hasta 3 meses)
  const minDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const maxDate = useMemo(
    () => dayjs().add(3, 'months').format('YYYY-MM-DD'),
    []
  );

  // Verificar disponibilidad si tenemos serviceId y employeeId
  // Solo ejecutar cuando showCalendar es true y tenemos todos los parámetros
  const employeeIdForAvailability =
    showCalendar && effectiveStaffConsultasId
      ? effectiveStaffConsultasId
      : null;
  const serviceIdForAvailability =
    showCalendar && option.serviceId ? option.serviceId : null;
  const minDateForAvailability = showCalendar ? minDate : null;
  const maxDateForAvailability = showCalendar ? maxDate : null;

  const {
    data: availability,
    isLoading: isLoadingAvailability,
    error: availabilityError,
  } = useAvailability(
    employeeIdForAvailability,
    serviceIdForAvailability,
    minDateForAvailability,
    maxDateForAvailability
  );

  // Debug: Log cuando cambian los parámetros
  useEffect(() => {
    if (showCalendar) {
      console.log('Availability hook params:', {
        employeeId: employeeIdForAvailability,
        serviceId: serviceIdForAvailability,
        minDate: minDateForAvailability,
        maxDate: maxDateForAvailability,
      });
    }
  }, [
    showCalendar,
    employeeIdForAvailability,
    serviceIdForAvailability,
    minDateForAvailability,
    maxDateForAvailability,
  ]);

  // Debug: Log errores
  useEffect(() => {
    if (availabilityError) {
      console.error('Availability error:', availabilityError);
    }
  }, [availabilityError]);

  // Verificar si hay disponibilidad
  const hasAvailability = useMemo(() => {
    if (!showCalendar || !option.serviceId || !staffConsultasId) {
      return false;
    }
    if (!availability) {
      return false;
    }
    // Verificar si hay al menos un día con slots disponibles
    return availability.availability.some((day) => {
      if (!day.hasActiveTimeSlots) return false;
      return day.slots.some((slot) => slot.available);
    });
  }, [availability, option.serviceId, staffConsultasId, showCalendar]);

  if (showCalendar) {
    return (
      <Box className={classes.accordionPanelContent}>
        <Text className={classes.panelDescription}>{option.description}</Text>
        {option.extraDescription && (
          <Text className={classes.panelDescription}>
            {option.extraDescription}
          </Text>
        )}
        <Text className={classes.panelPrice}>
          {option.priceLabel}{' '}
          <span className={classes.priceValue}>{option.priceValue}</span>
        </Text>

        {/* Mostrar mensaje de no disponibilidad si no hay slots disponibles */}
        {!isLoadingAvailability && !hasAvailability ? (
          <Box className={classes.emptyBookingCard}>
            <Image
              src="/am-empty-booking.svg"
              alt="No hay citas disponibles"
              width={100}
              height={100}
            />
            <Text className={classes.emptyBookingText}>
              Actualmente no hay citas disponible. Ingresa periódicamente para
              verificar nuevas disponibilidades
            </Text>
          </Box>
        ) : (
          <Box className={classes.calendarCard}>
            <DateTimeSelector
              serviceDuration={option.serviceDuration ?? 60}
              employeeId={staffConsultasId ?? null}
              serviceId={option.serviceId ?? null}
              onSelectDateTime={handleDateTimeSelect}
              onBack={handleBack}
              showBackButton={true}
            />
          </Box>
        )}

        {option.footerNote && (
          <Text className={classes.footerNote}>{option.footerNote}</Text>
        )}
        {option.footerNote2 && (
          <Text className={classes.footerNote}>{option.footerNote2}</Text>
        )}

        {/* Modal de Confirmación */}
        {currentService && selectedDate && selectedTime && (
          <BookingConfirmationModal
            opened={opened}
            onClose={close}
            service={{
              id: currentService.id,
              name: currentService.name,
              slug: currentService.name.toLowerCase().replace(/\s+/g, '-'),
              price: Number(currentService.price),
              priceBook: Number(currentService.price),
              depositAmount: currentService.depositAmount,
              duration: currentService.duration,
              image: currentService.urlImage || '/desk.svg',
            }}
            professional={
              currentEmployee
                ? {
                    id: currentEmployee.id,
                    name: currentEmployee.fullName,
                    available: true,
                    services: [],
                  }
                : null
            }
            date={selectedDate}
            time={selectedTime}
            location="Mery García Office"
            onConfirm={handleConfirmBooking}
          />
        )}
      </Box>
    );
  }

  return (
    <Box className={classes.accordionPanelContent}>
      <Text className={classes.panelDescription}>{option.description}</Text>
      {option.extraDescription && (
        <Text className={classes.panelDescription}>
          {option.extraDescription}
        </Text>
      )}
      <Text className={classes.panelPrice}>
        {option.priceLabel}{' '}
        <span className={classes.priceValue}>{option.priceValue}</span>
      </Text>

      <Box className={classes.bookingCard}>
        <Text className={classes.bookingLabel}>Profesional:</Text>
        {effectiveStaffConsultasId ? (
          <Select
            data={[
              { value: effectiveStaffConsultasId, label: 'Staff Consultas' },
            ]}
            value={effectiveStaffConsultasId}
            readOnly={true}
            className={classes.bookingSelect}
          />
        ) : (
          <Text style={{ padding: '0.5rem', color: '#545454' }}>
            Staff Consultas
          </Text>
        )}
        <button
          type="button"
          className={classes.continueButton}
          onClick={handleContinue}
          // disabled={!staffConsultasId || !option.serviceId}
        >
          Continuar
        </button>
      </Box>

      {option.footerNote && (
        <Text className={classes.footerNote}>{option.footerNote}</Text>
      )}
      {option.footerNote2 && (
        <Text className={classes.footerNote}>{option.footerNote2}</Text>
      )}

      {/* Modal de Confirmación */}
      {currentService && selectedDate && selectedTime && (
        <BookingConfirmationModal
          opened={opened}
          onClose={close}
          service={{
            id: currentService.id,
            name: currentService.name,
            slug: currentService.name.toLowerCase().replace(/\s+/g, '-'),
            price: Number(currentService.price),
            priceBook: Number(currentService.price),
            depositAmount: currentService.depositAmount,
            duration: currentService.duration,
            image: currentService.urlImage || '/desk.svg',
          }}
          professional={
            currentEmployee
              ? {
                  id: currentEmployee.id,
                  name: currentEmployee.fullName,
                  available: true,
                  services: [],
                }
              : null
          }
          date={selectedDate}
          time={selectedTime}
          location="Mery García Office"
          onConfirm={handleConfirmBooking}
        />
      )}
    </Box>
  );
}

// Componente para el contenido de Sesiones (con calendario)
function SesionCalendarioContent({
  option,
  meryGarciaId,
  services = [],
  employees = [],
}: {
  option: ServiceOption;
  meryGarciaId?: string;
  services?: ServiceEntity[];
  employees?: Employee[];
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // Hooks para crear cliente y reserva
  const createClientMutation = useCreateClient();
  const createBookingMutation = useCreateBooking();

  // Buscar el servicio actual
  const currentService = option.serviceId
    ? services.find((s) => s.id === option.serviceId)
    : null;

  // Buscar el empleado actual (Mery Garcia)
  const currentEmployee = meryGarciaId
    ? employees.find((e) => e.id === meryGarciaId)
    : null;

  // Usar meryGarciaId o option.employeeId como fallback
  const effectiveEmployeeId = meryGarciaId || option.employeeId;

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    open(); // Abrir modal de confirmación
  };

  const handleConfirmBooking = async (clientData: Client) => {
    if (
      !option.serviceId ||
      !selectedDate ||
      !selectedTime ||
      !currentService ||
      !effectiveEmployeeId
    )
      return;

    try {
      // 1. Crear cliente primero (usando endpoint público si no está autenticado)
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
        employeeId: effectiveEmployeeId,
        serviceId: currentService.id,
        date: dateString,
        startTime: selectedTime,
        quantity: 1,
        paid: false,
        notes: clientData.notes,
      });

      close();

      // Resetear estado
      setShowCalendar(false);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      // Los errores ya se manejan en los hooks con notificaciones
      console.error('Error al crear reserva:', error);
    }
  };

  const handleContinue = () => {
    // Permitir continuar incluso si no hay serviceId (para mostrar SVG de "no hay turnos")
    // Solo necesitamos employeeId para continuar
    if (effectiveEmployeeId) {
      setShowCalendar(true);
    }
  };

  const handleBack = () => {
    setShowCalendar(false);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Calcular rango de fechas (hoy hasta 3 meses)
  const minDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const maxDate = useMemo(
    () => dayjs().add(3, 'months').format('YYYY-MM-DD'),
    []
  );

  // Usar meryGarciaId si está disponible, sino usar option.employeeId
  const employeeId = meryGarciaId || option.employeeId;

  // Verificar disponibilidad solo cuando showCalendar es true y tenemos serviceId y employeeId
  const employeeIdForAvailability =
    showCalendar && employeeId ? employeeId : null;
  const serviceIdForAvailability =
    showCalendar && option.serviceId ? option.serviceId : null;
  const minDateForAvailability = showCalendar ? minDate : null;
  const maxDateForAvailability = showCalendar ? maxDate : null;

  const {
    data: availability,
    isLoading: isLoadingAvailability,
    error: availabilityError,
  } = useAvailability(
    employeeIdForAvailability,
    serviceIdForAvailability,
    minDateForAvailability,
    maxDateForAvailability
  );

  // Verificar si hay disponibilidad
  const hasAvailability = useMemo(() => {
    // Si no hay serviceId, no hay disponibilidad (mostrar SVG)
    if (!option.serviceId) {
      return false;
    }
    if (!showCalendar || !employeeId) {
      return false;
    }
    if (!availability) {
      return false;
    }
    // Verificar si hay al menos un día con slots disponibles
    return availability.availability.some((day) => {
      if (!day.hasActiveTimeSlots) return false;
      return day.slots.some((slot) => slot.available);
    });
  }, [availability, option.serviceId, employeeId, showCalendar]);

  return (
    <Box className={classes.accordionPanelContent}>
      <Text className={classes.panelDescription}>{option.description}</Text>
      <Text className={classes.panelPrice}>
        {option.priceLabel}{' '}
        <span className={classes.priceValue}>{option.priceValue}</span>
        {option.priceEffective && (
          <>
            {' '}
            (en efectivo{' '}
            <span className={classes.priceValue}>{option.priceEffective}</span>)
          </>
        )}
        {option.depositLabel && (
          <>
            {' '}
            {option.depositLabel}{' '}
            <span className={classes.depositValue}>{option.depositValue}</span>
          </>
        )}
      </Text>
      {option.cuotasText && (
        <Text className={classes.panelCuotas}>{option.cuotasText}</Text>
      )}

      {!showCalendar ? (
        <>
          {/* Mostrar profesional seleccionado (Mery Garcia) - no editable */}
          <Box className={classes.bookingCard}>
            <Text className={classes.bookingLabel}>Profesional:</Text>
            {meryGarciaId ? (
              <Select
                data={[{ value: meryGarciaId, label: 'Mery Garcia' }]}
                value={meryGarciaId}
                readOnly={true}
                className={classes.bookingSelect}
              />
            ) : (
              <Text style={{ padding: '0.5rem', color: '#2B2B2B' }}>
                Mery Garcia
              </Text>
            )}
            <button
              type="button"
              className={classes.continueButton}
              onClick={handleContinue}
              disabled={!effectiveEmployeeId}
            >
              Continuar
            </button>
          </Box>
        </>
      ) : (
        <>
          {/* Mostrar mensaje de no disponibilidad si no hay slots disponibles */}
          {!isLoadingAvailability && !hasAvailability ? (
            <Box className={classes.emptyBookingCard}>
              <Image
                src="/am-empty-booking.svg"
                alt="No hay citas disponibles"
                width={100}
                height={100}
              />
              <Text className={classes.emptyBookingText}>
                Actualmente no hay citas disponible. Ingresa periódicamente para
                verificar nuevas disponibilidades
              </Text>
            </Box>
          ) : (
            <Box className={classes.calendarCard}>
              <DateTimeSelector
                serviceDuration={option.serviceDuration ?? 60}
                employeeId={employeeId ?? null}
                serviceId={option.serviceId ?? null}
                onSelectDateTime={handleDateTimeSelect}
                onBack={handleBack}
                showBackButton={true}
              />
            </Box>
          )}
        </>
      )}

      {option.promoText && (
        <Text className={classes.promoText}>{option.promoText}</Text>
      )}

      {/* Modal de Confirmación */}
      {currentService && selectedDate && selectedTime && (
        <BookingConfirmationModal
          opened={opened}
          onClose={close}
          service={{
            id: currentService.id,
            name: currentService.name,
            slug: currentService.name.toLowerCase().replace(/\s+/g, '-'),
            price: Number(currentService.price),
            priceBook: Number(currentService.price),
            depositAmount: currentService.depositAmount,
            duration: currentService.duration,
            image: currentService.urlImage || '/desk.svg',
          }}
          professional={
            currentEmployee
              ? {
                  id: currentEmployee.id,
                  name: currentEmployee.fullName,
                  available: true,
                  services: [],
                }
              : null
          }
          date={selectedDate}
          time={selectedTime}
          location="Mery García Office"
          onConfirm={handleConfirmBooking}
        />
      )}
    </Box>
  );
}

// Componente para Last Minute (sin disponibilidad)
function LastMinuteContent({ option }: { option: ServiceOption }) {
  return (
    <Box className={classes.accordionPanelContent}>
      <Text className={classes.panelDescription}>{option.description}</Text>
      <Text className={classes.panelPrice}>
        {option.priceLabel}{' '}
        <span className={classes.priceValue}>{option.priceValue}</span>
        {option.priceEffective && (
          <>
            {' '}
            (<span className={classes.priceValue}>
              {option.priceEffective}
            </span>{' '}
            en efectivo)
          </>
        )}
        {option.depositLabel && (
          <>
            {' '}
            {option.depositLabel}{' '}
            <span className={classes.depositValue}>{option.depositValue}</span>
          </>
        )}
      </Text>
      {option.promoText && (
        <Text className={classes.promoText}>{option.promoText}</Text>
      )}

      <Box className={classes.emptyBookingCard}>
        <Image
          src="/am-empty-booking.svg"
          alt="No hay citas disponibles"
          width={100}
          height={100}
        />
        <Text className={classes.emptyBookingText}>
          Actualmente no hay citas disponible. Ingresa periódicamente para
          verificar nuevas disponibilidades
        </Text>
      </Box>
    </Box>
  );
}

interface AccordionItemWithIdsProps extends AccordionItemProps {
  staffConsultasId?: string;
  meryGarciaId?: string;
  services?: ServiceEntity[];
  employees?: Employee[];
}

function AccordionItem({
  option,
  isOpen,
  onToggle,
  staffConsultasId,
  meryGarciaId,
  services,
  employees,
}: AccordionItemWithIdsProps) {
  const renderContent = () => {
    switch (option.contentType) {
      case 'consulta-sin-trabajo':
      case 'consulta-con-trabajo':
        return (
          <ConsultaContent
            option={option}
            staffConsultasId={staffConsultasId}
            services={services}
            employees={employees}
          />
        );
      case 'sesion-calendario':
      case 'retoque-calendario':
      case 'mantenimiento-calendario':
        return (
          <SesionCalendarioContent
            option={option}
            meryGarciaId={meryGarciaId}
            services={services}
            employees={employees}
          />
        );
      case 'last-minute':
        return <LastMinuteContent option={option} />;
      default:
        return null;
    }
  };

  return (
    <Box className={classes.accordionItem}>
      <button className={classes.accordionControl} onClick={onToggle}>
        <IconChevronDown
          size={14}
          className={`${classes.accordionChevron} ${
            isOpen ? classes.accordionChevronOpen : ''
          }`}
        />
        <span className={classes.accordionLabel}>{option.label}</span>
      </button>
      <Collapse in={isOpen}>
        <Box className={classes.accordionPanel}>{renderContent()}</Box>
      </Collapse>
    </Box>
  );
}

interface ServiceAccordionProps {
  options: ServiceOption[];
  staffConsultasId?: string;
  meryGarciaId?: string;
  services?: ServiceEntity[];
  employees?: Employee[];
}

function ServiceAccordion({
  options,
  staffConsultasId,
  meryGarciaId,
  services,
  employees,
}: ServiceAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <Box className={classes.accordionWrapper}>
      {options.map((option) => (
        <AccordionItem
          key={option.id}
          option={option}
          isOpen={openId === option.id}
          onToggle={() => handleToggle(option.id)}
          staffConsultasId={staffConsultasId}
          meryGarciaId={meryGarciaId}
          services={services}
          employees={employees}
        />
      ))}
    </Box>
  );
}

// Datos de las opciones de cada servicio - NANOBLADING
const nanobladingOptions: ServiceOption[] = [
  {
    id: 'nano-1',
    label: 'Consulta Obligatoria SIN trabajo previo (*)',
    contentType: 'consulta-sin-trabajo',
    description:
      'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    footerNote:
      '(*) Espacio para que conozcas nuestro modo de trabajo, técnica y cuidados que deberás cumplir. Dibujamos los resultados que buscamos y saldamos todas tus dudas.',
    footerNote2: 'Sin consulta previa no podremos brindarte un servicio MG.',
  },
  {
    id: 'nano-2',
    label: 'Consulta Obligatoria CON trabajo previo (*)',
    contentType: 'consulta-con-trabajo',
    description:
      'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    extraDescription:
      'Se considera trabajo previo a cualquier servicio de cosmetic tattoo en cejas que no haya sido realizado por MG & Staff.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    footerNote:
      '(*) Espacio para que conozcas nuestro modo de trabajo, técnica y cuidados que deberás cumplir. Dibujamos los resultados que buscamos y saldamos todas tus dudas.',
    footerNote2: 'Sin consulta previa no podremos brindarte un servicio MG.',
  },
  {
    id: 'nano-3',
    label: '1ª Sesión (By Mery Garcia)',
    contentType: 'sesion-calendario',
    description:
      'Primera experiencia de Nanoblading con nosotras. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 610.-',
    priceEffective: 'U$S 420.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'nano-4',
    label: '2ª Sesión - Retoque (By Mery Garcia)',
    contentType: 'retoque-calendario',
    description:
      'Completá tu servicio de Nanoblading entre 30 y 60 días después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 317.-',
    priceEffective: 'U$S 180.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'nano-5',
    label: 'Mantenimiento (By Mery Garcia)',
    contentType: 'mantenimiento-calendario',
    description:
      'Reactiva tu servicio de Nanoblading. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 610.-',
    priceEffective: 'U$S 420.- en efectivo',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'nano-6',
    label: 'Last Minute Booking Nanoblading (Mantenimiento)',
    contentType: 'last-minute',
    description:
      'Reactiva tu servicio de Nanoblading. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 488.-',
    priceEffective: 'U$S 336.-',
    depositLabel: ' Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    promoText:
      'Reservá tu cita 20% OFF SOLO para clientas de tatuaje cosmético MG. La seña NO es reembolsable.',
  },
];

const lipBlushOptions: ServiceOption[] = [
  {
    id: 'lip-1',
    label: 'Consulta previa',
    contentType: 'sesion-calendario',
    description:
      'Un espacio reservado para saldar tus dudas y que Mery de manera personalizada pueda hacerte una demostración de diseño elegido especialmente para vos. Por favor, lee atentamente la información previa y en caso de que quieras, solicita los cuidados post de tu Lip Blush y el consentimiento informado.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lip-2',
    label: '1ª Sesión',
    contentType: 'sesion-calendario',
    description:
      'Primer experiencia de Lip Blush con nosotras. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 650.-',
    priceEffective: 'U$S 475.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lip-3',
    label: '2ª Sesión - Retoque',
    contentType: 'retoque-calendario',
    description:
      'Completá tu servicio de Lip Blush entre 30 y 60 días después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 317.-',
    priceEffective: 'U$S 180.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lip-4',
    label: 'Mantenimiento',
    contentType: 'mantenimiento-calendario',
    description:
      'Reactiva tu servicio de Lip Blush. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 650.-',
    priceEffective: 'U$S 475.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lip-5',
    label: 'Last Minute Booking Lip Blush (Mantenimiento)',
    contentType: 'last-minute',
    description:
      'Reactiva tu servicio de Lip Blush. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 520.-',
    priceEffective: 'U$S 380.-',
    depositLabel: ' Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    promoText:
      'Reservá tu cita 20% OFF SOLO para clientas de tatuaje cosmético MG. La seña NO es reembolsable.',
  },
];

const lipCamouflageOptions: ServiceOption[] = [
  {
    id: 'lipcam-1',
    label: 'Lip Camouflage Consulta previa Obligatoria',
    contentType: 'consulta-con-trabajo',
    description:
      'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    extraDescription:
      'Se considera trabajo previo a cualquier servicio de Cosmetic Tattoo que no haya sido realizado por MG & Staff.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
  },
  {
    id: 'lipcam-2',
    label: 'Lip Camouflage by Mery Garcia',
    contentType: 'sesion-calendario',
    description:
      'Servicio de corrección y mejora de trabajos previos en labios.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 600.-',
    priceEffective: 'U$S 420.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
];

const lashesLineOptions: ServiceOption[] = [
  {
    id: 'lash-1',
    label: 'Consulta previa',
    contentType: 'sesion-calendario',
    description:
      'Un espacio reservado para saldar tus dudas y que Mery Garcia & Staff de manera personalizada pueda hacerte una demostración de diseño elegido especialmente para vos.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lash-2',
    label: '1ª Sesión',
    contentType: 'sesion-calendario',
    description:
      'Primer experiencia de Lashes Line con nosotras. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 480.-',
    priceEffective: 'U$S 320.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lash-3',
    label: '2ª Sesión - Retoque',
    contentType: 'retoque-calendario',
    description:
      'Completá tu servicio de Lashes Line entre 30 y 60 días después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 317.-',
    priceEffective: 'U$S 180.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lash-4',
    label: 'Mantenimiento',
    contentType: 'mantenimiento-calendario',
    description:
      'Reactiva tu servicio de Lashes Line. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 480.-',
    priceEffective: 'U$S 320.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lash-5',
    label: 'Last Minute Booking Lashes Line (Mantenimiento)',
    contentType: 'last-minute',
    description:
      'Reactiva tu servicio de Lashes Line. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 384.-',
    priceEffective: 'U$S 256.-',
    depositLabel: ' Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    promoText:
      'Reservá tu cita 20% OFF SOLO para clientas de tatuaje cosmético MG. La seña NO es reembolsable.',
  },
];

// Mapeo de nombres de servicios estáticos a nombres en el backend
// Basado en los servicios reales del backend
const SERVICE_NAME_MAPPING: Record<string, string[]> = {
  nanoblading: [
    'nanoblading by mery garcia',
    'nanoblading',
    'nano blading',
    'nano-blading',
  ],
  'lip-blush': ['lip blush', 'lipblush', 'lip-blush'],
  'lip-camouflage': ['lip camouflage', 'lipcamouflage', 'lip-camouflage'],
  'lashes-line': ['lashes line', 'lashesline', 'lashes-line'],
};

// Mapeo de nombres de empleados estáticos a nombres en el backend
const EMPLOYEE_NAME_MAPPING: Record<string, string[]> = {
  'mery-garcia': ['mery garcia', 'mery', 'garcia'],
  'staff-mg': ['staff', 'staff mg', 'staffmg'],
};

// Función para encontrar servicio por nombre y tipo (búsqueda flexible)
function findServiceByName(
  services: ServiceEntity[],
  serviceKey: string,
  optionType?: string
): ServiceEntity | null {
  const searchTerms = SERVICE_NAME_MAPPING[serviceKey] || [
    serviceKey.toLowerCase(),
  ];

  // Filtrar servicios visibles primero
  const visibleServices = services.filter((s) => s.showOnSite);

  // Si hay un tipo de opción específico, buscar coincidencias más precisas
  if (optionType) {
    const optionTypeLower = optionType.toLowerCase();

    for (const service of visibleServices) {
      const serviceNameLower = service.name.toLowerCase();

      // Verificar que coincida con el término de búsqueda base
      const matchesBase = searchTerms.some((term) =>
        serviceNameLower.includes(term)
      );

      if (matchesBase) {
        // Buscar coincidencias específicas según el tipo de opción
        if (
          optionTypeLower.includes('consulta') ||
          optionTypeLower.includes('previa')
        ) {
          if (serviceNameLower.includes('consulta')) {
            return service;
          }
        } else if (
          optionTypeLower.includes('1ª sesión') ||
          optionTypeLower.includes('1° sesión') ||
          optionTypeLower.includes('sesion-calendario')
        ) {
          if (
            serviceNameLower.includes('1° sesión') ||
            serviceNameLower.includes('1ª sesión')
          ) {
            return service;
          }
        } else if (
          optionTypeLower.includes('2ª sesión') ||
          optionTypeLower.includes('2° sesión') ||
          optionTypeLower.includes('retoque')
        ) {
          if (
            serviceNameLower.includes('2° sesión') ||
            serviceNameLower.includes('2ª sesión') ||
            serviceNameLower.includes('retoque')
          ) {
            return service;
          }
        } else if (optionTypeLower.includes('mantenimiento')) {
          if (serviceNameLower.includes('mantenimiento')) {
            return service;
          }
        }
      }
    }
  }

  // Si no hay tipo específico o no se encontró coincidencia, buscar cualquier servicio que coincida
  for (const service of visibleServices) {
    const serviceNameLower = service.name.toLowerCase();
    for (const term of searchTerms) {
      if (serviceNameLower.includes(term)) {
        // Priorizar servicios que no sean "Last Minute" o "Consulta"
        if (
          !serviceNameLower.includes('last minute') &&
          !serviceNameLower.includes('consulta')
        ) {
          return service;
        }
      }
    }
  }

  // Si no se encontró, intentar con cualquier servicio visible que coincida
  for (const service of visibleServices) {
    const serviceNameLower = service.name.toLowerCase();
    for (const term of searchTerms) {
      if (serviceNameLower.includes(term)) {
        return service;
      }
    }
  }

  return null;
}

// Función para encontrar empleado por nombre (búsqueda flexible)
function findEmployeeByName(
  employees: Employee[],
  employeeKey: string
): Employee | null {
  const searchTerms = EMPLOYEE_NAME_MAPPING[employeeKey] || [
    employeeKey.toLowerCase(),
  ];

  for (const employee of employees) {
    const employeeNameLower = employee.fullName.toLowerCase();
    for (const term of searchTerms) {
      if (employeeNameLower.includes(term)) {
        return employee;
      }
    }
  }

  return null;
}

export default function TattooCosmeticoPage() {
  const { isAuthenticated } = useAuth();

  // ID hardcodeado de la categoría "Tattoo Cosmético"
  const TATTOO_COSMETICO_CATEGORY_ID = '9a39b2f8-0d4a-4bca-bc93-b4b5d6cf2d11';

  // ID hardcodeado de "Staff Consultas"
  const STAFF_CONSULTAS_ID = '2d283dc6-6940-46fc-9166-eb6b17b8cc0f';

  // Inicializar con el ID hardcodeado para que los hooks se ejecuten inmediatamente
  const [cosmeticTattooCategoryId, setCosmeticTattooCategoryId] =
    useState<string>(TATTOO_COSMETICO_CATEGORY_ID);
  const [mappedServices, setMappedServices] = useState<
    Map<string, ServiceEntity>
  >(new Map());
  const [mappedEmployees, setMappedEmployees] = useState<Map<string, Employee>>(
    new Map()
  );

  // Obtener categorías para encontrar "Cosmetic Tattoo" o "Tattoo Cosmético"
  // Si está autenticado, obtener dinámicamente desde la API
  // Si no está autenticado, usar el ID hardcodeado
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (isAuthenticated) {
          // Si está autenticado, obtener categorías desde la API
          const response = await CategoryService.getAll();
          const categories = response.data;

          // Buscar categoría que contenga "cosmetic tattoo" o "tattoo cosmético"
          const category = categories.find(
            (cat) =>
              cat.name.toLowerCase().includes('cosmetic tattoo') ||
              cat.name.toLowerCase().includes('tattoo cosmético') ||
              cat.name.toLowerCase().includes('tattoo cosmetico')
          );

          if (category && category.id !== cosmeticTattooCategoryId) {
            setCosmeticTattooCategoryId(category.id);
          }
        }
        // Si no está autenticado, ya tenemos el ID hardcodeado como valor inicial
      } catch (error) {
        console.error('Error fetching category:', error);
        // En caso de error, mantener el ID hardcodeado
      }
    };

    fetchCategory();
  }, [isAuthenticated, cosmeticTattooCategoryId]);

  // Obtener servicios de la categoría
  const {
    data: services = [],
    isLoading: isLoadingServices,
    error: servicesError,
  } = useServices(cosmeticTattooCategoryId);

  // Obtener empleados - el endpoint público requiere categoryId
  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
    error: employeesError,
  } = useEmployees(cosmeticTattooCategoryId);

  // Debug: Log cuando cambian los servicios o categoryId
  useEffect(() => {
    console.log('Services loading state:', {
      cosmeticTattooCategoryId,
      servicesCount: services.length,
      isLoadingServices,
      servicesError,
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        showOnSite: s.showOnSite,
      })),
    });
  }, [cosmeticTattooCategoryId, services, isLoadingServices, servicesError]);

  // Debug: Log cuando cambian los empleados
  useEffect(() => {
    console.log('Employees loading state:', {
      cosmeticTattooCategoryId,
      employeesCount: employees.length,
      isLoadingEmployees,
      employeesError,
      employees: employees.map((e) => ({ id: e.id, fullName: e.fullName })),
    });
  }, [cosmeticTattooCategoryId, employees, isLoadingEmployees, employeesError]);

  // Mapear servicios y empleados cuando se cargan
  useEffect(() => {
    if (services.length > 0) {
      const serviceMap = new Map<string, ServiceEntity>();

      // Mapear servicios - buscar la primera sesión de cada servicio como servicio base
      // Para Nanoblading: buscar "Nanoblading By Mery Garcia [1° Sesión]"
      const nanobladingService =
        services.find(
          (s) =>
            s.showOnSite &&
            s.name.toLowerCase().includes('nanoblading') &&
            s.name.toLowerCase().includes('1° sesión') &&
            s.name.toLowerCase().includes('mery garcia')
        ) || findServiceByName(services, 'nanoblading');

      // Para Lip Blush: buscar "Lip Blush [1° Sesión]"
      const lipBlushService =
        services.find(
          (s) =>
            s.showOnSite &&
            s.name.toLowerCase().includes('lip blush') &&
            s.name.toLowerCase().includes('1° sesión')
        ) || findServiceByName(services, 'lip-blush');

      // Para Lip Camouflage: buscar "Lip Camouflage (By Mery Garcia)"
      const lipCamouflageService =
        services.find(
          (s) =>
            s.showOnSite &&
            s.name.toLowerCase().includes('lip camouflage') &&
            s.name.toLowerCase().includes('mery garcia')
        ) || findServiceByName(services, 'lip-camouflage');

      // Para Lashes Line: buscar "Lashes Line [1° Sesión]"
      const lashesLineService =
        services.find(
          (s) =>
            s.showOnSite &&
            s.name.toLowerCase().includes('lashes line') &&
            s.name.toLowerCase().includes('1° sesión')
        ) || findServiceByName(services, 'lashes-line');

      if (nanobladingService) serviceMap.set('nanoblading', nanobladingService);
      if (lipBlushService) serviceMap.set('lip-blush', lipBlushService);
      if (lipCamouflageService)
        serviceMap.set('lip-camouflage', lipCamouflageService);
      if (lashesLineService) serviceMap.set('lashes-line', lashesLineService);

      setMappedServices(serviceMap);
    }
  }, [services]);

  useEffect(() => {
    if (employees.length > 0) {
      const employeeMap = new Map<string, Employee>();

      // Mapear empleados
      const meryGarcia = findEmployeeByName(employees, 'mery-garcia');
      const staffMg = findEmployeeByName(employees, 'staff-mg');
      // Buscar "Staff Consultas" específicamente - búsqueda flexible
      const staffConsultas = employees.find((e) => {
        const nameLower = e.fullName.toLowerCase();
        return (
          nameLower.includes('staff consultas') ||
          nameLower === 'staff consultas' ||
          nameLower.includes('staff consulta')
        );
      });

      if (meryGarcia) employeeMap.set('mery-garcia', meryGarcia);
      if (staffMg) employeeMap.set('staff-mg', staffMg);
      if (staffConsultas) {
        employeeMap.set('staff-consultas', staffConsultas);
        console.log('Staff Consultas encontrado:', staffConsultas);
      } else {
        console.warn(
          'Staff Consultas NO encontrado. Empleados disponibles:',
          employees.map((e) => e.fullName)
        );
        // Usar ID hardcodeado como fallback si no se encuentra en la lista
        // Crear un objeto Employee temporal con el ID hardcodeado
        const staffConsultasFallback: Employee = {
          id: STAFF_CONSULTAS_ID,
          fullName: 'Staff Consultas',
          email: 'info6@merygarcia.com.ar',
          phone: '+541145303203',
          createdAt: '',
          updatedAt: '',
        };
        employeeMap.set('staff-consultas', staffConsultasFallback);
        console.log(
          'Usando Staff Consultas con ID hardcodeado:',
          STAFF_CONSULTAS_ID
        );
      }

      setMappedEmployees(employeeMap);
    }
  }, [employees]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openWhatsApp = (message: string) => {
    const phoneNumber = '5491161592591';
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      '_blank'
    );
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  // Función para obtener opciones con IDs mapeados
  const getOptionsWithIds = (
    baseOptions: ServiceOption[],
    serviceKey: string,
    allServices: ServiceEntity[]
  ): ServiceOption[] => {
    const service = mappedServices.get(serviceKey);
    const meryGarcia = mappedEmployees.get('mery-garcia');

    return baseOptions.map((option) => {
      // Solo agregar IDs a opciones que no sean last-minute
      if (option.contentType === 'last-minute') {
        return option;
      }

      // Para consultas, buscar el servicio de consulta específico
      if (
        option.contentType === 'consulta-sin-trabajo' ||
        option.contentType === 'consulta-con-trabajo'
      ) {
        // Buscar servicio de consulta específico según el tipo
        let consultaService: ServiceEntity | undefined;

        if (serviceKey === 'nanoblading') {
          if (option.contentType === 'consulta-sin-trabajo') {
            // Buscar: "Nanoblading [Consulta obligatoria] SIN trabajo previo"
            // Nombre exacto del backend: "Nanoblading [Consulta obligatoria] SIN trabajo previo"
            consultaService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('nanoblading') &&
                nameLower.includes('consulta') &&
                nameLower.includes('sin trabajo previo')
              );
            });
          } else if (option.contentType === 'consulta-con-trabajo') {
            // Buscar: "Nanoblading [Consulta Obligatoria] CON trabajo previo"
            // Nombre exacto del backend: "Nanoblading [Consulta Obligatoria] CON trabajo previo"
            consultaService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('nanoblading') &&
                nameLower.includes('consulta') &&
                nameLower.includes('con trabajo previo')
              );
            });
          }
        } else if (serviceKey === 'lip-camouflage') {
          // Buscar: "Lip Camouflage [Consulta previa obligatoria]"
          // Nombre exacto del backend: "Lip Camouflage [Consulta previa obligatoria]"
          consultaService = allServices.find((s) => {
            const nameLower = s.name.toLowerCase();
            return (
              s.showOnSite &&
              nameLower.includes('lip camouflage') &&
              nameLower.includes('consulta previa obligatoria')
            );
          });
        }

        // Debug: Log si no se encuentra el servicio
        if (!consultaService) {
          console.warn(
            `No se encontró servicio de consulta para ${serviceKey} - ${option.contentType}`,
            {
              services: allServices
                .filter((s) => s.showOnSite)
                .map((s) => s.name),
              optionLabel: option.label,
              allServicesCount: allServices.length,
            }
          );
        }

        return {
          ...option,
          serviceId: consultaService?.id,
          serviceDuration: consultaService?.duration || 60,
        };
      }

      // Para servicios con calendario, usar el servicio mapeado y Mery Garcia
      // EXCEPCIÓN: "Consulta previa" de Lashes Line no debe tener serviceId para mostrar "no hay turnos"
      if (
        option.contentType === 'sesion-calendario' ||
        option.contentType === 'retoque-calendario' ||
        option.contentType === 'mantenimiento-calendario'
      ) {
        // Si es "Consulta previa" de Lashes Line, no asignar serviceId
        if (
          serviceKey === 'lashes-line' &&
          option.label === 'Consulta previa'
        ) {
          return {
            ...option,
            // No asignar serviceId para que muestre el SVG de "no hay turnos"
            employeeId: meryGarcia?.id,
          };
        }

        return {
          ...option,
          serviceId: service?.id,
          employeeId: meryGarcia?.id,
          serviceDuration: service?.duration,
        };
      }

      return option;
    });
  };

  // Opciones con IDs mapeados - solo ejecutar cuando los servicios estén cargados
  const nanobladingOptionsWithIds = useMemo(() => {
    if (services.length === 0) return nanobladingOptions;
    return getOptionsWithIds(nanobladingOptions, 'nanoblading', services);
  }, [mappedServices, mappedEmployees, services]);

  const lipBlushOptionsWithIds = useMemo(() => {
    if (services.length === 0) return lipBlushOptions;
    return getOptionsWithIds(lipBlushOptions, 'lip-blush', services);
  }, [mappedServices, mappedEmployees, services]);

  const lipCamouflageOptionsWithIds = useMemo(() => {
    if (services.length === 0) return lipCamouflageOptions;
    return getOptionsWithIds(lipCamouflageOptions, 'lip-camouflage', services);
  }, [mappedServices, mappedEmployees, services]);

  const lashesLineOptionsWithIds = useMemo(() => {
    if (services.length === 0) return lashesLineOptions;
    return getOptionsWithIds(lashesLineOptions, 'lashes-line', services);
  }, [mappedServices, mappedEmployees, services]);

  // IDs de empleados para modal de reservas
  const staffConsultasId = useMemo(() => {
    return mappedEmployees.get('staff-consultas')?.id;
  }, [mappedEmployees]);

  const meryGarciaId = useMemo(() => {
    return mappedEmployees.get('mery-garcia')?.id;
  }, [mappedEmployees]);

  // Estados para CONSULTA y RESERVA directos
  const [consultaData, setConsultaData] = useState<{
    serviceName: string;
    serviceKey: string;
  } | null>(null);
  const [reservaData, setReservaData] = useState<{
    serviceName: string;
    serviceKey: string;
  } | null>(null);
  const [reservaTipo, setReservaTipo] = useState<
    'sesion' | 'retoque' | 'mantenimiento' | null
  >(null);

  // Estado para modal de reservas con stepper
  const [modalOpened, setModalOpened] = useState(false);
  const [modalService, setModalService] = useState<{
    serviceName: string;
    serviceKey: string;
    options: ServiceOption[];
  } | null>(null);

  return (
    <>
      <Header />

      <Box className={classes.pageWrapper}>
        {/* Sub Menu Navigation - STICKY */}
        <Box className={classes.subMenuNav}>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('nanoblading')}
          >
            <span>NANOBLADING</span>
          </Box>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('lip-blush')}
          >
            <span>LIP BLUSH</span>
          </Box>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('lip-camouflage')}
          >
            <span>LIP CAMOUFLAGE</span>
          </Box>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('lashes-line')}
          >
            <span>LASHES LINE</span>
          </Box>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('pecas-lunares')}
          >
            <span>PECAS</span>
          </Box>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('camuflaje')}
          >
            <span>CAMUFLAJE</span>
          </Box>
        </Box>

        {/* Content Section */}
        <Box className={classes.contentSection}>
          <Container size="xl">
            {/* NANOBLADING Section */}
            <FadeInSection direction="up" delay={0}>
              <Box id="nanoblading" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceThumbnail}>
                      <Image
                        src="/images/im.2-op-2-scaled-1.webp"
                        alt="Nanoblading"
                        width={100}
                        height={100}
                        className={classes.thumbnailImage}
                      />
                    </Box>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>NANOBLADING</Text>
                      <Text className={classes.serviceTagline}>
                        Técnica avanzada de cosmetic tattoo de cejas. Resultados
                        hiperrealistas.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(
                          'https://merygarcia.com.ar/servicios/nanoblading'
                        )
                      }
                    >
                      MÁS INFO AQUÍ
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() =>
                        openWhatsApp('Quiero consultar sobre NANOBLADING')
                      }
                    >
                      CONSULTA
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        console.log('📦 Opening ReservaModal with:', {
                          serviceName: 'NANOBLADING',
                          serviceKey: 'nanoblading',
                          optionsCount: nanobladingOptionsWithIds.length,
                          firstOptionSample: nanobladingOptionsWithIds[2], // La opción "1ª Sesión"
                          staffConsultasId,
                          meryGarciaId,
                          employeesCount: employees.length,
                          servicesCount: services.length,
                        });
                        setModalService({
                          serviceName: 'NANOBLADING',
                          serviceKey: 'nanoblading',
                          options: nanobladingOptionsWithIds,
                        });
                        setModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'RESERVAR'}
                    </button>
                  </Box>
                </Box>

                {/* <Box className={classes.optionsSection}>
                  <Text className={classes.optionsTitle}>
                    Seleccioná la opción deseada para solicitar tu cita:
                  </Text>
                  <ServiceAccordion
                    options={nanobladingOptionsWithIds}
                    staffConsultasId={
                      mappedEmployees.get('staff-consultas')?.id ||
                      STAFF_CONSULTAS_ID
                    }
                    meryGarciaId={mappedEmployees.get('mery-garcia')?.id}
                    services={services}
                    employees={employees}
                  />
                </Box> */}
              </Box>
            </FadeInSection>

            {/* LIP BLUSH Section */}
            <FadeInSection direction="up" delay={0.1}>
              <Box id="lip-blush" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceThumbnail}>
                      <Image
                        src="/images/Lip-blush-1-1-768x512.webp"
                        alt="Lip Blush"
                        width={100}
                        height={100}
                        className={classes.thumbnailImage}
                      />
                    </Box>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>LIP BLUSH</Text>
                      <Text className={classes.serviceTagline}>
                        Maquillaje semi permanente para labios. Dura 18-24
                        meses.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(
                          'https://merygarcia.com.ar/servicios/lip-blush'
                        )
                      }
                    >
                      MÁS INFO AQUÍ
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() =>
                        openWhatsApp('Quiero consultar sobre LIP BLUSH')
                      }
                    >
                      CONSULTA
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'LIP BLUSH',
                          serviceKey: 'lip-blush',
                          options: lipBlushOptionsWithIds,
                        });
                        setModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'RESERVAR'}
                    </button>
                  </Box>
                </Box>

                {/* <Box className={classes.optionsSection}>
                  <Text className={classes.optionsTitle}>
                    Seleccioná la opción deseada para solicitar tu cita:
                  </Text>
                  <ServiceAccordion
                    options={lipBlushOptionsWithIds}
                    staffConsultasId={
                      mappedEmployees.get('staff-consultas')?.id ||
                      STAFF_CONSULTAS_ID
                    }
                    meryGarciaId={mappedEmployees.get('mery-garcia')?.id}
                    services={services}
                    employees={employees}
                  />
                </Box> */}
              </Box>
            </FadeInSection>

            {/* LIP CAMOUFLAGE Section */}
            <FadeInSection direction="up" delay={0.15}>
              <Box id="lip-camouflage" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceThumbnail}>
                      <Image
                        src="/images/lim-camouflage.webp"
                        alt="Lip Camouflage"
                        width={100}
                        height={100}
                        className={classes.thumbnailImage}
                      />
                    </Box>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>
                        LIP CAMOUFLAGE
                      </Text>
                      <Text className={classes.serviceTagline}>
                        Corrección de trabajos previos mal realizados o
                        deteriorados.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(
                          'https://merygarcia.com.ar/servicios/lip-blush'
                        )
                      }
                    >
                      MÁS INFO AQUÍ
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() =>
                        openWhatsApp('Quiero consultar sobre LIP CAMOUFLAGE')
                      }
                    >
                      CONSULTA
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'LIP CAMOUFLAGE',
                          serviceKey: 'lip-camouflage',
                          options: lipCamouflageOptionsWithIds,
                        });
                        setModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'RESERVAR'}
                    </button>
                  </Box>
                </Box>

                {/* <Box className={classes.optionsSection}>
                  <Text className={classes.optionsTitle}>
                    Seleccioná la opción deseada para solicitar tu cita:
                  </Text>
                  <ServiceAccordion
                    options={lipCamouflageOptionsWithIds}
                    staffConsultasId={
                      mappedEmployees.get('staff-consultas')?.id ||
                      STAFF_CONSULTAS_ID
                    }
                    meryGarciaId={mappedEmployees.get('mery-garcia')?.id}
                    services={services}
                    employees={employees}
                  />
                </Box> */}
              </Box>
            </FadeInSection>

            {/* LASHES LINE Section */}
            <FadeInSection direction="up" delay={0.2}>
              <Box id="lashes-line" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceThumbnail}>
                      <Image
                        src="/images/lashes_line_b.webp"
                        alt="Lashes Line"
                        width={100}
                        height={100}
                        className={classes.thumbnailImage}
                      />
                    </Box>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>LASHES LINE</Text>
                      <Text className={classes.serviceTagline}>
                        Efecto natural de mayor volumen y densidad en pestañas.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(
                          'https://merygarcia.com.ar/servicios/styling-pestanas'
                        )
                      }
                    >
                      MÁS INFO AQUÍ
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() =>
                        openWhatsApp('Quiero consultar sobre LASHES LINE')
                      }
                    >
                      CONSULTA
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'LASHES LINE',
                          serviceKey: 'lashes-line',
                          options: lashesLineOptionsWithIds,
                        });
                        setModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'RESERVAR'}
                    </button>
                  </Box>
                </Box>

                {/* <Box className={classes.optionsSection}>
                  <Text className={classes.optionsTitle}>
                    Seleccioná la opción deseada para solicitar tu cita:
                  </Text>
                  <ServiceAccordion
                    options={lashesLineOptionsWithIds}
                    staffConsultasId={
                      mappedEmployees.get('staff-consultas')?.id ||
                      STAFF_CONSULTAS_ID
                    }
                    meryGarciaId={mappedEmployees.get('mery-garcia')?.id}
                    services={services}
                    employees={employees}
                  />
                </Box> */}
              </Box>
            </FadeInSection>

            {/* PECAS Y LUNARES Section */}
            <FadeInSection direction="up" delay={0.25}>
              <Box id="pecas-lunares" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceThumbnail}>
                      <Image
                        src="/images/web-pecas-1-768x578.webp"
                        alt="Pecas y Lunares"
                        width={100}
                        height={100}
                        className={classes.thumbnailImage}
                      />
                    </Box>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>
                        PECAS Y LUNARES
                      </Text>
                      <Text className={classes.serviceTagline}>
                        Tatuaje superficial hiperrealista. Dura 5-6 meses.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(
                          'https://merygarcia.com.ar/servicios/pecas-lunares'
                        )
                      }
                    >
                      MÁS INFO AQUÍ
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() =>
                        openWhatsApp('Quiero consultar sobre PECAS Y LUNARES')
                      }
                    >
                      CONSULTA
                    </button>
                  </Box>
                </Box>
              </Box>
            </FadeInSection>

            {/* CAMUFLAJE Section */}
            <FadeInSection direction="up" delay={0.3}>
              <Box id="camuflaje" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceThumbnail}>
                      <Image
                        src="/images/camuflaje.webp"
                        alt="Camuflaje"
                        width={100}
                        height={100}
                        className={classes.thumbnailImage}
                      />
                    </Box>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>CAMUFLAJE</Text>
                      <Text className={classes.serviceTagline}>
                        Corrección de trabajos previos de dermopigmentación o
                        microblading.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(
                          'https://merygarcia.com.ar/servicios/camuflaje'
                        )
                      }
                    >
                      MÁS INFO AQUÍ
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() =>
                        openWhatsApp('Quiero consultar sobre CAMUFLAJE')
                      }
                    >
                      CONSULTA
                    </button>
                  </Box>
                </Box>
              </Box>
            </FadeInSection>
          </Container>
        </Box>
      </Box>

      <Footer />

      {/* Modal de Reservas con Stepper */}
      {modalService && (
        <ReservaModal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setModalService(null);
          }}
          serviceName={modalService.serviceName}
          serviceKey={modalService.serviceKey}
          serviceOptions={modalService.options}
          services={services as ServiceEntity[]}
          employees={employees as Employee[]}
          staffConsultasId={staffConsultasId}
          meryGarciaId={meryGarciaId}
        />
      )}
    </>
  );
}
