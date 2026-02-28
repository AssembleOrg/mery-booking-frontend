'use client';

import { Box, Container, Stack, Text, Button, Collapse } from '@mantine/core';
import {
  Header,
  Footer,
  FadeInSection,
  DateTimeSelector,
  BookingConfirmationModal,
  ReservaModal,
} from '@/presentation/components';
import ConsultaModal from '@/presentation/components/ConsultaModal';
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
  type ServiceEntity,
  type Employee,
} from '@/infrastructure/http';
import type { AccordionContentType } from '@/infrastructure/types/services';
import { useAuth } from '@/presentation/contexts';
import { Client } from '@/domain/entities';
import dayjs from 'dayjs';
import classes from './page.module.css';
import { CATEGORY_IDS } from '@/config/constants';

interface ServiceOption {
  id: string;
  label: string;
  contentType: AccordionContentType;
  description?: string;
  priceLabel?: string;
  priceValue?: string;
  priceEffective?: string;
  depositLabel?: string;
  depositValue?: string;
  footerNote?: string;
  serviceName?: string; // Nombre del servicio en la BD
  serviceDuration?: number;
  serviceId?: string;
  employeeId?: string;
  servicePrice?: number;
}

// Componente para contenido de Consulta
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

  const createClientMutation = useCreateClient();
  const createBookingMutation = useCreateBooking();

  // Buscar el servicio por nombre
  const currentService = option.serviceName
    ? services.find((s) =>
        s.name.toLowerCase().includes(option.serviceName!.toLowerCase())
      )
    : null;

  const currentEmployee = staffConsultasId
    ? employees.find((e) => e.id === staffConsultasId)
    : null;

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    open();
  };

  const handleConfirmBooking = async (clientData: Client) => {
    if (!currentService || !selectedDate || !selectedTime || !staffConsultasId)
      return;

    try {
      if (!clientData.dni) {
        throw new Error('El DNI es requerido para completar la reserva');
      }

      const client = await createClientMutation.mutateAsync({
        fullName: `${clientData.name} ${clientData.surname}`,
        email: clientData.email,
        phone: clientData.mobile,
        dni: clientData.dni,
      } as any);

      const dateString = dayjs(selectedDate).format('YYYY-MM-DD');
      await createBookingMutation.mutateAsync({
        clientId: client.id,
        employeeId: staffConsultasId,
        serviceId: currentService.id,
        date: dateString,
        startTime: selectedTime,
        quantity: 1,
        paid: false,
        notes: clientData.notes,
      });

      close();
      setShowCalendar(false);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error('Error al crear reserva:', error);
    }
  };

  const handleBack = () => setShowCalendar(false);
  const handleContinue = () => {
    if (currentService && staffConsultasId) {
      setShowCalendar(true);
    }
  };

  if (showCalendar && currentService) {
    return (
      <Box className={classes.accordionPanelContent}>
        <Text className={classes.panelDescription}>{option.description}</Text>
        <Text className={classes.panelPrice}>
          {option.priceLabel}{' '}
          <span className={classes.priceValue}>{option.priceValue}</span>
        </Text>
        <Box className={classes.calendarCard}>
          <DateTimeSelector
            serviceDuration={option.serviceDuration ?? 60}
            employeeId={staffConsultasId ?? null}
            serviceId={currentService.id}
            onSelectDateTime={handleDateTimeSelect}
            onBack={handleBack}
            showBackButton={true}
          />
        </Box>
        {option.footerNote && (
          <Text className={classes.footerNote}>{option.footerNote}</Text>
        )}

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
      <Text className={classes.panelPrice}>
        {option.priceLabel}{' '}
        <span className={classes.priceValue}>{option.priceValue}</span>
      </Text>
      {option.footerNote && (
        <Text className={classes.footerNote}>{option.footerNote}</Text>
      )}
    </Box>
  );
}

