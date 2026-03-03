'use client';

import { Box, Container, Text } from '@mantine/core';
import {
  Header,
  Footer,
  FadeInSection,
} from '@/presentation/components';
import ConsultaModal from '@/presentation/components/ConsultaModal';
import { useState, useMemo, useEffect, useRef } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import {
  useServices,
  useEmployees,
} from '@/presentation/hooks';
import {
  CategoryService,
  EmployeeService,
  type ServiceEntity,
  type Employee,
} from '@/infrastructure/http';
import type { AccordionContentType } from '@/infrastructure/types/services';
import { useAuth } from '@/presentation/contexts';
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
  serviceName?: string;
  serviceDuration?: number;
  serviceId?: string;
  employeeId?: string;
  servicePrice?: number;
}

// Función pura a nivel de módulo — no se recrea en cada render
function enrichServiceOptions(
  options: ServiceOption[],
  allServices: ServiceEntity[],
  serviceEmployees: Map<string, Employee[]>
): ServiceOption[] {
  return options.map((option) => {
    if (option.contentType === 'consulta' && option.serviceName) {
      const consultaService = allServices.find((s) => {
        const nameLower = s.name.toLowerCase();
        const optionNameLower = option.serviceName!.toLowerCase();
        return (
          s.showOnSite &&
          (nameLower.includes(optionNameLower) || optionNameLower.includes(nameLower))
        );
      });

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
    return option;
  });
}

// Accordion item — solo muestra info estática (el booking va por ConsultaModal)
function AccordionItem({
  option,
  isOpen,
  onToggle,
}: {
  option: ServiceOption;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Box className={classes.accordionItem}>
      <button className={classes.accordionControl} onClick={onToggle}>
        <IconChevronDown
          className={`${classes.accordionChevron} ${isOpen ? classes.accordionChevronOpen : ''}`}
          size={16}
        />
        <span className={classes.accordionLabel}>{option.label}</span>
      </button>
      {isOpen && (
        <Box className={classes.accordionPanel}>
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
        </Box>
      )}
    </Box>
  );
}

function ServiceAccordion({ options }: { options: ServiceOption[] }) {
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  return (
    <Box className={classes.accordionWrapper}>
      {options.map((option, index) => (
        <AccordionItem
          key={option.id}
          option={option}
          isOpen={openedIndex === index}
          onToggle={() => setOpenedIndex(openedIndex === index ? null : index)}
        />
      ))}
    </Box>
  );
}

// Static service options array
const epitesisCapOptions: ServiceOption[] = [
  {
    id: 'epitesis-consulta',
    label: 'Epitesis CAP — Consulta Previa Obligatoria',
    contentType: 'consulta',
    description:
      'Hay procesos que dejan marcas visibles. Y otros que transforman profundamente la forma en que nos miramos.\n\n' +
      'La epítesis de complejo areola–pezón (CAP) es una prótesis externa, realizada de manera totalmente artesanal y personalizada, diseñada para acompañar procesos post quirúrgicos —como mastectomías u otras intervenciones— devolviendo armonía, naturalidad y una imagen corporal más completa.\n\n' +
      'Cada pieza es única, y ahí está la magia. Se trabaja respetando tonos de piel, textura, forma, volumen y detalles que hacen que el resultado sea hiperrealista, sutil y profundamente personal.\n\n' +
      'Importante: Es requisito contar con el aval de tu médico para realizar este servicio.',
    priceLabel: 'Consulta obligatoria:',
    priceValue: 'AR$ 50.000.- NO REEMBOLSABLE',
    footerNote:
      '(*) La consulta incluye evaluación de la zona, registro fotográfico, toma de medidas y molde negativo customizado. Dentro de la misma semana se realiza la prueba directa sobre la piel.',
    serviceName: 'Epitesis Cap Consulta Previa',
    serviceDuration: 60,
  },
];

export default function EpitesisCapPage() {
  const { isAuthenticated } = useAuth();
  const stickyNavRef = useRef<HTMLDivElement | null>(null);

  const [epitesisCategoryId, setEpitesisCategoryId] = useState<string>(
    CATEGORY_IDS.EPITESIS_CAP
  );
  const [meryGarciaId, setMeryGarciaId] = useState<string | undefined>();
  const [serviceEmployees, setServiceEmployees] = useState<Map<string, Employee[]>>(new Map());

  // Fetch category ID (solo si está autenticado)
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCategory = async () => {
      try {
        const response = await CategoryService.getAll();
        const category = response.data.find((cat) =>
          cat.name.toLowerCase().includes('epitesis')
        );
        if (category && category.id !== epitesisCategoryId) {
          setEpitesisCategoryId(category.id);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };
    fetchCategory();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: services = [] } = useServices(epitesisCategoryId || undefined);
  const { data: employees = [] } = useEmployees(epitesisCategoryId || undefined);

  // Resolver Mery Garcia ID
  useEffect(() => {
    if (employees.length === 0) return;
    const meryGarcia = employees.find(
      (e) =>
        e.fullName.toLowerCase().includes('mery garcia') ||
        e.fullName.toLowerCase().includes('mery garcía')
    );
    if (meryGarcia) setMeryGarciaId(meryGarcia.id);
  }, [employees]);

  // Resolver empleados asignados a cada servicio via API
  useEffect(() => {
    if (services.length === 0 || !epitesisCategoryId) return;
    const visibleServices = services.filter((s) => s.showOnSite);
    if (visibleServices.length === 0) return;

    const resolveServiceEmployees = async () => {
      const newMap = new Map<string, Employee[]>();
      await Promise.all(
        visibleServices.map(async (service) => {
          try {
            const assigned = await EmployeeService.getAllPublic(epitesisCategoryId, service.id);
            if (assigned.length > 0) newMap.set(service.id, assigned as Employee[]);
          } catch (error) {
            console.error(`Error resolviendo empleados para servicio ${service.name}:`, error);
          }
        })
      );
      setServiceEmployees(newMap);
    };

    resolveServiceEmployees();
  }, [services, epitesisCategoryId]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
      const stickyNavHeight = stickyNavRef.current?.getBoundingClientRect().height ?? 0;
      const topOffset = headerHeight + stickyNavHeight + 12;
      const targetY = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, targetY - topOffset), behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const timer = setTimeout(() => scrollToSection(hash.slice(1)), 300);
    return () => clearTimeout(timer);
  }, []);  

  const epitesisCapOptionsWithIds = useMemo(
    () =>
      services.length === 0
        ? epitesisCapOptions
        : enrichServiceOptions(epitesisCapOptions, services, serviceEmployees),
    [services, serviceEmployees]
  );

  const [consultaModalOpened, setConsultaModalOpened] = useState(false);
  const [consultaService, setConsultaService] = useState<{
    serviceName: string;
    serviceKey: string;
    consultaOptions: ServiceOption[];
  } | null>(null);

  return (
    <>
      <Header />

      <Box className={classes.pageWrapper}>
        {/* Sticky Navigation */}
        <Box ref={stickyNavRef} className={classes.heroNav}>
          <Box className={classes.navButton} onClick={() => scrollToSection('epitesis-cap')}>
            <span>EPITESIS CAP</span>
          </Box>
        </Box>

        <Box id="consultas" className={classes.contentWrapper}>
          <FadeInSection direction="up" delay={0}>
            <Box id="epitesis-cap" className={classes.section}>
              <Container size="lg" py="md">
                <Box className={classes.sectionContent}>
                  <Box className={classes.serviceHeader}>
                    <Box className={classes.serviceTitleWrapper}>
                      <Text className={classes.sectionTitle}>EPITESIS CAP</Text>
                      <Text className={classes.serviceTagline}>
                        Prótesis artesanal hiperrealista. Complejo areola–pezón post mastectomía.
                      </Text>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'EPITESIS CAP',
                          serviceKey: 'epitesis-cap',
                          consultaOptions: epitesisCapOptionsWithIds.filter(
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
                    <ServiceAccordion options={epitesisCapOptions} />
                  </Box>
                </Box>
              </Container>
            </Box>
          </FadeInSection>
        </Box>
      </Box>

      <Footer />

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
          staffConsultasId={undefined}
          serviceEmployees={serviceEmployees}
        />
      )}
    </>
  );
}
