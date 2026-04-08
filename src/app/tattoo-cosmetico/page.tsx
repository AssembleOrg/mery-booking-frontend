'use client';

import {
  Box,
  Container,
  Text,
  Collapse,
  Select,
  Button,
  Modal,
} from '@mantine/core';
import {
  Header,
  Footer,
  DateTimeSelector,
  BookingConfirmationModal,
  ReservaModal,
  FadeInSection,
} from '@/presentation/components';
import ConsultaModal from '@/presentation/components/ConsultaModal';
import Image from 'next/image';
import { useState, useMemo, useEffect, useRef } from 'react';
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
  EmployeeService,
  type Category,
  type ServiceEntity,
  type Employee,
} from '@/infrastructure/http';
import type { AccordionContentType } from '@/infrastructure/types/services';
import { useAuth } from '@/presentation/contexts';
import { Client } from '@/domain/entities';
import dayjs from 'dayjs';
import classes from './page.module.css';
import { EMPLOYEE_IDS, CATEGORY_IDS } from '@/config/constants';

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
  serviceKey?: string;
  serviceId?: string; // ID del servicio en el backend
  employeeId?: string; // ID del empleado en el backend
  serviceDuration?: number; // Duración del servicio en minutos
  servicePrice?: number; // Precio del servicio en el backend
}

interface AccordionItemProps {
  option: ServiceOption;
  isOpen: boolean;
  onToggle: () => void;
}

type DescriptionBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'divider'; text: string }
  | { kind: 'paragraph'; text: string };

const NANOBLADING_MORE_INFO_URL =
  'https://merygarcia.com.ar/servicios/nanoblading';
const CAMUFLAJE_MORE_INFO_URL =
  'https://merygarcia.com.ar/servicios/nanoblading#camuflaje';

const NANOBLADING_DESCRIPTION_BLOCKS: DescriptionBlock[] = [
  {
    kind: 'paragraph',
    text: 'Es la técnica más avanzada de cosmetic tattoo de cejas. Servicio único y exclusivo brindado por Mery García. Si estás buscando mejorar la forma de tus cejas, completar o rellenar zonas donde no tenés mucho crecimiento, o nada de pelo, o donde haya cicatrices, este servicio es el indicado para vos.',
  },
  {
    kind: 'paragraph',
    text: 'Permite lograr excelentes resultados en todo tipo de pieles, mayor hiper realismo y un acabado imperceptible. Genera menor trauma en la piel, mayor durabilidad y vibración del color. El procedimiento se realiza con máquina a la misma profundidad del Microblading (muy superficial) pero con agujas aún más pequeñas que permiten terminaciones plásticas infinitas (sombras, trazos, ramilletes de pelos, etc.) Recomendamos ésta técnica para casos de alopecias, tricotilomanías, pieles maduras o muy finas, o tratamientos oncológicos. Pero también brinda resultados óptimos en pieles normales sin dificultad de crecimiento y/o con cicatrices.',
  },
  {
    kind: 'paragraph',
    text: 'Más de 10 años de experiencia y perfeccionamientos en Comestic Tattoo dieron por resultado que el último año Mery Garcia utilizara Nanoblading para dar respuesta a todas las personas que buscan mejorar sus cejas a través del tatuaje cosmético.',
  },
  { kind: 'heading', text: 'PROCEDIMIENTO' },
  { kind: 'paragraph', text: 'La primera instancia es la etapa de consulta.' },
  {
    kind: 'paragraph',
    text: 'En la consulta te contamos de qué se trata, cómo se hace, cuánto demora, cuánto dura el efecto y los cuidados previos y posteriores, los cuales son fundamentales.',
  },
  {
    kind: 'paragraph',
    text: 'Despejamos todas tus dudas para que estés bien segura antes de realizarlo.',
  },
  {
    kind: 'paragraph',
    text: 'Junto con Mery definen la forma más natural para tu rostro, el ancho y largo que quieren lograr y en ese momento te las maquilla rellenando las partes que hagan falta, de esa manera tenés una idea aproximada de cómo quedaría.',
  },
  {
    kind: 'paragraph',
    text: 'La consulta es clave para informarte y que sepas los procedimientos, para confirmar que estás apta para realizarlo y que podés respetar las consignas de los cuidados.',
  },
  {
    kind: 'paragraph',
    text: 'Una vez que hayas hecho la consulta y estés decidida, podrás tomar tu primer turno para Nanoblading.',
  },
  {
    kind: 'paragraph',
    text: 'Este se divide en 2 partes: La 1.º sesión y una 2.ª sesión de retoque, ésta se realizará entre los 30 y 60 días (no antes ni después); con el fin de evaluar el trabajo final cicatrizado 100% teniendo en cuenta el resultado y el deseo de la persona.',
  },
  {
    kind: 'paragraph',
    text: 'Pasadas estas dos instancias y cumplidos los tres meses de haber completado el servicio, pasa a considerarse como mantenimiento.',
  },
  {
    kind: 'paragraph',
    text: 'Podrás pedir turno de mantenimiento pasado este tiempo, pero SIEMPRE aconsejamos que hagan una visita para que Mery les dé el ok, ya que muchas veces es el modelado lo que vuelve a darle la forma correcta a las cejas, sin necesidad de realizar Mantenimiento de Nanoblading y así evitar sobre trabajar la zona dejando los trazos compactos y sin gracia, perdiendo por completo la naturalidad del trabajo.',
  },
];

const CAMUFLAJE_DESCRIPTION_BLOCKS: DescriptionBlock[] = [
  {
    kind: 'paragraph',
    text: 'Es un servicio que combina despigmentación, corrección de color, textura y estructura para MEJORAR EL ASPECTO de un trabajo mal hecho o deteriorado tanto de Dermopigmentación como de Microblading. En la etapa de consulta podremos indicarte que tipo de servicio necesitas. Tu consulta con Mery & Staff MG es un tiempo que dedicamos exclusivamente a saldar todas tus dudas. Ese día se te pedirá una seña quedando a cuenta de tu primera sesión de, la misma no es reembolsable y no congela el valor de tu servicio.',
  },
  { kind: 'heading', text: 'PROCEDIMIENTO' },
  { kind: 'paragraph', text: 'La primera instancia es la etapa de consulta.' },
  {
    kind: 'paragraph',
    text: 'En la consulta te contamos de qué se trata, cómo se hace, cuánto demora, los cuidados previos y posteriores, los cuales son fundamentales.',
  },
  {
    kind: 'paragraph',
    text: 'Despejamos todas tus dudas para que estés bien segura antes de realizarlo.',
  },
  {
    kind: 'paragraph',
    text: 'Mery definirá cuál de los tres casos de camuflaje es el tuyo, pudiendo definir la corrección acorde en tu caso puntual. Juntas deciden la forma más natural para tu rostro, el ancho y largo que quieren lograr y en ese momento te las maquilla rellenando las partes que hagan falta, de esa manera tenés una idea aproximada de cómo quedaría.',
  },
  {
    kind: 'paragraph',
    text: 'La consulta es clave para informarte y que sepas los procedimientos, para confirmar que estás apta para realizarlo y que podés respetar las consignas de los cuidados.',
  },
  {
    kind: 'paragraph',
    text: 'Una vez que hayas hecho la consulta y estés decidida, podrás tomar tu primer turno para Camuflaje.',
  },
  {
    kind: 'paragraph',
    text: 'La cantidad de sesiones estará sujeta al criterio de Mery, y a la respuesta de la piel de cada clienta. Una vez hayas finalizado las sesiones de Camuflaje, podrás realizarte Nanoblading para darle la textura deseada a tus cejas.',
  },
  {
    kind: 'paragraph',
    text: 'El costo del servicio incluye el kit de cuidados (agua destilada y jabón neutro).',
  },
  { kind: 'divider', text: '---' },
];