// Componente para contenido de Sesión/Retoque/Mantenimiento
function SesionContent({
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

  const createClientMutation = useCreateClient();
  const createBookingMutation = useCreateBooking();

  const currentService = option.serviceName
    ? services.find((s) =>
        s.name.toLowerCase().includes(option.serviceName!.toLowerCase())
      )
    : null;

  const currentEmployee = meryGarciaId
    ? employees.find((e) => e.id === meryGarciaId)
    : null;

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    open();
  };

  const handleConfirmBooking = async (clientData: Client) => {
    if (!currentService || !selectedDate || !selectedTime || !meryGarciaId)
      return;

    try {
      if (!clientData.dni) {
        throw new Error('El DNI es requerido para completar la reserva');
      }

      const client = await createClientMutation.mutateAsync({
        fullName: `${clientData.name} ${clientData.surname}`,
        email: clientData.email,
        phone: clientData.mobile,
        dni: clientData.dni,
      } as any);

      const dateString = dayjs(selectedDate).format('YYYY-MM-DD');
      await createBookingMutation.mutateAsync({
        clientId: client.id,
        employeeId: meryGarciaId,
        serviceId: currentService.id,
        date: dateString,
        startTime: selectedTime,
        quantity: 1,
        paid: false,
        notes: clientData.notes,
      });

      close();
      setShowCalendar(false);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error('Error al crear reserva:', error);
    }
  };

  const handleBack = () => setShowCalendar(false);
  const handleContinue = () => {
    if (currentService && meryGarciaId) {
      setShowCalendar(true);
    }
  };

  if (showCalendar && currentService) {
    return (
      <Box className={classes.accordionPanelContent}>
        <Text className={classes.panelDescription}>{option.description}</Text>
        <Text className={classes.panelPrice}>
          {option.priceLabel}{' '}
          <span className={classes.priceValue}>{option.priceValue}</span>
          {option.priceEffective && (
            <>
              {' '}
              (
              <span className={classes.priceValue}>
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
                  if (currentService) {
                    return `AR$ ${Number(currentService.price).toLocaleString('es-AR')}.-`;
                  }

                  return option.depositValue;
                })()}
              </span>
            </>
          )}
        </Text>
        <Box className={classes.calendarCard}>
          <DateTimeSelector
            serviceDuration={option.serviceDuration ?? 60}
            employeeId={meryGarciaId ?? null}
            serviceId={currentService.id}
            onSelectDateTime={handleDateTimeSelect}
            onBack={handleBack}
            showBackButton={true}
          />
        </Box>

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
    </Box>
  );
}

