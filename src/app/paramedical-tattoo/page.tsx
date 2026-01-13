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
  type ServiceEntity,
  type Employee,
} from '@/infrastructure/http';
import { useAuth } from '@/presentation/contexts';
import { Client } from '@/domain/entities';
import dayjs from 'dayjs';
import classes from './page.module.css';

// Tipos de contenido del acordeón
type AccordionContentType = 'consulta' | 'sesion' | 'retoque' | 'mantenimiento';

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
                {option.depositValue}
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
    priceValue: 'U$S 520.-',
    priceEffective: 'U$S 450.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
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
    priceValue: 'U$S 520.-',
    priceEffective: 'U$S 450.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
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
    priceValue: 'U$S 520.-',
    priceEffective: 'U$S 450.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
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
    priceValue: 'U$S 480.-',
    priceEffective: 'U$S 420.-',
    depositLabel: 'Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    serviceName: 'Areola Harmonization (By Mery Garcia)',
    serviceDuration: 120,
  },
  {
    id: 'areola-retoque',
    label: 'Arela Harmonization Retoque [By Mery Garcia]',
    contentType: 'retoque',
    description: 'Completá tu servicio 6 semanas después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 250.-',
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
    depositValue: 'AR$ 100.000.-',
    serviceName: 'Areola Harmonization Mantenimiento',
    serviceDuration: 120,
  },
];

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
    depositValue: 'AR$ 100.000.-',
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
    depositValue: 'AR$ 100.000.-',
    serviceName: 'Nipple Reconstruction Mantenimiento',
    serviceDuration: 120,
  },
];

// ID hardcodeado de la categoría "Paramedical Tattoo"
const PARAMEDICAL_TATTOO_CATEGORY_ID = '45422e67-102b-4565-9192-ef4047e16f48';

export default function ParamedicalTattooPage() {
  const { isAuthenticated } = useAuth();

  const [paramedicalCategoryId, setParamedicalCategoryId] = useState<string>(
    PARAMEDICAL_TATTOO_CATEGORY_ID
  );
  const [staffConsultasId, setStaffConsultasId] = useState<
    string | undefined
  >();
  const [meryGarciaId, setMeryGarciaId] = useState<string | undefined>();

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
      const staffConsultas = employees.find(
        (e) =>
          e.fullName.toLowerCase().includes('staff consultas') ||
          e.fullName.toLowerCase().includes('consultas')
      );
      const meryGarcia = employees.find(
        (e) =>
          e.fullName.toLowerCase().includes('mery garcia') ||
          e.fullName.toLowerCase().includes('mery garcía')
      );

      if (staffConsultas) setStaffConsultasId(staffConsultas.id);
      if (meryGarcia) setMeryGarciaId(meryGarcia.id);
    }
  }, [employees]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          return s.showOnSite && nameLower.includes(optionNameLower);
        });

        return {
          ...option,
          serviceId: consultaService?.id,
          employeeId: staffId, // Staff Consultas
          serviceDuration: consultaService?.duration || option.serviceDuration,
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
          return s.showOnSite && nameLower.includes(optionNameLower);
        });

        return {
          ...option,
          serviceId: service?.id,
          employeeId: meryId, // Mery Garcia
          serviceDuration: service?.duration || option.serviceDuration,
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

  // Enrich service options with IDs
  const nanoScalpOptionsWithIds = useMemo(() => {
    if (services.length === 0 || !staffConsultasId || !meryGarciaId) {
      return nanoScalpOptions;
    }
    return enrichServiceOptions(
      nanoScalpOptions,
      'nano-scalp',
      services,
      staffConsultasId,
      meryGarciaId
    );
  }, [services, staffConsultasId, meryGarciaId]);

  const areolaOptionsWithIds = useMemo(() => {
    if (services.length === 0 || !staffConsultasId || !meryGarciaId) {
      return areolaOptions;
    }
    return enrichServiceOptions(
      areolaOptions,
      'areola-harmonization',
      services,
      staffConsultasId,
      meryGarciaId
    );
  }, [services, staffConsultasId, meryGarciaId]);

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

  return (
    <>
      <Header />

      <Box className={classes.pageWrapper}>
        {/* Sticky Navigation */}
        <Box className={classes.heroNav}>
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
            onClick={() => scrollToSection('nipple-reconstruction')}
          >
            <span>NIPPLE</span>
          </Box>
        </Box>

        {/* Content Sections */}
        <Box className={classes.contentWrapper}>
          {/* Nano Scalp Section */}
          <FadeInSection direction="up" delay={0}>
            <Box id="nano-scalp" className={classes.section}>
              <Container size="lg" py="md">
                <Box className={classes.sectionContent}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceThumbnail}>
                      <Image
                        src="/images/nano-scallping.webp"
                        alt="Nano Scalp"
                        width={100}
                        height={100}
                        className={classes.thumbnailImage}
                      />
                    </Box>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.sectionTitle}>NANO SCALP</Text>
                      <Text className={classes.serviceTagline}>
                        Tatuaje cosmético de cuero cabelludo. Efecto de mayor
                        densidad capilar.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <a
                      href="https://merygarcia.com.ar/servicios/tatuaje-paramedico"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.ctaButton}
                    >
                      MÁS INFO AQUÍ
                    </a>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() =>
                        openWhatsApp('Quiero consultar sobre NANO SCALP')
                      }
                    >
                      CONSULTA
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'NANO SCALP',
                          serviceKey: 'nano-scalp',
                          options: nanoScalpOptionsWithIds,
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
                    <Box className={classes.serviceThumbnail}>
                      <Image
                        src="/images/aereola.webp"
                        alt="Areola Harmonization"
                        width={100}
                        height={100}
                        className={classes.thumbnailImage}
                      />
                    </Box>
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
                      href="https://merygarcia.com.ar/servicios/tatuaje-paramedico"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.ctaButton}
                    >
                      MÁS INFO AQUÍ
                    </a>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() =>
                        openWhatsApp(
                          'Quiero consultar sobre AREOLA HARMONIZATION'
                        )
                      }
                    >
                      CONSULTA
                    </button>
                    <button
                      className={classes.ctaButtonReservar}
                      onClick={() => {
                        setModalService({
                          serviceName: 'AREOLA HARMONIZATION',
                          serviceKey: 'areola-harmonization',
                          options: areolaOptionsWithIds,
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

          {/* Nipple Reconstruction Section */}
          <FadeInSection direction="up" delay={0.2}>
            <Box id="nipple-reconstruction" className={classes.section}>
              <Container size="lg" py="md">
                <Box className={classes.sectionContent}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceThumbnail}>
                      <Image
                        src="/images/camuflaje.webp"
                        alt="Nipple Reconstruction"
                        width={100}
                        height={100}
                        className={classes.thumbnailImage}
                      />
                    </Box>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.sectionTitle}>
                        NIPPLE RECONSTRUCTION
                      </Text>
                      <Text className={classes.serviceTagline}>
                        Tatuaje cosmético 3D para reconstrucción y corrección de
                        asimetrías.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <a
                      href="https://merygarcia.com.ar/servicios/tatuaje-paramedico"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.ctaButton}
                    >
                      MÁS INFO AQUÍ
                    </a>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() =>
                        openWhatsApp(
                          'Quiero consultar sobre NIPPLE RECONSTRUCTION'
                        )
                      }
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
          </FadeInSection>
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
