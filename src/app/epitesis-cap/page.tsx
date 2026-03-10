'use client';

import { Box, Container, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  Header,
  Footer,
  FadeInSection,
} from '@/presentation/components';
import ConsultaModal from '@/presentation/components/ConsultaModal';
import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
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
  accordionDescription?: string;
  accordionDescriptionNode?: ReactNode;
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
            {option.accordionDescriptionNode ? (
              <Text className={classes.panelDescription}>{option.accordionDescriptionNode}</Text>
            ) : (
              <Text className={classes.panelDescription}>{option.accordionDescription || option.description}</Text>
            )}
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

interface DescriptionBlock {
  kind: 'paragraph';
  text: string;
}

const EPITESIS_DESCRIPTION_BLOCKS: DescriptionBlock[] = [
  {
    kind: 'paragraph',
    text: 'Hay procesos que dejan marcas visibles. Y otros que transforman profundamente la forma en que nos miramos.',
  },
  {
    kind: 'paragraph',
    text: 'La epítesis de complejo areola–pezón (CAP) es una prótesis externa, realizada de manera totalmente artesanal y personalizada, diseñada para acompañar procesos post quirúrgicos —como mastectomías u otras intervenciones— devolviendo armonía, naturalidad y una imagen corporal más completa.',
  },
  {
    kind: 'paragraph',
    text: 'Cada pieza es única, y ahí está la magia. Se trabaja respetando tonos de piel, textura, forma, volumen y detalles que hacen que el resultado sea hiperrealista, sutil y profundamente personal.',
  },
];

// Static service options array
const epitesisCapOptions: ServiceOption[] = [
  {
    id: 'epitesis-consulta',
    label: 'Epitesis CAP — Consulta Previa Obligatoria',
    contentType: 'consulta',
    description:
      'Consulta inicial de manera informativa, donde nos conoceremos y analizaremos tu caso. (Incluye charla informativa, toma de medidas, molde y registro fotográfico).',
    accordionDescription:
      'Hay procesos que dejan marcas visibles. Y otros que transforman profundamente la forma en que nos miramos.\n\n' +
      'La epítesis de complejo areola–pezón (CAP) es una prótesis externa, realizada de manera totalmente artesanal y personalizada, diseñada para acompañar procesos post quirúrgicos —como mastectomías u otras intervenciones— devolviendo armonía, naturalidad y una imagen corporal más completa.\n\n' +
      'Cada pieza es única, y ahí está la magia. Se trabaja respetando tonos de piel, textura, forma, volumen y detalles que hacen que el resultado sea hiperrealista, sutil y profundamente personal.\n\n' +
      'Importante: Es requisito contar con el aval de tu médico (apto firmado) para realizar este servicio.',
    priceLabel: 'Consulta obligatoria:',
    priceValue: 'AR$ 50.000.- NO REEMBOLSABLE',
    footerNote:
      '(*) La consulta incluye evaluación de la zona, registro fotográfico, toma de medidas y molde negativo customizado.\n\n Una vez encargada la producción de las piezas, los tiempos regulares de producción varían entre los 7 y los 10 días.\n\n Consultar por Speciall Pass para tiempos de producción y entrega inmediata.  ',
    serviceName: 'Epitesis Cap Consulta Previa',
    serviceDuration: 60,
  },
  {
    id: 'epitesis-dona-molde',
    label: 'Epitesis CAP — Doná tu molde',
    contentType: 'consulta',
    accordionDescriptionNode: (
      <>
        Una forma generosa y filantrópica de ayudar a mas personas a acceder a reconstrucciones hiperrealistas, permitiéndonos tomar un molde de tu areola-pezón para formar parte de nuestro <strong>banco de moldes</strong>.
      </>
    ),
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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);  

  const epitesisCapOptionsWithIds = useMemo(
    () =>
      services.length === 0
        ? epitesisCapOptions
        : enrichServiceOptions(epitesisCapOptions, services, serviceEmployees),
    [services, serviceEmployees]
  );

  const [epitesisInfoOpened, { open: openEpitesisInfo, close: closeEpitesisInfo }] = useDisclosure(false);

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
                      type="button"
                      className={classes.ctaButton}
                      onClick={openEpitesisInfo}
                    >
                      MÁS INFO
                    </button>
                    <button
                      className={classes.ctaButtonSecondary}
                      onClick={() => {
                        setConsultaService({
                          serviceName: 'EPITESIS CAP',
                          serviceKey: 'epitesis-cap',
                          consultaOptions: epitesisCapOptionsWithIds.filter(
                            (opt) => opt.contentType === 'consulta' && !!opt.serviceName
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

      <Modal
        opened={epitesisInfoOpened}
        onClose={closeEpitesisInfo}
        centered
        size="lg"
        radius="md"
        keepMounted
        title="EPITESIS CAP"
        classNames={{
          content: classes.descriptionModalContent,
          header: classes.descriptionModalHeader,
          title: classes.descriptionModalTitle,
          body: classes.descriptionModalBody,
        }}
      >
        {EPITESIS_DESCRIPTION_BLOCKS.map((block, index) => (
          <Text key={index} className={classes.descriptionModalText}>
            {block.text}
          </Text>
        ))}
      </Modal>

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