// AccordionItem component
function AccordionItem({
  option,
  isOpen,
  onToggle,
  staffConsultasId,
  meryGarciaId,
  services,
  employees,
}: {
  option: ServiceOption;
  isOpen: boolean;
  onToggle: () => void;
  staffConsultasId?: string;
  meryGarciaId?: string;
  services?: ServiceEntity[];
  employees?: Employee[];
}) {
  const renderContent = () => {
    switch (option.contentType) {
      case 'consulta':
        return (
          <ConsultaContent
            option={option}
            staffConsultasId={staffConsultasId}
            services={services}
            employees={employees}
          />
        );
      case 'sesion':
      case 'retoque':
      case 'mantenimiento':
        return (
          <SesionContent
            option={option}
            meryGarciaId={meryGarciaId}
            services={services}
            employees={employees}
          />
        );
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

// ServiceAccordion component
function ServiceAccordion({
  options,
  staffConsultasId,
  meryGarciaId,
  services,
  employees,
}: {
  options: ServiceOption[];
  staffConsultasId?: string;
  meryGarciaId?: string;
  services?: ServiceEntity[];
  employees?: Employee[];
}) {
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

// Service options data
const nanoScalpOptions: ServiceOption[] = [
  {
    id: 'nano-consulta',
    label: 'Nano Scalp Consulta previa Obligatoria',
    contentType: 'consulta',
    description:
      'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    footerNote:
      '(*) Espacio para que conozcas nuestro modo de trabajo, técnica y cuidados que deberás cumplir. Dibujamos los resultados que buscamos y saldamos todas tus dudas. Sin consulta previa no podremos brindarte un servicio MG.',
    serviceName: 'Nano Scalp Consulta',
    serviceDuration: 60,
  },
  {
    id: 'nano-sesion',
    label: 'Nano Scalp [By Mery Garcia]',
    contentType: 'sesion',
    description:
      'Primera sesión de Nano Scalp con Mery García. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 650.-',
    priceEffective: 'U$S 450.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    serviceName: 'Nano Scalp (By Mery Garcia)',
    serviceDuration: 120,
  },
  {
    id: 'nano-2da',
    label: 'Nano Scalp 2º Sesión [By Mery Garcia]',
    contentType: 'retoque',
    description:
      'Completá tu servicio de entre 30 y 60 días después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 650.-',
    priceEffective: 'U$S 450.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    serviceName: 'Nano Scalp Segunda Sesion',
    serviceDuration: 120,
  },
  {
    id: 'nano-mant',
    label: 'Nano Scalp Mantenimiento [By Mery Garcia]',
    contentType: 'mantenimiento',
    description:
      'Reactiva tu servicio de Nano Scalp. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 650.-',
    priceEffective: 'U$S 450.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    serviceName: 'Nano Scalp Mantenimiento',
    serviceDuration: 120,
  },
];

const areolaOptions: ServiceOption[] = [
  {
    id: 'areola-consulta',
    label: 'Areola Harmonization Consulta Previa Obligatoria',
    contentType: 'consulta',
    description:
      'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    serviceName: 'Areola Harmonization Consulta',
    serviceDuration: 60,
  },
  {
    id: 'areola-sesion',
    label: 'Areola Harmonization [By Mery Garcia]',
    contentType: 'sesion',
    description:
      'Primera sesión de Areola Camouflage con Mery García. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 560.-',
    priceEffective: 'U$S 420.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    serviceName: 'Areola Harmonization (By Mery Garcia)',
    serviceDuration: 120,
  },
  {
    id: 'areola-retoque',
    label: 'Arela Harmonization Retoque [By Mery Garcia]',
    contentType: 'retoque',
    description: 'Completá tu servicio 6 semanas después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 317.-',
    priceEffective: 'U$S 220.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    serviceName: 'Areola Harmonization Retoque',
    serviceDuration: 90,
  },
  {
    id: 'areola-mant',
    label: 'Areola Harmonization Mantenimiento [By Mery Garcia]',
    contentType: 'mantenimiento',
    description:
      'Reactiva tu servicio de Areola Harmonization. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 480.-',
    priceEffective: 'U$S 420.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    serviceName: 'Areola Harmonization Mantenimiento',
    serviceDuration: 120,
  },
];

/*
const nippleOptions: ServiceOption[] = [
  {
    id: 'nipple-consulta',
    label: 'Nipple Reconstruction Consulta previa Obligatoria',
    contentType: 'consulta',
    description:
      'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    footerNote:
      '(*) Espacio para que conozcas nuestro modo de trabajo, técnica y cuidados que deberás cumplir. Dibujamos los resultados que buscamos y saldamos todas tus dudas. Sin consulta previa no podremos brindarte un servicio MG.',
    serviceName: 'Nipple Reconstruction Consulta',
    serviceDuration: 60,
  },
  {
    id: 'nipple-sesion',
    label: 'Nipple Reconstruction [By Mery Garcia]',
    contentType: 'sesion',
    description:
      'Primera sesión de Nipple Reconstruction con Mery García. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 520.-',
    priceEffective: 'U$S 450.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    serviceName: 'Nipple Reconstruction (By Mery Garcia)',
    serviceDuration: 120,
  },
  {
    id: 'nipple-retoque',
    label: 'Nipple Reconstruction Retoque [By Mery Garcia]',
    contentType: 'retoque',
    description: 'Completá tu servicio 6 semanas después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 240.-',
    priceEffective: 'U$S 180.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    serviceName: 'Nipple Reconstruction Retoque',
    serviceDuration: 90,
  },
  {
    id: 'nipple-mant',
    label: 'Nipple Reconstruction Mantenimiento [By Mery Garcia]',
    contentType: 'mantenimiento',
    description:
      'Reactiva tu servicio de Nipple Reconstruction. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 480.-',
    priceEffective: 'U$S 420.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 150.000.-',
    serviceName: 'Nipple Reconstruction Mantenimiento',
    serviceDuration: 120,
  },
];
*/

const scarCamouflageOptions: ServiceOption[] = [
  {
    id: 'scar-consulta',
    label: 'Scar Camouflage Consulta previa Obligatoria',
    contentType: 'consulta',
    description:
      'Disimula la apariencia de las cicatrices, haciendo que se mezclen con todos los tonos de la piel circundante. Esta técnica implica la implantación de pigmentos en la zona de la cicatriz para igualar el color y minimizar su visibilidad. Ideal para recuperar el contorno de tu rostro en la zona de patillas, camuflando la cicatriz.Para evaluar si podemos realizar tu servicio, debés enviar una foto de la zona antes de la consulta al WhatsApp de recepción: 54 9 11 6159-2591 ',
    priceLabel: 'Valor de la seña:',
    priceValue: 'AR$ 50.000.-',
    footerNote:
      '(*) El precio final del servicio varía entre U$S 200 y U$S 400 según la zona a tratar. La seña se abona al reservar la consulta.',
    serviceName: 'Scar Camouflage Consulta',
    serviceDuration: 60,
  },
];

export default function ParamedicalTattooPage() {
  const { isAuthenticated } = useAuth();
  const stickyNavRef = useRef<HTMLDivElement | null>(null);

  const [paramedicalCategoryId, setParamedicalCategoryId] = useState<string>(
    CATEGORY_IDS.PARAMEDICAL_TATTOO
  );
  const [staffConsultasId, setStaffConsultasId] = useState<
    string | undefined
  >();
  const [meryGarciaId, setMeryGarciaId] = useState<string | undefined>();
  // Mapa de serviceId → Employee[] (todos los empleados asignados a ese servicio, via API)
  const [serviceEmployees, setServiceEmployees] = useState<Map<string, Employee[]>>(new Map());

  // Fetch category ID (solo si está autenticado)
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (isAuthenticated) {
          const response = await CategoryService.getAll();
          const categories = response.data;
          const category = categories.find((cat) =>
            cat.name.toLowerCase().includes('paramedical')
          );
          if (category && category.id !== paramedicalCategoryId) {
            setParamedicalCategoryId(category.id);
          }
        }
        // Si no está autenticado, ya tenemos el ID hardcodeado
      } catch (error) {
        console.error('Error fetching category:', error);
        // En caso de error, mantener el ID hardcodeado
      }
    };
    fetchCategory();
  }, [isAuthenticated, paramedicalCategoryId]);

  // Fetch services and employees
  const { data: services = [] } = useServices(
    paramedicalCategoryId || undefined
  );
  const { data: employees = [] } = useEmployees(
    paramedicalCategoryId || undefined
  );

  // Find Staff Consultas and Mery Garcia IDs
  useEffect(() => {
    if (employees.length > 0) {
      const meryGarcia = employees.find(
        (e) =>
          e.fullName.toLowerCase().includes('mery garcia') ||
          e.fullName.toLowerCase().includes('mery garcía')
      );

      if (meryGarcia) setMeryGarciaId(meryGarcia.id);
    }
  }, [employees]);

  // Resolver los empleados asignados a CADA servicio via API.
  // Evita búsqueda por nombre (fragile con duplicados o renombres).
  useEffect(() => {
    if (services.length === 0 || !paramedicalCategoryId) return;

    const visibleServices = services.filter((s) => s.showOnSite);
    if (visibleServices.length === 0) return;

    const resolveServiceEmployees = async () => {
      const newMap = new Map<string, Employee[]>();
      await Promise.all(
        visibleServices.map(async (service) => {
          try {
            const assigned = await EmployeeService.getAllPublic(
              paramedicalCategoryId,
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
  }, [services, paramedicalCategoryId]);

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

  // Helper function to enrich service options with IDs
  const enrichServiceOptions = (
    options: ServiceOption[],
    serviceKey: string,
    allServices: ServiceEntity[],
    staffId?: string,
    meryId?: string
  ): ServiceOption[] => {
    return options.map((option) => {
      // For consulta type
      if (option.contentType === 'consulta' && option.serviceName) {
        const consultaService = allServices.find((s) => {
          const nameLower = s.name.toLowerCase();
          const optionNameLower = option.serviceName!.toLowerCase();
          return (
            s.showOnSite &&
            (nameLower.includes(optionNameLower) || optionNameLower.includes(nameLower))
          );
        });

        // Usar el empleado asignado al servicio específico via API
        const resolvedEmployeeId = consultaService?.id
          ? serviceEmployees.get(consultaService.id)?.[0]?.id
          : undefined;

        return {
          ...option,
          serviceId: consultaService?.id,
          employeeId: resolvedEmployeeId,
          serviceDuration: consultaService?.duration || option.serviceDuration,
          servicePrice: consultaService?.price,
        };
      }

      // For sesion, retoque, mantenimiento
      if (
        option.contentType === 'sesion' ||
        option.contentType === 'retoque' ||
        option.contentType === 'mantenimiento'
      ) {
        const service = allServices.find((s) => {
          if (!option.serviceName) return false;
          const nameLower = s.name.toLowerCase();
          const optionNameLower = option.serviceName.toLowerCase();
          return (
            s.showOnSite &&
            (nameLower.includes(optionNameLower) || optionNameLower.includes(nameLower))
          );
        });

        return {
          ...option,
          serviceId: service?.id,
          employeeId: service?.id
            ? serviceEmployees.get(service.id)?.[0]?.id
            : undefined,
          serviceDuration: service?.duration || option.serviceDuration,
          servicePrice: service?.price,
        };
      }

      return option;
    });
  };

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

  // Enrich service options with IDs
  const nanoScalpOptionsWithIds = useMemo(() => {
    if (services.length === 0 || !meryGarciaId) {
      return nanoScalpOptions;
    }
    return enrichServiceOptions(
      nanoScalpOptions,
      'nano-scalp',
      services,
      staffConsultasId,
      meryGarciaId
    );
  }, [services, staffConsultasId, meryGarciaId, serviceEmployees]);

  const areolaOptionsWithIds = useMemo(() => {
    if (services.length === 0 || !meryGarciaId) {
      return areolaOptions;
    }
    return enrichServiceOptions(
      areolaOptions,
      'areola-harmonization',
      services,
      staffConsultasId,
      meryGarciaId
    );
  }, [services, staffConsultasId, meryGarciaId, serviceEmployees]);

  const scarCamouflageOptionsWithIds = useMemo(() => {
    if (services.length === 0) {
      return scarCamouflageOptions;
    }
    return enrichServiceOptions(
      scarCamouflageOptions,
      'scar-camouflage',
      services,
      staffConsultasId,
      meryGarciaId
    );
  }, [services, staffConsultasId, meryGarciaId, serviceEmployees]);

  /*
  const nippleOptionsWithIds = useMemo(() => {
    if (services.length === 0 || !staffConsultasId || !meryGarciaId) {
      return nippleOptions;
    }
    return enrichServiceOptions(
      nippleOptions,
      'nipple-reconstruction',
      services,
      staffConsultasId,
      meryGarciaId
    );
  }, [services, staffConsultasId, meryGarciaId]);
  */

  return (
    <>
      <Header />

      <Box className={classes.pageWrapper}>
        {/* Sticky Navigation */}
        <Box ref={stickyNavRef} className={classes.heroNav}>
          <Box
            className={classes.navButton}
            onClick={() => scrollToSection('nano-scalp')}
          >
            <span>NANO SCALP</span>
          </Box>
          <Box
            className={classes.navButton}
            onClick={() => scrollToSection('areola-harmonization')}
          >
            <span>AREOLA</span>
          </Box>
          <Box
            className={classes.navButton}
            onClick={() => scrollToSection('scar-camouflage')}
          >
            <span>SCAR</span>
          </Box>
          {/* <Box
            className={classes.navButton}
            onClick={() => scrollToSection('nipple-reconstruction')}
          >
            <span>NIPPLE</span>
          </Box> */}
        </Box>

        {/* Content Sections */}
        <Box id="consultas" className={classes.contentWrapper}>
          {/* Nano Scalp Section */}
          <FadeInSection direction="up" delay={0}>
            <Box id="nano-scalp" className={classes.section}>
              <Container size="lg" py="md">
                <Box className={classes.sectionContent}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.sectionTitle}>NANO SCALP</Text>
                      <Text className={classes.serviceTagline}>
                        Cosmetic Tattoo de cuero cabelludo. Efecto de mayor
                        densidad capilar.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <a
                      href="https://merygarcia.com.ar/servicios/tatuaje-paramedico#nano-scalp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.ctaButton}
                    >
                      MÁS INFO AQUÍ
                    </a>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'NANO SCALP',
                          serviceKey: 'nano-scalp',
                          consultaOptions: nanoScalpOptionsWithIds.filter(
                            (opt) => opt.contentType === 'consulta'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                    >
                      CONSULTA
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'NANO SCALP',
                          serviceKey: 'nano-scalp',
                          options: nanoScalpOptionsWithIds.filter(
                            (opt) => opt.contentType !== 'consulta'
                          ),
                        });
                        setModalOpened(true);
                      }}
                    >
                      RESERVAR
                    </button>
                  </Box>

                  <Box className={classes.optionsSection}>
                    <Text className={classes.optionsTitle}>
                      Seleccioná la opción deseada para solicitar tu cita:
                    </Text>
                    <ServiceAccordion
                      options={nanoScalpOptions}
                      staffConsultasId={staffConsultasId}
                      meryGarciaId={meryGarciaId}
                      services={services as ServiceEntity[]}
                      employees={employees as Employee[]}
                    />
                  </Box>
                </Box>
              </Container>
            </Box>
          </FadeInSection>

          {/* Areola Harmonization Section */}
          <FadeInSection direction="up" delay={0.1}>
            <Box id="areola-harmonization" className={classes.section}>
              <Container size="lg" py="md">
                <Box className={classes.sectionContent}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.sectionTitle}>
                        AREOLA HARMONIZATION
                      </Text>
                      <Text className={classes.serviceTagline}>
                        Micropigmentación para disimular cicatrices y corregir
                        asimetrías.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <a
                      href="https://merygarcia.com.ar/servicios/tatuaje-paramedico#areola-harmonization"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.ctaButton}
                    >
                      MÁS INFO AQUÍ
                    </a>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'AREOLA HARMONIZATION',
                          serviceKey: 'areola-harmonization',
                          consultaOptions: areolaOptionsWithIds.filter(
                            (opt) => opt.contentType === 'consulta'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                    >
                      CONSULTA
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'AREOLA HARMONIZATION',
                          serviceKey: 'areola-harmonization',
                          options: areolaOptionsWithIds.filter(
                            (opt) => opt.contentType !== 'consulta'
                          ),
                        });
                        setModalOpened(true);
                      }}
                    >
                      RESERVAR
                    </button>
                  </Box>

                  <Box className={classes.optionsSection}>
                    <Text className={classes.optionsTitle}>
                      Seleccioná la opción deseada para solicitar tu cita:
                    </Text>
                    <ServiceAccordion
                      options={areolaOptions}
                      staffConsultasId={staffConsultasId}
                      meryGarciaId={meryGarciaId}
                      services={services as ServiceEntity[]}
                      employees={employees as Employee[]}
                    />
                  </Box>
                </Box>
              </Container>
            </Box>
          </FadeInSection>

          {/* Scar Camouflage Section */}
          <FadeInSection direction="up" delay={0.2}>
            <Box id="scar-camouflage" className={classes.section}>
              <Container size="lg" py="md">
                <Box className={classes.sectionContent}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.sectionTitle}>
                        SCAR CAMOUFLAGE
                      </Text>
                      <Text className={classes.serviceTagline}>
                        Cosmetic Tattoo para disimular cicatrices. Precio
                        variable según caso: U$S 200 - U$S 400.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <a
                      href="https://merygarcia.com.ar/servicios/tatuaje-paramedico#scar-camouflage"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.ctaButton}
                    >
                      MÁS INFO AQUÍ
                    </a>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'SCAR CAMOUFLAGE',
                          serviceKey: 'scar-camouflage',
                          consultaOptions: scarCamouflageOptionsWithIds.filter(
                            (opt) => opt.contentType === 'consulta'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                    >
                      CONSULTA
                    </button>
                  </Box>

                  <Box className={classes.optionsSection}>
                    <Text className={classes.optionsTitle}>
                      Seleccioná la opción deseada para solicitar tu cita:
                    </Text>
                    <ServiceAccordion
                      options={scarCamouflageOptions}
                      staffConsultasId={staffConsultasId}
                      meryGarciaId={meryGarciaId}
                      services={services as ServiceEntity[]}
                      employees={employees as Employee[]}
                    />
                  </Box>
                </Box>
              </Container>
            </Box>
          </FadeInSection>

          {/* Nipple Reconstruction Section - COMMENTED OUT */}
          {/* <FadeInSection direction="up" delay={0.2}>
            <Box id="nipple-reconstruction" className={classes.section}>
              <Container size="lg" py="md">
                <Box className={classes.sectionContent}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.sectionTitle}>
                        NIPPLE RECONSTRUCTION
                      </Text>
                      <Text className={classes.serviceTagline}>
                        Cosmetic Tattoo 3D para reconstrucción y corrección de
                        asimetrías.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <a
                      href="https://merygarcia.com.ar/servicios/tatuaje-paramedico#nipple-reconstruction"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.ctaButton}
                    >
                      MÁS INFO AQUÍ
                    </a>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'NIPPLE RECONSTRUCTION',
                          serviceKey: 'nipple-reconstruction',
                          consultaOptions: nippleOptionsWithIds.filter(
                            (opt) => opt.contentType === 'consulta'
                          ),
                        });
                        setConsultaModalOpened(true);
                      }}
                    >
                      CONSULTA
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'NIPPLE RECONSTRUCTION',
                          serviceKey: 'nipple-reconstruction',
                          options: nippleOptionsWithIds,
                        });
                        setModalOpened(true);
                      }}
                    >
                      RESERVAR
                    </button>
                  </Box>

                  <Box className={classes.optionsSection}>
                    <Text className={classes.optionsTitle}>
                      Seleccioná la opción deseada para solicitar tu cita:
                    </Text>
                    <ServiceAccordion
                      options={nippleOptions}
                      staffConsultasId={staffConsultasId}
                      meryGarciaId={meryGarciaId}
                      services={services as ServiceEntity[]}
                      employees={employees as Employee[]}
                    />
                  </Box>
                </Box>
              </Container>
            </Box>
          </FadeInSection> */}
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
          employees={employees as Employee[]}
          meryGarciaId={meryGarciaId}
          staffConsultasId={staffConsultasId}
          serviceEmployees={serviceEmployees}
        />
      )}
    </>
  );
}
