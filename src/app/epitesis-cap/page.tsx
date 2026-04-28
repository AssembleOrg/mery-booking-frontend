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
import { IconChevronDown, IconFileDescription, IconBrandInstagram } from '@tabler/icons-react';
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
  disabled?: boolean;
}

// Función robusta de resolución de opciones con keyword matching en cadena
function getEpitesisOptionsWithIds(
  options: ServiceOption[],
  allServices: ServiceEntity[],
  serviceEmployees: Map<string, Employee[]>
): ServiceOption[] {
  return options.map((option) => {
    // Resolución via serviceName exacto (con includes bidireccional) — aplica a todas las opciones con serviceName
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
  disabled,
}: {
  option: ServiceOption;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <Box className={`${classes.accordionItem} ${disabled ? classes.accordionItemDisabled : ''}`}>
      <button
        className={classes.accordionControl}
        onClick={disabled ? undefined : onToggle}
        style={disabled ? { cursor: 'default', opacity: 0.5 } : undefined}
      >
        {!disabled && (
          <IconChevronDown
            className={`${classes.accordionChevron} ${isOpen ? classes.accordionChevronOpen : ''}`}
            size={16}
          />
        )}
        <span className={classes.accordionLabel}>{option.label}</span>
        {disabled && (
          <span className={classes.comingSoonBadgeAccordion}>Próximamente</span>
        )}
      </button>
      {!disabled && isOpen && (
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
          disabled={option.disabled}
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
    {
    kind: 'paragraph',
    text: 'Más información y valores en el PDF',
  },
];

// Static service options array (solo las que van al flujo de booking)
const epitesisCapOptions: ServiceOption[] = [
  {
    id: 'epitesis-agenda-entrega',
    label: 'Entrega de Epítesis',
    contentType: 'consulta',
    description: 'Agendá la entrega de tu epítesis personalizada.',
    priceValue: 'AR$ 150.000.-',
    serviceName: 'Entrega de Epítesis',
    serviceDuration: 60,
  },
  {
    id: 'epitesis-consulta',
    label: 'Epitesis CAP — Consulta Previa Obligatoria',
    contentType: 'consulta',
    description:
      'Consulta inicial de manera informativa, donde nos conoceremos y analizaremos tu caso. (Incluye charla informativa, toma de medidas, molde y registro fotográfico).',
    accordionDescription:
      'La consulta es el primer paso para conocernos, evaluar tu caso y la zona de aplique de la pieza. También, realizamos un registro fotográfico, toma de medidas y un molde negativo customizado.\n\n' +
      'Una vez encargada la producción de las piezas, los tiempos regulares de realización de las mismas es de 72 hs hábiles.\n\n',
    priceLabel: 'Consulta obligatoria:',
    priceValue: 'AR$ 50.000.- NO REEMBOLSABLE',
    footerNote:
      '(*) La consulta incluye evaluación de la zona, registro fotográfico, toma de medidas y molde negativo customizado.\n\n Una vez encargada la producción de las piezas, los tiempos regulares de producción varían entre los 7 y los 10 días.\n\n Consultar por Special Pass para tiempos de producción y entrega inmediata.  ',
    serviceName: 'Epitesis Cap Consulta Previa',
    serviceDuration: 60,
  },
];

// Array para el acordeón informativo de la página
const epitesisAccordionOptions: ServiceOption[] = [
  {
    id: 'epitesis-100-customizado',
    label: 'Servicio 100% customizado',
    contentType: 'consulta',
    accordionDescriptionNode: (
      <>
        Requiere 2 presencialidades (consulta obligatoria y entrega final, por Mery & Staff). Las piezas se encargan con el compromiso de una seña y conllevan un tiempo de producción de 72 hs hábiles para su entrega con los detalles finales a mano de Mery.
      </>
    ),
  },
  {
    id: 'epitesis-semi-customizado',
    label: 'Servicio semi-customizado',
    contentType: 'consulta',
    accordionDescriptionNode: (
      <>
        La consulta es virtual, se deberán enviar fotos de la zona para recibir asesoramiento. Las piezas se moldean con un modelo de nuestro catálogo de moldes y se realizan detalles personalizados de color (presencialmente el día de la entrega por Mery). En caso de no contar con un modelo que se acerque al tuyo, podés optar por la opción 100% personalizada.{' '}
        <br /><br />
        Es necesario que completes este formulario para que nos pongamos en contacto:{' '}
        <a
          href="https://docs.google.com/forms/d/1T91vKMOrMW9FUHpU7i7u7zvpEr4Y1dagktVrIllULdM/edit"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px' }}
        >
          Formulario de contacto
        </a>
      </>
    ),
  },
  {
    id: 'epitesis-por-catalogo',
    label: 'Servicio por catálogo',
    contentType: 'consulta',
    disabled: true,
  },
  {
    id: 'epitesis-special-pass',
    label: 'Special Pass',
    contentType: 'consulta',
    accordionDescriptionNode: (
      <>
        Pensado especialmente para clientas que nos visitan desde el interior o el exterior del país. Se trata de disponibilidades exclusivas con horarios y honorarios diferenciales. Podés consultarnos valores y tiempo de entrega para la realización de las piezas el mismo día o en el plazo de 24 hs, escribiendo al{' '}
        <a
          href="https://wa.me/5491128593378?text=-+Hola+chicas%2C+como+est%C3%A1n%3F+Quisiera+consultar+el+Special+Pass+de+Epitesis+CAP"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px', whiteSpace: 'nowrap' }}
        >
          +54 9 11 2859-3378
        </a>
      </>
    ),
  },
  {
    id: 'epitesis-dona-molde',
    label: 'Epitesis CAP — Doná tu molde',
    contentType: 'consulta',
    accordionDescriptionNode: (
      <>
        Una forma generosa y filantrópica de ayudar a más personas a acceder a reconstrucciones hiperrealistas, permitiéndonos tomar un molde de tu areola–pezón para formar parte de nuestro <strong>banco de moldes</strong>.{' '}
        <strong>Contactate con nosotras</strong> para coordinar:{' '}
        <a
          href="https://wa.me/5491128593378?text=-+Hola+chicas%2C+como+est%C3%A1n%3F+Quisiera+donar+mi+molde+para+Epitesis+CAP"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px', whiteSpace: 'nowrap' }}
        >
          +54 9 11 2859-3378
        </a>

        {/* PDF download section */}
        <span className={classes.descriptionModalDownloadSection} style={{ marginTop: 16, display: 'block' }}>
          <span className={classes.descriptionModalDownloadLabel}>Más información y valores:</span>
          <span className={classes.descriptionModalActions} style={{ display: 'block' }}>
            <a
              href="/descargables/cap-presentacion.pdf"
              download
              className={classes.descriptionModalMoreButton}
              onClick={(e) => e.stopPropagation()}
            >
              <IconFileDescription size={13} stroke={1.5} style={{ marginRight: 6, verticalAlign: 'middle', flexShrink: 0 }} />
              DESCARGAR PDF
            </a>
          </span>
        </span>
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
        : getEpitesisOptionsWithIds(epitesisCapOptions, services, serviceEmployees),
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
                        Prótesis de areola pezon hiperrealista. Complejo areola–pezón post mastectomía.
                      </Text>
                      <a
                        href="https://www.instagram.com/s/aGlnaGxpZ2h0OjE3OTUwNTgzNDg3MDk1MDEw?story_media_id=3846893448464467008"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes.igPill}
                      >
                        <IconBrandInstagram size={14} stroke={1.6} className={classes.igPillIcon} />
                        <span>Conocé el proceso · piezas hiperrealistas</span>
                      </a>
                    </Box>
                  </Box>
                  <Box className={classes.buttonsWrapper}>
                    <button
                      type="button"
                      className={classes.ctaButton}
                      onClick={openEpitesisInfo}
                    >
                      MÁS INFO y VALORES
                    </button>
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
                      Seleccioná la opción deseada para más información.
                    </Text>
                    <ServiceAccordion options={epitesisAccordionOptions} />
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
        {/* PDF download section */}
        <div className={classes.descriptionModalDownloadSection}>
          <span className={classes.descriptionModalDownloadLabel}>Más información y valores:</span>
          <div className={classes.descriptionModalActions}>
            <a
              href="/descargables/cap-presentacion.pdf"
              download
              className={classes.descriptionModalMoreButton}
            >
              <IconFileDescription size={13} stroke={1.5} style={{ marginRight: 6, verticalAlign: 'middle', flexShrink: 0 }} />
              DESCARGAR PDF
            </a>
          </div>
        </div>

        {/* Description paragraphs */}
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