const LIP_BLUSH_MORE_INFO_URL = 'https://merygarcia.com.ar/servicios/lip-blush';
const LIP_CAMOUFLAGE_MORE_INFO_URL =
  'https://merygarcia.com.ar/servicios/lip-blush#lip-camouflage';

const LIP_BLUSH_DESCRIPTION_BLOCKS: DescriptionBlock[] = [
  {
    kind: 'paragraph',
    text: 'Es un servicio de tatuaje cosmético que dura entre 18 y 24 meses. El procedimiento consta de una primera sesión y un retoque para terminar de definir unos labios perfectos a los 30 o 60 días.',
  },
  {
    kind: 'paragraph',
    text: 'Consiste en darle un color a los labios, respetando la colorimetría natural de la persona. No buscamos dar un efecto de maquillaje, sino de boca ruborizada. No da brillo. Sin polvo, sin textura, como si el labio tuviese color 💋🍒.',
  },
  {
    kind: 'paragraph',
    text: 'New service! Are you ready? Lip Blush, semi permanente, labios hiper definidos, sú per natural #ByMeryGarcia bebés✨',
  },
];

const LIP_CAMOUFLAGE_DESCRIPTION_BLOCKS: DescriptionBlock[] = [
  {
    kind: 'paragraph',
    text: 'Es un servicio que combina despigmentación, corrección de color, textura y estructura para MEJORAR EL ASPECTO de un trabajo mal hecho o deteriorado tanto de dermopigmentacion como de un tatuaje de labios de otro lugar.',
  },
  {
    kind: 'paragraph',
    text: 'En la etapa de consulta podremos indicarte que tipo de servicio necesitas para lograr definición y color con acabado híper realista.',
  },
  {
    kind: 'paragraph',
    text: 'Tu consulta con Mery & Staff MG es un tiempo que dedicamos exclusivamente a saldar todas tus dudas. Ese día se te pedirá una seña quedando a cuenta de tu primera sesión de, la misma no es reembolsable y no congela el valor de tu servicio',
  },
  { kind: 'heading', text: 'PROCEDIMIENTO' },
  {
    kind: 'paragraph',
    text: 'La primera instancia es la consulta donde evaluamos el estado actual de la pigmentación. El número de sesiones necesarias dependerá del criterio de Mery y la respuesta de tu piel.',
  },
];

const FRECKLES_MORE_INFO_URL = 'https://merygarcia.com.ar/servicios/pecas-lunares';
const LASH_CAMOUFLAGE_MORE_INFO_URL =
  'https://merygarcia.com.ar/servicios/styling-pestanas#lashes-camouflage';

