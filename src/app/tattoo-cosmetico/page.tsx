'use client';

import { Box, Container, Text, Collapse, Select, Button } from '@mantine/core';
import { Header, Footer, DateTimeSelector } from '@/presentation/components';
import Image from 'next/image';
import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
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
}

interface AccordionItemProps {
  option: ServiceOption;
  isOpen: boolean;
  onToggle: () => void;
}

// Componente para el contenido de Consulta (con selector de profesional)
function ConsultaContent({ option }: { option: ServiceOption }) {
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);

  return (
    <Box className={classes.accordionPanelContent}>
      <Text className={classes.panelDescription}>
        {option.description}
      </Text>
      {option.extraDescription && (
        <Text className={classes.panelDescription}>
          {option.extraDescription}
        </Text>
      )}
      <Text className={classes.panelPrice}>
        {option.priceLabel} <span className={classes.priceValue}>{option.priceValue}</span>
      </Text>

      <Box className={classes.bookingCard}>
        <Text className={classes.bookingLabel}>Profesional:</Text>
        <Select
          placeholder="Cualquier profesional"
          data={[
            { value: 'any', label: 'Cualquier profesional' },
            { value: 'mery', label: 'Mery Garcia' },
            { value: 'staff', label: 'Staff MG' },
          ]}
          value={selectedProfessional}
          onChange={setSelectedProfessional}
          className={classes.bookingSelect}
        />
        <Button className={classes.continueButton}>
          Continuar
        </Button>
      </Box>

      {option.footerNote && (
        <Text className={classes.footerNote}>{option.footerNote}</Text>
      )}
      {option.footerNote2 && (
        <Text className={classes.footerNote}>{option.footerNote2}</Text>
      )}
    </Box>
  );
}

// Componente para el contenido de Sesiones (con calendario)
function SesionCalendarioContent({ option }: { option: ServiceOption }) {
  const handleDateTimeSelect = (date: Date, time: string) => {
    // Aquí se manejará la selección de fecha y hora
    console.log('Fecha seleccionada:', date, 'Hora:', time);
    // TODO: Implementar lógica de reserva
  };

  const handleBack = () => {
    // TODO: Implementar lógica de volver atrás
    console.log('Volver atrás');
  };

  return (
    <Box className={classes.accordionPanelContent}>
      <Text className={classes.panelDescription}>
        {option.description}
      </Text>
      <Text className={classes.panelPrice}>
        {option.priceLabel} <span className={classes.priceValue}>{option.priceValue}</span>
        {option.priceEffective && (
          <> (en efectivo <span className={classes.priceValue}>{option.priceEffective}</span>)</>
        )}
        {option.depositLabel && (
          <> {option.depositLabel} <span className={classes.depositValue}>{option.depositValue}</span></>
        )}
      </Text>
      {option.cuotasText && (
        <Text className={classes.panelCuotas}>{option.cuotasText}</Text>
      )}

      <Box className={classes.calendarCard}>
        <DateTimeSelector
          serviceDuration={60}
          onSelectDateTime={handleDateTimeSelect}
          onBack={handleBack}
          showBackButton={true}
        />
      </Box>

      {option.promoText && (
        <Text className={classes.promoText}>{option.promoText}</Text>
      )}
    </Box>
  );
}