const FRECKLES_DESCRIPTION_BLOCKS: DescriptionBlock[] = [
  {
    kind: 'paragraph',
    text: 'En el caso de las pecas es una técnica muy novedosa, consta en generar un tatuaje muy superficial por medio de pequeños puntos donde se inserta la tinta y así lograr un efecto híper realista con acabado del tipo peca o lunar.',
  },
  {
    kind: 'paragraph',
    text: 'La durabilidad oscila entre los 5 meses a 6 meses máximo, según el tipo de piel y el cuidado que haya recibido. Finalizado este tiempo la piel queda LIMPIA, sin registro de tinta alguna y sin dejar cicatriz.',
  },
  { kind: 'heading', text: 'Procedimiento' },
  {
    kind: 'paragraph',
    text: 'El día de tu cita, previo a comenzar el trabajo, te contaremos de qué se trata, cómo se hace, cuánto demora, cuál es su valor y los cuidados previos y posteriores, los cuales son fundamentales.',
  },
  {
    kind: 'paragraph',
    text: 'Despejamos todas tus dudas para que estés bien segura antes de realizarlo.',
  },
  {
    kind: 'paragraph',
    text: 'Junto con Mery definen la forma, color y cantidad de pecas o lunares utilizando maquillaje para que de esa manera puedas tener una idea aproximada de cómo quedarían.',
  },
  {
    kind: 'paragraph',
    text: 'Una vez que haya finalizado este espacio de consulta, Mery comenzará a realizarte el servicio.',
  },
];

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

  // Usar el ID proporcionado o el de constantes como fallback
  const effectiveStaffConsultasId = staffConsultasId || EMPLOYEE_IDS.STAFF_CONSULTAS;

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
        paidStatus: 'UNPAID',
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
    if (option.serviceId) {
      setShowCalendar(true);
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
        paidStatus: 'UNPAID',
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
            <span className={classes.depositValue}>
              {(() => {
                const serviceForDeposit = services?.find(
                  (s) => s.id === option.serviceId
                );
                if (serviceForDeposit) {
                  return `AR$ ${Number(serviceForDeposit.price).toLocaleString('es-AR')}.-`;
                }

                return option.depositValue;
              })()}
            </span>
          </>
        )}
      </Text>
      {option.cuotasText && (
        <Text className={classes.panelCuotas}>{option.cuotasText}</Text>
      )}

      {option.promoText && (
        <Text className={classes.promoText}>{option.promoText}</Text>
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
function LastMinuteContent({
  option,
  services,
}: {
  option: ServiceOption;
  services?: ServiceEntity[];
}) {
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
            <span className={classes.depositValue}>
              {(() => {
                const serviceForDeposit = services?.find(
                  (s) => s.id === option.serviceId
                );
                if (serviceForDeposit) {
                  return `AR$ ${Number(serviceForDeposit.price).toLocaleString('es-AR')}.-`;
                }

                return option.depositValue;
              })()}
            </span>
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
        return <LastMinuteContent option={option} services={services} />;
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
    priceEffective: 'U$S 500',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
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
    priceEffective: 'U$S 250',
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
    priceEffective: 'U$S 500',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'nano-6',
    label: 'Last Minute Booking Nanoblading (1ª Sesión)',
    contentType: 'mantenimiento-calendario',
    description:
      'Citas seleccionadas de último momento con 20% off. SOLO PARA 1ª SESIÓN CON CONSULTA PREVIA YA REALIZADA. Entérate antes que nadie a través de nuestro canal de IG: https://www.instagram.com/merygarciaoficial/ Reservá tu cita 20% OFF. La seña NO es reembolsable.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 488.-',
    priceEffective: 'U$S 500',
    depositLabel: ' Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    promoText:
      'Reservá tu cita 20% OFF. SOLO PARA 1ª SESIÓN CON CONSULTA PREVIA YA REALIZADA. La seña NO es reembolsable.',
  },
];

const lipBlushOptions: ServiceOption[] = [
  {
    id: 'lip-1',
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
    id: 'lip-2',
    label: 'Consulta Obligatoria CON trabajo previo (*)',
    contentType: 'consulta-con-trabajo',
    description:
      'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    extraDescription:
      'Se considera trabajo previo a cualquier servicio de Lip Blush o tatuaje de labios que no haya sido realizado por MG & Staff.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    footerNote:
      '(*) Espacio para que conozcas nuestro modo de trabajo, técnica y cuidados que deberás cumplir. Dibujamos los resultados que buscamos y saldamos todas tus dudas.',
    footerNote2: 'Sin consulta previa no podremos brindarte un servicio MG.',
  },
  {
    id: 'lip-3',
    label: '1ª Sesión (By Mery Garcia)',
    contentType: 'sesion-calendario',
    description:
      'Primer experiencia de Lip Blush con nosotras. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 650.-',
    priceEffective: 'U$S 500',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lip-4',
    label: '2ª Sesión - Retoque',
    contentType: 'retoque-calendario',
    description:
      'Completá tu servicio de Lip Blush entre 30 y 60 días después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 317.-',
    priceEffective: 'U$S 250',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lip-5',
    label: 'Mantenimiento',
    contentType: 'mantenimiento-calendario',
    description:
      'Reactiva tu servicio de Lip Blush. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 650.-',
    priceEffective: 'U$S 500',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lip-6',
    label: 'Last Minute Booking Lip Blush (1ª Sesión)',
    contentType: 'mantenimiento-calendario',
    description:
      'Citas seleccionadas de último momento con 20% off. SOLO PARA 1ª SESIÓN CON CONSULTA PREVIA YA REALIZADA. Reservá tu cita 20% OFF. La seña NO es reembolsable.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 520.-',
    priceEffective: 'U$S 500',
    depositLabel: ' Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    promoText:
      'Reservá tu cita 20% OFF. SOLO PARA 1ª SESIÓN CON CONSULTA PREVIA YA REALIZADA. La seña NO es reembolsable.',
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
    priceValue: 'U$S 680.-',
    priceEffective: 'U$S 550',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 200.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
];

const lashesLineOptions: ServiceOption[] = [
  {
    id: 'lash-1',
    label: 'Consulta previa',
    contentType: 'consulta-con-trabajo',
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
      'Primer experiencia de Lash Line con nosotras. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 480.-',
    priceEffective: 'U$S 380',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lash-3',
    label: '2ª Sesión - Retoque',
    contentType: 'retoque-calendario',
    description:
      'Completá tu servicio de Lash Line entre 30 y 60 días después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 317.-',
    priceEffective: 'U$S 250',
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
      'Reactiva tu servicio de Lash Line. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 480.-',
    priceEffective: 'U$S 380',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  {
    id: 'lash-5',
    label: 'Last Minute Booking Lash Line (1ª Sesión)',
    contentType: 'mantenimiento-calendario',
    description:
      'Citas seleccionadas de último momento con 20% off. SOLO PARA 1ª SESIÓN CON CONSULTA PREVIA YA REALIZADA. Reservá tu cita 20% OFF. La seña NO es reembolsable.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 384.-',
    priceEffective: 'U$S 380',
    depositLabel: ' Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    promoText:
      'Reservá tu cita 20% OFF. SOLO PARA 1ª SESIÓN CON CONSULTA PREVIA YA REALIZADA. La seña NO es reembolsable.',
  },
];

const lashCamouflageOptions: ServiceOption[] = [
  {
    id: 'lashcam-1',
    label: 'Consulta Obligatoria (*)',
    contentType: 'consulta-con-trabajo',
    description:
      'Tu consulta con Mery & Staff MG es un tiempo que dedicamos exclusivamente a saldar todas tus dudas. Ese día se te pedirá una seña quedando a cuenta de tu primera sesión, la misma no es reembolsable y no congela el valor de tu servicio.',
    priceLabel: 'Precio de la consulta:',
    priceValue: 'AR$ 50.000.-',
    footerNote: '(*) En la etapa de consulta podremos indicarte qué tipo de servicio necesitas para lograr más realismo y elegancia.',
    footerNote2: 'Sin consulta previa no podremos brindarte un servicio MG.',
  },
  {
    id: 'lashcam-2',
    label: '1ª Sesión (By Mery Garcia)',
    contentType: 'sesion-calendario',
    description:
      'Es un servicio que combina despigmentación, corrección de color, textura y estructura para MEJORAR EL ASPECTO de un trabajo mal hecho o deteriorado tanto de dermopigmentación como de un tatuaje de otro lugar.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 680.-',
    priceEffective: 'U$S 250',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
];

const pecasLunaresOptions: ServiceOption[] = [
  {
    id: 'pecas-1',
    label: 'Consulta Obligatoria',
    contentType: 'consulta-sin-trabajo',
    description:
      'Consulta previa para evaluar tu piel y diseñar el patrón de pecas ideal para ti.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
  },
];

const camouflageOptions: ServiceOption[] = [
  {
    id: 'camuflaje-1',
    label: 'Consulta Obligatoria SIN trabajo previo (*)',
    contentType: 'consulta-sin-trabajo',
    description:
      'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    footerNote:
      '(*) Espacio para que conozcas nuestro modo de trabajo, técnica y cuidados que deberás cumplir. Evaluamos el trabajo previo a corregir y planificamos el proceso de camuflaje.',
    footerNote2: 'Sin consulta previa no podremos brindarte un servicio MG.',
  },
  {
    id: 'camuflaje-2',
    label: 'Consulta Obligatoria CON trabajo previo (*)',
    contentType: 'consulta-con-trabajo',
    description:
      'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    extraDescription:
      'Se considera trabajo previo a cualquier servicio de dermopigmentación, microblading o tatuaje cosmético en cejas que no haya sido realizado por MG & Staff.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    footerNote:
      '(*) Espacio para que conozcas nuestro modo de trabajo, técnica y cuidados que deberás cumplir. Evaluamos el trabajo previo a corregir y planificamos el proceso de camuflaje.',
    footerNote2: 'Sin consulta previa no podremos brindarte un servicio MG.',
  },
  {
    id: 'camuflaje-3',
    label: '1ª Sesión (By Mery Garcia)',
    contentType: 'sesion-calendario',
    description:
      'Primera sesión de corrección y camuflaje de trabajos previos en cejas. El proceso puede requerir múltiples sesiones dependiendo del estado del trabajo a corregir.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 710.-',
    priceEffective: 'U$S 550',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  // COMENTADO: El servicio "Camuflaje de Cejas [Mantenimiento]" NO existe en el backend
  // Se puede descomentar cuando se cree el servicio correspondiente
  /*
  {
    id: 'camuflaje-5',
    label: 'Mantenimiento (By Mery Garcia)',
    contentType: 'mantenimiento-calendario',
    description:
      'Reactiva tu servicio de Camuflaje. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 600.-',
    priceEffective: 'U$S 420.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText:
      'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  */
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
  'lashes-line': ['lashes line', 'lashesline', 'lashes-line', 'lash line'],
  camuflaje: ['brow camouflage', 'camuflaje de cejas', 'camuflaje cejas', 'camuflaje'],
  'lash-camouflage': ['lash camouflage', 'lashcamouflage', 'lash-camouflage'],
  'pecas-lunares': ['pecas', 'lunares', 'freckles', 'pecas y lunares'],
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

// Fallback estático de empleados (se crea una sola vez para evitar re-renders infinitos)
const FALLBACK_EMPLOYEES: Employee[] = [
  {
    id: EMPLOYEE_IDS.STAFF_CONSULTAS,
    fullName: 'Staff Consultas',
    email: 'info6@merygarcia.com.ar',
    phone: '+541145303203',
    createdAt: '2026-01-30T00:00:00.000Z',
    updatedAt: '2026-01-30T00:00:00.000Z',
  },
  {
    id: EMPLOYEE_IDS.MERY_GARCIA,
    fullName: 'Mery Garcia',
    email: 'info@merygarcia.com.ar',
    phone: '+541145303203',
    createdAt: '2026-01-30T00:00:00.000Z',
    updatedAt: '2026-01-30T00:00:00.000Z',
  },
];

export default function TattooCosmeticoPage() {
  const { isAuthenticated } = useAuth();
  const stickyNavRef = useRef<HTMLDivElement | null>(null);
  const [nanobladingDescriptionOpened, { open: openNanobladingDescription, close: closeNanobladingDescription }] =
    useDisclosure(false);
  const [camuflajeDescriptionOpened, { open: openCamuflajeDescription, close: closeCamuflajeDescription }] =
    useDisclosure(false);
  const [lipBlushDescriptionOpened, { open: openLipBlushDescription, close: closeLipBlushDescription }] =
    useDisclosure(false);
  const [lipCamouflageDescriptionOpened, { open: openLipCamouflageDescription, close: closeLipCamouflageDescription }] =
    useDisclosure(false);
  const [frecklesDescriptionOpened, { open: openFrecklesDescription, close: closeFrecklesDescription }] =
    useDisclosure(false);

  // Inicializar con el ID de constantes para que los hooks se ejecuten inmediatamente
  const [cosmeticTattooCategoryId, setCosmeticTattooCategoryId] =
    useState<string>(CATEGORY_IDS.TATTOO_COSMETICO);
  const [mappedServices, setMappedServices] = useState<
    Map<string, ServiceEntity>
  >(new Map());
  const [mappedEmployees, setMappedEmployees] = useState<Map<string, Employee>>(
    new Map()
  );
  // Mapa de serviceId → Employee[] (todos los empleados asignados a ese servicio, via API)
  const [serviceEmployees, setServiceEmployees] = useState<Map<string, Employee[]>>(new Map());

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

  // Fallback simple sin useMemo (evita re-renders infinitos)
  const employeesWithFallback = employees.length > 0 ? employees : FALLBACK_EMPLOYEES;

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

      // Para Lash Line: buscar "Lashes Line [1° Sesión]"
      const lashesLineService =
        services.find(
          (s) =>
            s.showOnSite &&
            s.name.toLowerCase().includes('lashes line') &&
            s.name.toLowerCase().includes('1° sesión')
        ) || findServiceByName(services, 'lashes-line');

      const camuflajeService =
        services.find(
          (s) =>
            s.showOnSite &&
            s.name.toLowerCase().includes('brow camouflage') &&
            (s.name.toLowerCase().includes('sesi') || s.name.toLowerCase().includes('1'))
        ) ||
        services.find(
          (s) =>
            s.showOnSite &&
            s.name.toLowerCase().includes('camuflaje') &&
            s.name.toLowerCase().includes('1')
        ) ||
        findServiceByName(services, 'camuflaje');

      // Para Lash Camouflage: buscar "Lash Camouflaje 1° Sesión (By Mery García)"
      // Nota: el nombre en el backend tiene typo "Camouflaje" con j
      const lashCamouflageService =
        services.find(
          (s) =>
            s.showOnSite &&
            (s.name.toLowerCase().includes('lash camouflaje') ||
              s.name.toLowerCase().includes('lash camouflage')) &&
            s.name.toLowerCase().includes('sesión')
        ) || findServiceByName(services, 'lash-camouflage');

      if (nanobladingService) serviceMap.set('nanoblading', nanobladingService);
      if (lipBlushService) serviceMap.set('lip-blush', lipBlushService);
      if (lipCamouflageService)
        serviceMap.set('lip-camouflage', lipCamouflageService);
      if (lashesLineService) serviceMap.set('lashes-line', lashesLineService);
      if (camuflajeService) serviceMap.set('camuflaje', camuflajeService);
      if (lashCamouflageService)
        serviceMap.set('lash-camouflage', lashCamouflageService);

      setMappedServices(serviceMap);
    }
  }, [services]);

  useEffect(() => {
    if (employeesWithFallback.length > 0) {
      const employeeMap = new Map<string, Employee>();

      // Mapear empleados
      const meryGarcia = findEmployeeByName(employeesWithFallback, 'mery-garcia');
      const staffMg = findEmployeeByName(employeesWithFallback, 'staff-mg');
      // Buscar "Staff Consultas" específicamente - búsqueda flexible
      const staffConsultas = employeesWithFallback.find((e) => {
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
      } else {
        // Usar ID de constantes como fallback si no se encuentra en la lista
        const staffConsultasFallback: Employee = {
          id: EMPLOYEE_IDS.STAFF_CONSULTAS,
          fullName: 'Staff Consultas',
          email: 'info6@merygarcia.com.ar',
          phone: '+541145303203',
          createdAt: '',
          updatedAt: '',
        };
        employeeMap.set('staff-consultas', staffConsultasFallback);
      }

      setMappedEmployees(employeeMap);
    }
  }, [employeesWithFallback]);

  // Resolver los empleados asignados a CADA servicio via API.
  // Evita búsqueda por nombre (fragile con duplicados o renombres).
  useEffect(() => {
    if (services.length === 0 || !cosmeticTattooCategoryId) return;

    const visibleServices = services.filter((s) => s.showOnSite);
    if (visibleServices.length === 0) return;

    const resolveServiceEmployees = async () => {
      const newMap = new Map<string, Employee[]>();
      await Promise.all(
        visibleServices.map(async (service) => {
          try {
            const assigned = await EmployeeService.getAllPublic(
              cosmeticTattooCategoryId,
              service.id
            );
            if (assigned.length > 0) {
              newMap.set(service.id, assigned as Employee[]);
            }
          } catch (error) {
            console.error(`Error resolviendo empleados para servicio ${service.name}:`, error);
          }
        })
      );
      setServiceEmployees(newMap);
    };

    resolveServiceEmployees();
  }, [services, cosmeticTattooCategoryId]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight =
        document.querySelector('header')?.getBoundingClientRect().height ?? 0;
      const stickyNavHeight =
        stickyNavRef.current?.getBoundingClientRect().height ?? 0;
      const extraSpacing = 12;
      const topOffset = headerHeight + stickyNavHeight + extraSpacing;
      const targetY = element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({ top: Math.max(0, targetY - topOffset), behavior: 'smooth' });
    }
  };

  // Al montar, hacer scroll al anchor si viene en la URL
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const sectionId = hash.slice(1);
    const timer = setTimeout(() => {
      scrollToSection(sectionId);
    }, 300);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    return baseOptions.map((option) => {
      const optionWithKey = { ...option, serviceKey };
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
        } else if (serviceKey === 'lip-blush') {
          if (option.contentType === 'consulta-sin-trabajo') {
            // Buscar: "Lip Blush [Consulta obligatoria] SIN trabajo previo"
            consultaService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('lip blush') &&
                nameLower.includes('consulta') &&
                nameLower.includes('sin trabajo previo')
              );
            });
          } else if (option.contentType === 'consulta-con-trabajo') {
            // Buscar: "Lip Blush [Consulta Obligatoria] CON trabajo previo"
            consultaService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('lip blush') &&
                nameLower.includes('consulta') &&
                nameLower.includes('con trabajo previo')
              );
            });
          }
        } else if (serviceKey === 'camuflaje') {
          if (option.contentType === 'consulta-sin-trabajo') {
            // Buscar: "Brow Camouflage [Consulta obligatoria] SIN trabajo previo"
            consultaService =
              allServices.find((s) => {
                const nameLower = s.name.toLowerCase();
                return (
                  s.showOnSite &&
                  nameLower.includes('brow camouflage') &&
                  nameLower.includes('consulta') &&
                  nameLower.includes('sin trabajo previo')
                );
              }) ||
              allServices.find((s) => {
                const nameLower = s.name.toLowerCase();
                return (
                  s.showOnSite &&
                  nameLower.includes('camuflaje') &&
                  nameLower.includes('cejas') &&
                  nameLower.includes('consulta') &&
                  nameLower.includes('sin trabajo previo')
                );
              });
          } else if (option.contentType === 'consulta-con-trabajo') {
            // Buscar: "Brow Camouflage [Consulta Obligatoria] CON trabajo previo"
            consultaService =
              allServices.find((s) => {
                const nameLower = s.name.toLowerCase();
                return (
                  s.showOnSite &&
                  nameLower.includes('brow camouflage') &&
                  nameLower.includes('consulta') &&
                  nameLower.includes('con trabajo previo')
                );
              }) ||
              allServices.find((s) => {
                const nameLower = s.name.toLowerCase();
                return (
                  s.showOnSite &&
                  nameLower.includes('camuflaje') &&
                  nameLower.includes('cejas') &&
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
        } else if (serviceKey === 'lash-camouflage') {
          // Buscar: "Lash Camouflage Consulta Previa"
          consultaService = allServices.find((s) => {
            const nameLower = s.name.toLowerCase();
            return (
              s.showOnSite &&
              nameLower.includes('lash camouflage') &&
              nameLower.includes('consulta')
            );
          });
        } else if (serviceKey === 'lashes-line') {
          // Buscar: "Lashes Line [Consulta opcional]"
          consultaService = allServices.find((s) => {
            const nameLower = s.name.toLowerCase();
            return (
              s.showOnSite &&
              (nameLower.includes('lashes line') || nameLower.includes('lash line')) &&
              nameLower.includes('consulta')
            );
          });
        } else if (serviceKey === 'pecas-lunares') {
          // Buscar: "Pecas y Lunares Consulta"
          consultaService = allServices.find((s) => {
            const nameLower = s.name.toLowerCase();
            return (
              s.showOnSite &&
              (nameLower.includes('pecas') || nameLower.includes('freckles')) &&
              nameLower.includes('consulta')
            );
          });
        }

        // Usar el empleado asignado al servicio específico via API
        const resolvedEmployeeId = consultaService?.id
          ? serviceEmployees.get(consultaService.id)?.[0]?.id
          : undefined;

        return {
          ...optionWithKey,
          serviceId: consultaService?.id,
          employeeId: resolvedEmployeeId,
          serviceDuration: consultaService?.duration || 60,
          servicePrice: consultaService?.price,
        };
      }

      // Para servicios con calendario, usar el servicio mapeado y Mery Garcia
      if (
        option.contentType === 'sesion-calendario' ||
        option.contentType === 'retoque-calendario' ||
        option.contentType === 'mantenimiento-calendario'
      ) {
        // Manejo especial para servicios Last Minute Booking
        if (option.label.includes('Last Minute Booking')) {
          let lastMinuteService: ServiceEntity | undefined;

          if (option.label.includes('Nanoblading')) {
            lastMinuteService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('last minute booking nanoblading')
              );
            });
          } else if (option.label.includes('Lip Blush')) {
            lastMinuteService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('last minute booking lip blush')
              );
            });
          } else if (option.label.includes('Lash Line')) {
            lastMinuteService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('last minute booking lashes line')
              );
            });
          }

          return {
            ...optionWithKey,
            serviceId: lastMinuteService?.id,
            employeeId: lastMinuteService?.id
              ? serviceEmployees.get(lastMinuteService.id)?.[0]?.id
              : undefined,
            serviceDuration: lastMinuteService?.duration || 60,
            servicePrice: lastMinuteService?.price,
          };
        }

        // Manejo especial para servicios de Mantenimiento regular (no Last Minute)
        if (
          option.label.includes('Mantenimiento') &&
          !option.label.includes('Last Minute')
        ) {
          let maintenanceService: ServiceEntity | undefined;

          if (serviceKey === 'nanoblading') {
            maintenanceService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('nanoblading') &&
                nameLower.includes('mantenimiento') &&
                nameLower.includes('mery garcia') &&
                !nameLower.includes('last minute')
              );
            });
          } else if (serviceKey === 'lip-blush') {
            maintenanceService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('lip blush') &&
                nameLower.includes('mantenimiento') &&
                !nameLower.includes('last minute')
              );
            });
          } else if (serviceKey === 'lashes-line') {
            maintenanceService = allServices.find((s) => {
              const nameLower = s.name.toLowerCase();
              return (
                s.showOnSite &&
                nameLower.includes('lashes line') &&
                nameLower.includes('mantenimiento') &&
                !nameLower.includes('last minute')
              );
            });
          }

          return {
            ...optionWithKey,
            serviceId: maintenanceService?.id,
            employeeId: maintenanceService?.id
              ? serviceEmployees.get(maintenanceService.id)?.[0]?.id
              : undefined,
            serviceDuration: maintenanceService?.duration || 60,
            servicePrice: maintenanceService?.price,
          };
        }

        return {
          ...optionWithKey,
          serviceId: service?.id,
          employeeId: service?.id
            ? serviceEmployees.get(service.id)?.[0]?.id
            : undefined,
          serviceDuration: service?.duration,
          servicePrice: service?.price,
        };
      }

      return optionWithKey;
    });
  };

  // Opciones con IDs mapeados - solo ejecutar cuando los servicios estén cargados
  const nanobladingOptionsWithIds = useMemo(() => {
    if (services.length === 0) return nanobladingOptions;
    return getOptionsWithIds(nanobladingOptions, 'nanoblading', services);
  }, [mappedServices, mappedEmployees, services, serviceEmployees]);

  const lipBlushOptionsWithIds = useMemo(() => {
    if (services.length === 0) return lipBlushOptions;
    return getOptionsWithIds(lipBlushOptions, 'lip-blush', services);
  }, [mappedServices, mappedEmployees, services, serviceEmployees]);

  const lipCamouflageOptionsWithIds = useMemo(() => {
    if (services.length === 0) return lipCamouflageOptions;
    return getOptionsWithIds(lipCamouflageOptions, 'lip-camouflage', services);
  }, [mappedServices, mappedEmployees, services, serviceEmployees]);

  const lashesLineOptionsWithIds = useMemo(() => {
    if (services.length === 0) return lashesLineOptions;
    return getOptionsWithIds(lashesLineOptions, 'lashes-line', services);
  }, [mappedServices, mappedEmployees, services, serviceEmployees]);

  const lashCamouflageOptionsWithIds = useMemo(() => {
    if (services.length === 0) return lashCamouflageOptions;
    return getOptionsWithIds(lashCamouflageOptions, 'lash-camouflage', services);
  }, [mappedServices, mappedEmployees, services, serviceEmployees]);

  const camouflageOptionsWithIds = useMemo(() => {
    if (services.length === 0) return camouflageOptions;
    return getOptionsWithIds(camouflageOptions, 'camuflaje', services);
  }, [mappedServices, mappedEmployees, services, serviceEmployees]);

  // IDs de empleados para modal de reservas (fallback para props del modal)
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

  // Estado para modal de consultas
  const [consultaModalOpened, setConsultaModalOpened] = useState(false);
  const [consultaService, setConsultaService] = useState<{
    serviceName: string;
    serviceKey: string;
    consultaOptions: ServiceOption[];
  } | null>(null);

  return (
    <>
      <Modal
        opened={nanobladingDescriptionOpened}
        onClose={closeNanobladingDescription}
        centered
        size="lg"
        radius="md"
        keepMounted
        title="NANOBLADING"
        classNames={{
          content: classes.descriptionModalContent,
          header: classes.descriptionModalHeader,
          title: classes.descriptionModalTitle,
          body: classes.descriptionModalBody,
        }}
      >
        {NANOBLADING_DESCRIPTION_BLOCKS.map((block, index) => {
          if (block.kind === 'heading') {
            return (
              <Text key={index} className={classes.descriptionModalHeading}>
                {block.text}
              </Text>
            );
          }

          if (block.kind === 'divider') {
            return (
              <Text key={index} className={classes.descriptionModalDivider}>
                {block.text}
              </Text>
            );
          }

          return (
            <Text key={index} className={classes.descriptionModalText}>
              {block.text}
            </Text>
          );
        })}
        <div className={classes.descriptionModalActions}>
          <button
            type="button"
            className={classes.descriptionModalMoreButton}
            onClick={() => openExternalLink(NANOBLADING_MORE_INFO_URL)}
          >
            VER MÁS
          </button>
        </div>
      </Modal>
      <Modal
        opened={camuflajeDescriptionOpened}
        onClose={closeCamuflajeDescription}
        centered
        size="lg"
        radius="md"
        keepMounted
        title="CAMUFLAJE"
        classNames={{
          content: classes.descriptionModalContent,
          header: classes.descriptionModalHeader,
          title: classes.descriptionModalTitle,
          body: classes.descriptionModalBody,
        }}
      >
        {CAMUFLAJE_DESCRIPTION_BLOCKS.map((block, index) => {
          if (block.kind === 'heading') {
            return (
              <Text key={index} className={classes.descriptionModalHeading}>
                {block.text}
              </Text>
            );
          }

          if (block.kind === 'divider') {
            return (
              <Text key={index} className={classes.descriptionModalDivider}>
                {block.text}
              </Text>
            );
          }

          return (
            <Text key={index} className={classes.descriptionModalText}>
              {block.text}
            </Text>
          );
        })}
        <div className={classes.descriptionModalActions}>
          <button
            type="button"
            className={classes.descriptionModalMoreButton}
            onClick={() => openExternalLink(CAMUFLAJE_MORE_INFO_URL)}
          >
            VER MÁS
          </button>
        </div>
      </Modal>
      <Modal
        opened={lipBlushDescriptionOpened}
        onClose={closeLipBlushDescription}
        centered
        size="lg"
        radius="md"
        keepMounted
        title="LIP BLUSH"
        classNames={{
          content: classes.descriptionModalContent,
          header: classes.descriptionModalHeader,
          title: classes.descriptionModalTitle,
          body: classes.descriptionModalBody,
        }}
      >
        {LIP_BLUSH_DESCRIPTION_BLOCKS.map((block, index) => (
          <Text key={index} className={classes.descriptionModalText}>
            {block.text}
          </Text>
        ))}
        <div className={classes.descriptionModalActions}>
          <button
            type="button"
            className={classes.descriptionModalMoreButton}
            onClick={() => openExternalLink(LIP_BLUSH_MORE_INFO_URL)}
          >
            VER MÁS
          </button>
        </div>
      </Modal>
      <Modal
        opened={lipCamouflageDescriptionOpened}
        onClose={closeLipCamouflageDescription}
        centered
        size="lg"
        radius="md"
        keepMounted
        title="LIP CAMOUFLAGE"
        classNames={{
          content: classes.descriptionModalContent,
          header: classes.descriptionModalHeader,
          title: classes.descriptionModalTitle,
          body: classes.descriptionModalBody,
        }}
      >
        {LIP_CAMOUFLAGE_DESCRIPTION_BLOCKS.map((block, index) => {
          if (block.kind === 'heading') {
            return (
              <Text key={index} className={classes.descriptionModalHeading}>
                {block.text}
              </Text>
            );
          }

          return (
            <Text key={index} className={classes.descriptionModalText}>
              {block.text}
            </Text>
          );
        })}
        <div className={classes.descriptionModalActions}>
          <button
            type="button"
            className={classes.descriptionModalMoreButton}
            onClick={() => openExternalLink(LIP_CAMOUFLAGE_MORE_INFO_URL)}
          >
            VER MÁS
          </button>
        </div>
      </Modal>
      <Modal
        opened={frecklesDescriptionOpened}
        onClose={closeFrecklesDescription}
        centered
        size="lg"
        radius="md"
        keepMounted
        title="Freckles & Beauty Mark"
        classNames={{
          content: classes.descriptionModalContent,
          header: classes.descriptionModalHeader,
          title: classes.descriptionModalTitle,
          body: classes.descriptionModalBody,
        }}
      >
        {FRECKLES_DESCRIPTION_BLOCKS.map((block, index) => {
          if (block.kind === 'heading') {
            return (
              <Text key={index} className={classes.descriptionModalHeading}>
                {block.text}
              </Text>
            );
          }

          return (
            <Text key={index} className={classes.descriptionModalText}>
              {block.text}
            </Text>
          );
        })}
        <div className={classes.descriptionModalActions}>
          <button
            type="button"
            className={classes.descriptionModalMoreButton}
            onClick={() => openExternalLink(FRECKLES_MORE_INFO_URL)}
          >
            VER MÁS
          </button>
        </div>
      </Modal>
      <Header />

      <Box className={classes.pageWrapper}>
        {/* Sub Menu Navigation - STICKY */}
        <Box ref={stickyNavRef} className={classes.subMenuNav}>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('nanoblading')}
          >
            <span>NANOBLADING</span>
          </Box>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('camuflaje')}
          >
            <span>BROW CAMOUFLAGE</span>
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
            <span>LASH LINE</span>
          </Box>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('lash-camouflage')}
          >
            <span>LASH CAMOUFLAGE</span>
          </Box>
          <Box
            className={classes.subMenuItem}
            onClick={() => scrollToSection('pecas-lunares')}
          >
            <span>FRECKLES</span>
          </Box>
        </Box>

        {/* Content Section */}
        <Box id="consultas" className={classes.contentSection}>
          <Container size="xl">
            {/* NANOBLADING Section */}
            <FadeInSection direction="up" delay={0}>
              <Box id="nanoblading" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>NANOBLADING</Text>
                      <Text className={classes.serviceTagline}>
                        Última técnica de Cosmetic Tattoo para lograr cejas
                        híper realistas
                      </Text>
                      <Text className={classes.serviceConsultationNotice}>
                        Reserva consulta si no tenes tatuaje previo.
                      </Text>
                      <button
                        type="button"
                        className={classes.descriptionButton}
                        onClick={openNanobladingDescription}
                      >
                        VER DESCRIPCIÓN COMPLETA
                      </button>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(NANOBLADING_MORE_INFO_URL)
                      }
                    >
                      MÁS INFO
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'NANOBLADING',
                          serviceKey: 'nanoblading',
                          consultaOptions: nanobladingOptionsWithIds.filter(
                            (opt) =>
                              opt.contentType === 'consulta-sin-trabajo' ||
                              opt.contentType === 'consulta-con-trabajo'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'Consulta Obligatoria'}
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        const sessionOptions = nanobladingOptionsWithIds.filter(
                          (opt) =>
                            opt.contentType !== 'consulta-sin-trabajo' &&
                            opt.contentType !== 'consulta-con-trabajo'
                        );

                        setModalService({
                          serviceName: 'NANOBLADING',
                          serviceKey: 'nanoblading',
                          options: sessionOptions,
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
                     Seleccioná la opción deseada para más información.
                  </Text>
                  <ServiceAccordion
                    options={nanobladingOptionsWithIds}
                    staffConsultasId={
                      mappedEmployees.get('staff-consultas')?.id ||
                      STAFF_CONSULTAS_ID
                    }
                    meryGarciaId={mappedEmployees.get('mery-garcia')?.id}
                    services={services}
                    employees={employeesWithFallback}
                  />
                </Box> */}
              </Box>
            </FadeInSection>

            {/* BROW CAMOUFLAGE Section */}
            <FadeInSection direction="up" delay={0.05}>
              <Box id="camuflaje" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>BROW CAMOUFLAGE</Text>
                      <Text className={classes.serviceTagline}>
                        Corrección de trabajos previos de dermopigmentación o
                        microblading.
                      </Text>
                      <button
                        type="button"
                        className={classes.descriptionButton}
                        onClick={openCamuflajeDescription}
                      >
                        VER DESCRIPCIÓN COMPLETA
                      </button>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(CAMUFLAJE_MORE_INFO_URL)
                      }
                    >
                      MÁS INFO
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'BROW CAMOUFLAGE',
                          serviceKey: 'camuflaje',
                          consultaOptions: camouflageOptionsWithIds.filter(
                            (opt) =>
                              opt.contentType === 'consulta-sin-trabajo' ||
                              opt.contentType === 'consulta-con-trabajo'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'Consulta Obligatoria'}
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        const sessionOptions = camouflageOptionsWithIds.filter(
                          (opt) =>
                            opt.contentType !== 'consulta-sin-trabajo' &&
                            opt.contentType !== 'consulta-con-trabajo'
                        );
                        setModalService({
                          serviceName: 'BROW CAMOUFLAGE',
                          serviceKey: 'camuflaje',
                          options: sessionOptions,
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
              </Box>
            </FadeInSection>

            {/* LIP BLUSH Section */}
            <FadeInSection direction="up" delay={0.1}>
              <Box id="lip-blush" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>LIP BLUSH</Text>
                      <Text className={classes.serviceTagline}>
                        Cosmetic Tattoo en labios para mas definicion con
                        acabado híper realista.
                      </Text>
                      <button
                        type="button"
                        className={classes.descriptionButton}
                        onClick={openLipBlushDescription}
                      >
                        VER DESCRIPCIÓN COMPLETA
                      </button>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() => openExternalLink(LIP_BLUSH_MORE_INFO_URL)}
                    >
                      MÁS INFO
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'LIP BLUSH',
                          serviceKey: 'lip-blush',
                          consultaOptions: lipBlushOptionsWithIds.filter(
                            (opt) =>
                              opt.contentType === 'consulta-sin-trabajo' ||
                              opt.contentType === 'consulta-con-trabajo'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'Consulta Obligatoria'}
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        const sessionOptions = lipBlushOptionsWithIds.filter(
                          (opt) =>
                            opt.contentType !== 'consulta-sin-trabajo' &&
                            opt.contentType !== 'consulta-con-trabajo'
                        );
                        setModalService({
                          serviceName: 'LIP BLUSH',
                          serviceKey: 'lip-blush',
                          options: sessionOptions,
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
                     Seleccioná la opción deseada para más información.
                  </Text>
                  <ServiceAccordion
                    options={lipBlushOptionsWithIds}
                    staffConsultasId={
                      mappedEmployees.get('staff-consultas')?.id ||
                      STAFF_CONSULTAS_ID
                    }
                    meryGarciaId={mappedEmployees.get('mery-garcia')?.id}
                    services={services}
                    employees={employeesWithFallback}
                  />
                </Box> */}
              </Box>
            </FadeInSection>

            {/* LIP CAMOUFLAGE Section */}
            <FadeInSection direction="up" delay={0.15}>
              <Box id="lip-camouflage" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>
                        LIP CAMOUFLAGE
                      </Text>
                      <Text className={classes.serviceTagline}>
                        Corrección de trabajos previos mal realizados o
                        deteriorados.
                      </Text>
                      <button
                        type="button"
                        className={classes.descriptionButton}
                        onClick={openLipCamouflageDescription}
                      >
                        VER DESCRIPCIÓN COMPLETA
                      </button>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(LIP_CAMOUFLAGE_MORE_INFO_URL)
                      }
                    >
                      MÁS INFO
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'LIP CAMOUFLAGE',
                          serviceKey: 'lip-camouflage',
                          consultaOptions: lipCamouflageOptionsWithIds.filter(
                            (opt) => opt.id === 'lipcam-1'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'CONSULTA'}
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'LIP CAMOUFLAGE',
                          serviceKey: 'lip-camouflage',
                          options: lipCamouflageOptionsWithIds.filter(
                            (opt) => opt.id !== 'lipcam-1'
                          ),
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
                     Seleccioná la opción deseada para más información.
                  </Text>
                  <ServiceAccordion
                    options={lipCamouflageOptionsWithIds}
                    staffConsultasId={
                      mappedEmployees.get('staff-consultas')?.id ||
                      STAFF_CONSULTAS_ID
                    }
                    meryGarciaId={mappedEmployees.get('mery-garcia')?.id}
                    services={services}
                    employees={employeesWithFallback}
                  />
                </Box> */}
              </Box>
            </FadeInSection>

            {/* LASH LINE Section */}
            <FadeInSection direction="up" delay={0.2}>
              <Box id="lashes-line" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>LASH LINE</Text>
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
                      MÁS INFO
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'LASH LINE',
                          serviceKey: 'lashes-line',
                          consultaOptions: lashesLineOptionsWithIds.filter(
                            (opt) => opt.id === 'lash-1'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'CONSULTA'}
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'LASH LINE',
                          serviceKey: 'lashes-line',
                          options: lashesLineOptionsWithIds.filter(
                            (opt) => opt.id !== 'lash-1'
                          ),
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
                     Seleccioná la opción deseada para más información.
                  </Text>
                  <ServiceAccordion
                    options={lashesLineOptionsWithIds}
                    staffConsultasId={
                      mappedEmployees.get('staff-consultas')?.id ||
                      STAFF_CONSULTAS_ID
                    }
                    meryGarciaId={mappedEmployees.get('mery-garcia')?.id}
                    services={services}
                    employees={employeesWithFallback}
                  />
                </Box> */}
              </Box>
            </FadeInSection>

            {/* LASH CAMOUFLAGE Section */}
            <FadeInSection direction="up" delay={0.25}>
              <Box id="lash-camouflage" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>LASH CAMOUFLAGE</Text>
                      <Text className={classes.serviceTagline}>
                        Corrección de trabajos previos en pestañas.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() => openExternalLink(LASH_CAMOUFLAGE_MORE_INFO_URL)}
                    >
                      MÁS INFO
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'LASH CAMOUFLAGE',
                          serviceKey: 'lash-camouflage',
                          consultaOptions: lashCamouflageOptionsWithIds.filter(
                            (opt) => opt.id === 'lashcam-1'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'Consulta Obligatoria'}
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'LASH CAMOUFLAGE',
                          serviceKey: 'lash-camouflage',
                          options: lashCamouflageOptionsWithIds.filter(
                            (opt) => opt.id !== 'lashcam-1'
                          ),
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
              </Box>
            </FadeInSection>

            {/* PECAS Y LUNARES Section */}
            <FadeInSection direction="up" delay={0.3}>
              <Box id="pecas-lunares" className={classes.serviceBlock}>
                <Box className={classes.serviceLayout}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.serviceTitle}>
                        Freckles & Beauty Mark
                      </Text>
                      <Text className={classes.serviceTagline}>
                        Cosmetic Tattoo con acabado híper realista. Dura 5-6
                        meses
                      </Text>
                      <button
                        type="button"
                        className={classes.descriptionButton}
                        onClick={openFrecklesDescription}
                      >
                        VER DESCRIPCIÓN COMPLETA
                      </button>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButton}
                      onClick={() =>
                        openExternalLink(FRECKLES_MORE_INFO_URL)
                      }
                    >
                      MÁS INFO
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'Freckles & Beauty Mark',
                          serviceKey: 'pecas-lunares',
                          consultaOptions: pecasLunaresOptions,
                        });
                        setConsultaModalOpened(true);
                      }}
                      disabled={isLoadingEmployees || isLoadingServices}
                    >
                      {isLoadingEmployees || isLoadingServices
                        ? 'CARGANDO...'
                        : 'CONSULTA OBLIGATORIA'}
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
          employees={employeesWithFallback as Employee[]}
          staffConsultasId={staffConsultasId}
          meryGarciaId={meryGarciaId}
        />
      )}

      {/* Modal de Consultas con Stepper */}
      {consultaService && (
        <ConsultaModal
          opened={consultaModalOpened}
          onClose={() => {
            setConsultaModalOpened(false);
            setConsultaService(null);
          }}
          serviceName={consultaService.serviceName}
          serviceKey={consultaService.serviceKey}
          consultaOptions={consultaService.consultaOptions}
          services={services as ServiceEntity[]}
          employees={employeesWithFallback as Employee[]}
          meryGarciaId={meryGarciaId}
          staffConsultasId={staffConsultasId}
          serviceEmployees={serviceEmployees}
        />
      )}
    </>
  );
}