// Componente para Last Minute (sin disponibilidad)
function LastMinuteContent({ option }: { option: ServiceOption }) {
  return (
    <Box className={classes.accordionPanelContent}>
      <Text className={classes.panelDescription}>
        {option.description}
      </Text>
      <Text className={classes.panelPrice}>
        {option.priceLabel} <span className={classes.priceValue}>{option.priceValue}</span>
        {option.priceEffective && (
          <> (<span className={classes.priceValue}>{option.priceEffective}</span> en efectivo)</>
        )}
        {option.depositLabel && (
          <> {option.depositLabel} <span className={classes.depositValue}>{option.depositValue}</span></>
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
          Actualmente no hay citas disponible. Ingresa periódicamente para verificar nuevas disponibilidades
        </Text>
      </Box>
    </Box>
  );
}

function AccordionItem({ option, isOpen, onToggle }: AccordionItemProps) {
  const renderContent = () => {
    switch (option.contentType) {
      case 'consulta-sin-trabajo':
      case 'consulta-con-trabajo':
        return <ConsultaContent option={option} />;
      case 'sesion-calendario':
      case 'retoque-calendario':
      case 'mantenimiento-calendario':
        return <SesionCalendarioContent option={option} />;
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
          className={`${classes.accordionChevron} ${isOpen ? classes.accordionChevronOpen : ''}`} 
        />
        <span className={classes.accordionLabel}>{option.label}</span>
      </button>
      <Collapse in={isOpen}>
        <Box className={classes.accordionPanel}>
          {renderContent()}
        </Box>
      </Collapse>
    </Box>
  );
}

interface ServiceAccordionProps {
  options: ServiceOption[];
}

function ServiceAccordion({ options }: ServiceAccordionProps) {
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
    description: 'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    footerNote: '(*) Espacio para que conozcas nuestro modo de trabajo, técnica y cuidados que deberás cumplir. Dibujamos los resultados que buscamos y saldamos todas tus dudas.',
    footerNote2: 'Sin consulta previa no podremos brindarte un servicio MG.',
  },
  { 
    id: 'nano-2', 
    label: 'Consulta Obligatoria CON trabajo previo (*)',
    contentType: 'consulta-con-trabajo',
    description: 'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    extraDescription: 'Se considera trabajo previo a cualquier servicio de cosmetic tattoo en cejas que no haya sido realizado por MG & Staff.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    footerNote: '(*) Espacio para que conozcas nuestro modo de trabajo, técnica y cuidados que deberás cumplir. Dibujamos los resultados que buscamos y saldamos todas tus dudas.',
    footerNote2: 'Sin consulta previa no podremos brindarte un servicio MG.',
  },
  { 
    id: 'nano-3', 
    label: '1ª Sesión (By Mery Garcia)',
    contentType: 'sesion-calendario',
    description: 'Primera experiencia de Nanoblading con nosotras. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 610.-',
    priceEffective: 'U$S 420.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'nano-4', 
    label: '2ª Sesión - Retoque (By Mery Garcia)',
    contentType: 'retoque-calendario',
    description: 'Completá tu servicio de Nanoblading entre 30 y 60 días después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 317.-',
    priceEffective: 'U$S 180.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'nano-5', 
    label: 'Mantenimiento (By Mery Garcia)',
    contentType: 'mantenimiento-calendario',
    description: 'Reactiva tu servicio de Nanoblading. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 610.-',
    priceEffective: 'U$S 420.- en efectivo',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'nano-6', 
    label: 'Last Minute Booking Nanoblading (Mantenimiento)',
    contentType: 'last-minute',
    description: 'Reactiva tu servicio de Nanoblading. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 488.-',
    priceEffective: 'U$S 336.-',
    depositLabel: ' Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    promoText: 'Reservá tu cita 20% OFF SOLO para clientas de tatuaje cosmético MG. La seña NO es reembolsable.',
  },
];

const lipBlushOptions: ServiceOption[] = [
  { 
    id: 'lip-1', 
    label: 'Consulta previa',
    contentType: 'sesion-calendario',
    description: 'Un espacio reservado para saldar tus dudas y que Mery de manera personalizada pueda hacerte una demostración de diseño elegido especialmente para vos. Por favor, lee atentamente la información previa y en caso de que quieras, solicita los cuidados post de tu Lip Blush y el consentimiento informado.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'lip-2', 
    label: '1ª Sesión',
    contentType: 'sesion-calendario',
    description: 'Primer experiencia de Lip Blush con nosotras. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 650.-',
    priceEffective: 'U$S 475.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'lip-3', 
    label: '2ª Sesión - Retoque',
    contentType: 'retoque-calendario',
    description: 'Completá tu servicio de Lip Blush entre 30 y 60 días después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 317.-',
    priceEffective: 'U$S 180.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'lip-4', 
    label: 'Mantenimiento',
    contentType: 'mantenimiento-calendario',
    description: 'Reactiva tu servicio de Lip Blush. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 650.-',
    priceEffective: 'U$S 475.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'lip-5', 
    label: 'Last Minute Booking Lip Blush (Mantenimiento)',
    contentType: 'last-minute',
    description: 'Reactiva tu servicio de Lip Blush. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 520.-',
    priceEffective: 'U$S 380.-',
    depositLabel: ' Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    promoText: 'Reservá tu cita 20% OFF SOLO para clientas de tatuaje cosmético MG. La seña NO es reembolsable.',
  },
];

const lipCamouflageOptions: ServiceOption[] = [
  { 
    id: 'lipcam-1', 
    label: 'Lip Camouflage Consulta previa Obligatoria',
    contentType: 'consulta-con-trabajo',
    description: 'Te recordamos que la consulta es OBLIGATORIA. En caso de concurrir sin haberla realizado, NO podrás realizarte el servicio.',
    extraDescription: 'Se considera trabajo previo a cualquier servicio de Cosmetic Tattoo que no haya sido realizado por MG & Staff.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
  },
  { 
    id: 'lipcam-2', 
    label: 'Lip Camouflage by Mery Garcia',
    contentType: 'sesion-calendario',
    description: 'Servicio de corrección y mejora de trabajos previos en labios.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 600.-',
    priceEffective: 'U$S 420.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
];

const lashesLineOptions: ServiceOption[] = [
  { 
    id: 'lash-1', 
    label: 'Consulta previa',
    contentType: 'sesion-calendario',
    description: 'Un espacio reservado para saldar tus dudas y que Mery Garcia & Staff de manera personalizada pueda hacerte una demostración de diseño elegido especialmente para vos.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'AR$ 50.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'lash-2', 
    label: '1ª Sesión',
    contentType: 'sesion-calendario',
    description: 'Primer experiencia de Lashes Line con nosotras. Recordá que los resultados óptimos se logran con dos sesiones.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 480.-',
    priceEffective: 'U$S 320.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'lash-3', 
    label: '2ª Sesión - Retoque',
    contentType: 'retoque-calendario',
    description: 'Completá tu servicio de Lashes Line entre 30 y 60 días después de tu primera sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 317.-',
    priceEffective: 'U$S 180.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'lash-4', 
    label: 'Mantenimiento',
    contentType: 'mantenimiento-calendario',
    description: 'Reactiva tu servicio de Lashes Line. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 480.-',
    priceEffective: 'U$S 320.-',
    depositLabel: ') Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    cuotasText: 'Acercate a nuestro local para acceder a 3 cuotas sin interés pagando con tarjeta física de cualquier banco.',
  },
  { 
    id: 'lash-5', 
    label: 'Last Minute Booking Lashes Line (Mantenimiento)',
    contentType: 'last-minute',
    description: 'Reactiva tu servicio de Lashes Line. Se considera mantenimiento al servicio a realizarse pasados los 90 días de tu última sesión.',
    priceLabel: 'Precio de lista del servicio:',
    priceValue: 'U$S 384.-',
    priceEffective: 'U$S 256.-',
    depositLabel: ' Valor de la seña:',
    depositValue: 'AR$ 100.000.-',
    promoText: 'Reservá tu cita 20% OFF SOLO para clientas de tatuaje cosmético MG. La seña NO es reembolsable.',
  },
];

export default function TattooCosmeticoPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openWhatsApp = (message: string) => {
    const phoneNumber = '5491161592591';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <>
      <Header />
      
      <Box className={classes.pageWrapper}>
        {/* Hero Section */}
        <Box className={classes.heroSection}>
          <Image
            src="/images/im.2-op-2-scaled-1.webp"
            alt="Cosmetic Tattoo"
            fill
            priority
            className={classes.heroImage}
            quality={90}
          />
          <Box className={classes.heroOverlay} />
          <Container size="xl" className={classes.heroContent}>
            <Text className={classes.heroTitle}>
              COSMETIC TATTOO
            </Text>
            
            {/* Sub Menu Navigation */}
            <Box className={classes.subMenuNav}>
              <Box className={classes.subMenuItem} onClick={() => scrollToSection('nanoblading')}>
                <span className={classes.subMenuIcon}>▼</span>
                <span>NANOBLADING</span>
              </Box>
              <Box className={classes.subMenuItem} onClick={() => scrollToSection('lip-blush')}>
                <span className={classes.subMenuIcon}>▼</span>
                <span>LIP BLUSH</span>
              </Box>
              <Box className={classes.subMenuItem} onClick={() => scrollToSection('lip-camouflage')}>
                <span className={classes.subMenuIcon}>▼</span>
                <span>LIP CAMOUFLAGE</span>
              </Box>
              <Box className={classes.subMenuItem} onClick={() => scrollToSection('lashes-line')}>
                <span className={classes.subMenuIcon}>▼</span>
                <span>LASHES LINE</span>
              </Box>
              <Box className={classes.subMenuItem} onClick={() => scrollToSection('pecas-lunares')}>
                <span className={classes.subMenuIcon}>▼</span>
                <span>PECAS Y LUNARES</span>
              </Box>
              <Box className={classes.subMenuItem} onClick={() => scrollToSection('camuflaje')}>
                <span className={classes.subMenuIcon}>▼</span>
                <span>CAMUFLAJE</span>
              </Box>
              <Box className={classes.subMenuItem} onClick={() => scrollToSection('clientes-exterior')}>
                <span className={classes.subMenuIcon}>▼</span>
                <span>CLIENTES DEL EXTERIOR / INTERIOR</span>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Content Section */}
        <Box className={classes.contentSection}>
          <Container size="xl">
            
            {/* NANOBLADING Section */}
            <Box id="nanoblading" className={classes.serviceBlock}>
              <Box className={classes.serviceLayout}>
                <Box className={classes.serviceImageWrapper}>
                  <Image
                    src="/images/im.2-op-2-scaled-1.webp"
                    alt="Nanoblading"
                    fill
                    className={classes.serviceImage}
                    quality={85}
                  />
                </Box>
                <Box className={classes.serviceContent}>
                  <Text className={classes.serviceTitle}>NANOBLADING</Text>
                  <Text className={classes.serviceDescription}>
                    Es la técnica más avanzada de cosmetic tattoo de cejas. Servicio único y exclusivo brindado por MG y su staff.
                  </Text>
                  <Text className={classes.serviceDescription}>
                    Si estás buscando mejorar la forma de tus cejas, completar o rellenar zonas donde no tenés mucho crecimiento, o nada de pelo, o donde haya cicatrices, este servicio es el indicado para vos.
                  </Text>
                  <Text className={classes.serviceDescription}>
                    Permite lograr excelentes resultados en todo tipo de pieles, mayor hiper realismo y un acabado imperceptible. Genera menor trauma en la piel, mayor durabilidad y vibración del color. El procedimiento se realiza con maquina a la misma profundidad del Microblading (muy superficial) pero con agujas aún más pequeñas que permiten terminaciones plásticas infinitas (sombras, trazos, ramilletes de pelo, etc.) Recomendamos esta técnica para casos de alopecias, tricotilomanías, pieles maduras o muy finas, o tratamientos oncológicos. Pero también brinda resultados óptimos en pieles normales sin dificultad de crecimiento y/o con cicatrices.
                  </Text>
                  <Text className={classes.serviceDescription}>
                    Mas de cuatro años de practica y perfeccionamientos constantes en el exterior dieron por resultado que el ultimo año Mery Garcia utilizara Nanoblading para dar respuesta a todas las personas que buscan mejorar sus cejas a través del tatuaje cosmético.
                  </Text>
                  <Box className={classes.buttonsWrapper}>
                    <button className={classes.ctaButton}>MÁS INFO AQUÍ</button>
                  </Box>
                </Box>
              </Box>
              
              <Box className={classes.optionsSection}>
                <Text className={classes.optionsTitle}>Seleccioná la opción deseada para solicitar tu cita:</Text>
                <ServiceAccordion options={nanobladingOptions} />
              </Box>
            </Box>

            {/* LIP BLUSH Section */}
            <Box id="lip-blush" className={classes.serviceBlock}>
              <Box className={classes.serviceLayout}>
                <Box className={classes.serviceImageWrapper}>
                  <Image
                    src="/images/Lip-blush-1-1-768x512.webp"
                    alt="Lip Blush"
                    fill
                    className={classes.serviceImage}
                    quality={85}
                  />
                </Box>
                <Box className={classes.serviceContent}>
                  <Text className={classes.serviceTitle}>LIP BLUSH</Text>
                  <Text className={classes.serviceDescription}>
                    Es un maquillaje semi permanente que dura entre 18 y 24 meses. El procedimiento consta de una primera sesión y un retoque para terminar de definir unos labios perfectos a los 30 o 60 días.
                  </Text>
                  <Box className={classes.buttonsWrapper}>
                    <button className={classes.ctaButton}>MÁS INFO AQUÍ</button>
                  </Box>
                </Box>
              </Box>
              
              <Box className={classes.optionsSection}>
                <Text className={classes.optionsTitle}>Seleccioná la opción deseada para solicitar tu cita:</Text>
                <ServiceAccordion options={lipBlushOptions} />
              </Box>
            </Box>

            {/* LIP CAMOUFLAGE Section */}
            <Box id="lip-camouflage" className={classes.serviceBlock}>
              <Box className={classes.serviceLayout}>
                <Box className={classes.serviceImageWrapper}>
                  <Image
                    src="/images/lim-camouflage.webp"
                    alt="Lip Camouflage"
                    fill
                    className={classes.serviceImage}
                    quality={85}
                  />
                </Box>
                <Box className={classes.serviceContent}>
                  <Text className={classes.serviceTitle}>LIP CAMPUFLAGE</Text>
                  <Text className={classes.serviceDescription}>
                    Es un servicio que combina despigmentación, corrección de color, textura y estructura para MEJORAR EL ASPECTO de un trabajo mal hecho o deteriorado.
                  </Text>
                  <Text className={classes.serviceDescription}>
                    Servicio dirigido a personas que tengan un trabajo previo mal realizado o deteriorado. En la consulta podremos indicarte si está dentro de nuestras posibilidades mejorarlo.
                  </Text>
                  <Box className={classes.buttonsWrapper}>
                    <button className={classes.ctaButton}>MÁS INFO AQUÍ</button>
                  </Box>
                </Box>
              </Box>
              
              <Box className={classes.optionsSection}>
                <Text className={classes.optionsTitle}>Seleccioná la opción deseada para solicitar tu cita:</Text>
                <ServiceAccordion options={lipCamouflageOptions} />
              </Box>
            </Box>

            {/* LASHES LINE Section */}
            <Box id="lashes-line" className={classes.serviceBlock}>
              <Box className={classes.serviceLayout}>
                <Box className={classes.serviceImageWrapper}>
                  <Image
                    src="/images/lashes_line_b.webp"
                    alt="Lashes Line"
                    fill
                    className={classes.serviceImage}
                    quality={85}
                  />
                </Box>
                <Box className={classes.serviceContent}>
                  <Text className={classes.serviceTitle}>LASHES LINE</Text>
                  <Text className={classes.serviceSubtitle}>
                    ✨ Lashes Line ✨ New Service en #TattoCosmetic #ByMeryGarcia
                  </Text>
                  <Text className={classes.serviceSubtitleQuestion}>¿Qué buscamos?</Text>
                  <Text className={classes.serviceDescription}>
                    Un efecto súper #Natural, no simulamos un ojo delineado, sino un efecto óptico de mayor volumen y densidad. Convive a la perfección con otros servicios, como el lifting y tinte de pestañas, y por supuesto unas cejas espectaculares By Mery Garcia & Staff.
                  </Text>
                  <Text className={classes.serviceDescription}>
                    <span className={classes.serviceHighlight}>✨ Preparate para lucir una mirada increíble pero sobre todo natural ✨</span>
                  </Text>
                  <Box className={classes.buttonsWrapper}>
                    <button className={classes.ctaButton}>MÁS INFO AQUÍ</button>
                  </Box>
                </Box>
              </Box>
              
              <Box className={classes.optionsSection}>
                <Text className={classes.optionsTitle}>Seleccioná la opción deseada para solicitar tu cita:</Text>
                <ServiceAccordion options={lashesLineOptions} />
              </Box>
            </Box>

            {/* PECAS Y LUNARES Section */}
            <Box id="pecas-lunares" className={classes.serviceBlock}>
              <Box className={classes.serviceLayout}>
                <Box className={classes.serviceImageWrapper}>
                  <Image
                    src="/images/web-pecas-1-768x578.webp"
                    alt="Pecas y Lunares"
                    fill
                    className={classes.serviceImage}
                    quality={85}
                  />
                </Box>
                <Box className={classes.serviceContent}>
                  <Text className={classes.serviceTitle}>PECAS Y LUNARES</Text>
                  <Text className={classes.serviceDescription}>
                    En el caso de las pecas es una técnica muy novedosa, consta en generar un tatuaje muy superficial por medio de pequeños puntos donde se inserta la tinta y así lograr un efecto hiper realista con acabados del tipo peca o lunar. La durabilidad oscila entre los 5 meses o 6 meses máximo, según el tipo de piel y el cuidado que haya recibido. Finalizado este tiempo la piel queda LIMPIA, sin registro de tinta alguna y sin dejar cicatriz.
                  </Text>
                  <Box className={classes.buttonsWrapper}>
                    <button 
                      className={classes.ctaButton}
                      onClick={() => openExternalLink('https://merygarcia.com.ar/servicios/pecas-lunares')}
                    >
                      MÁS INFO AQUÍ
                    </button>
                    <button 
                      className={classes.ctaButtonSecondary}
                      onClick={() => openWhatsApp('Quiero consultar sobre Pecas y Lunares')}
                    >
                      CONSULTAR DISPONIBILIDAD
                    </button>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* CAMUFLAJE Section */}
            <Box id="camuflaje" className={classes.serviceBlock}>
              <Box className={classes.serviceLayout}>
                <Box className={classes.serviceImageWrapper}>
                  <Image
                    src="/images/camuflaje.webp"
                    alt="Camuflaje"
                    fill
                    className={classes.serviceImage}
                    quality={85}
                  />
                </Box>
                <Box className={classes.serviceContent}>
                  <Text className={classes.serviceTitle}>CAMUFLAJE</Text>
                  <Text className={classes.serviceDescription}>
                    Es un servicio que combina despigmentación, corrección de color, textura y estructura para MEJORAR EL ASPECTO de un trabajo mal hecho o deteriorado tanto de Dermopigmentación como de Microblading.
                  </Text>
                  <Text className={classes.serviceDescription}>
                    Servicio dirigido a personas que tengan un trabajo previo mal realizado o deteriorado. Completando el siguiente formulario podremos indicarte si está dentro de nuestras posibilidades mejorarlo.
                  </Text>
                  <Box className={classes.buttonsWrapper}>
                    <button 
                      className={classes.ctaButton}
                      onClick={() => openExternalLink('https://merygarcia.com.ar/servicios/nanoblading')}
                    >
                      CONSULTAR VALORES
                    </button>
                    <button 
                      className={classes.ctaButtonSecondary}
                      onClick={() => openWhatsApp('Tengo un trabajo previo, quisiera consultar por el servicio de Camuflaje')}
                    >
                      CONSULTA DISPONIBILIDAD Y RESERVÁ TU CITA
                    </button>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* CLIENTES DEL INTERIOR / EXTERIOR Section */}
            <Box id="clientes-exterior" className={classes.specialSection}>
              <Box className={classes.serviceLayout}>
                <Box className={classes.specialImageWrapper}>
                  <Image
                    src="/Exterior.svg"
                    alt="Clientes del Interior / Exterior"
                    width={320}
                    height={240}
                    className={classes.specialImage}
                    quality={85}
                    style={{ filter: 'none' }}
                  />
                </Box>
                <Box className={classes.serviceContent}>
                  <Text className={classes.serviceTitle}>CLIENTES DEL INTERIOR / EXTERIOR</Text>
                  <Text className={classes.serviceDescription}>
                    Si residís en el interior de nuestro país o en el exterior y querés tener una experiencia MG, contamos con disponibilidades especiales para que puedas tomar tus servicios. Consultá las condiciones de Special Pass.
                  </Text>
                  <Box className={classes.buttonsWrapper}>
                    <button 
                      className={classes.ctaButton}
                      onClick={() => openWhatsApp('Quiero consultar por una cita especial con MG')}
                    >
                      CONSULTÁ COMO ACCEDER A TU CITA ESPECIAL, VALORES Y MODALIDAD
                    </button>
                  </Box>
                </Box>
              </Box>
            </Box>

          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  );
}
