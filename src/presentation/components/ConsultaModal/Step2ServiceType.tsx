'use client';

import { useState } from 'react';
import { Box, Text } from '@mantine/core';
import { Radio } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { IconChevronDown } from '@tabler/icons-react';
import classes from './ConsultaModal.module.css';

interface Step2ServiceTypeProps {
  selectedServiceType: string | null;
  onSelectServiceType: (serviceType: string) => void;
  onClearServiceType: () => void;
}

const ACTIVE_OPTIONS = [
  {
    id: 'Servicio 100% customizado',
    label: 'Servicio 100% customizado',
    description:
      'Requiere 2 presencialidades (consulta obligatoria y entrega final, por Mery & Staff). Las piezas se encargan con el compromiso de una seña y conllevan un tiempo de producción de 72 hs hábiles para su entrega con los detalles finales a mano de Mery.',
  },
  {
    id: 'Servicio semi-customizado',
    label: 'Servicio semi-customizado',
    description:
      'La consulta es virtual, se deberán enviar fotos de la zona para recibir asesoramiento. Las piezas se moldean con un modelo de nuestro catálogo de moldes y se realizan detalles personalizados de color (presencialmente el día de la entrega por Mery). En caso de no contar con un modelo que se acerque al tuyo, podés optar por la opción 100% personalizada.',
  },
];

const DISABLED_OPTIONS = [
  { id: 'Servicio por catálogo', label: 'Servicio por catálogo' },
];

// Cards informativos — mismo estilo de dropdown que las activas, sin radio
const INFO_OPTIONS = [
  {
    id: 'special-pass',
    label: 'Special Pass',
    description:
      'Pensado especialmente para clientas que nos visitan desde el interior o el exterior del país. Se trata de disponibilidades exclusivas con horarios y honorarios diferenciales. Podés consultarnos valores y tiempo de entrega para la realización de las piezas el mismo día o en el plazo de 24 hs, escribiendo al ',
    waLink: 'https://wa.me/5491128593378?text=-+Hola+chicas%2C+como+est%C3%A1n%3F+Quisiera+consultar+el+Special+Pass+de+Epitesis+CAP',
    waPhone: '+54 9 11 2859-3378',
  },
  {
    id: 'dona-tu-molde',
    label: 'Doná tu molde',
    description:
      'Una forma generosa y filantrópica de ayudar a más personas a acceder a reconstrucciones hiperrealistas. Contactate con nosotras para coordinar: ',
    waLink: 'https://wa.me/5491128593378?text=-+Hola+chicas%2C+como+est%C3%A1n%3F+Quisiera+donar+mi+molde+para+Epitesis+CAP',
    waPhone: '+54 9 11 2859-3378',
  },
];

export default function Step2ServiceType({
  selectedServiceType,
  onSelectServiceType,
  onClearServiceType,
}: Step2ServiceTypeProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    const isInfoOption = INFO_OPTIONS.some((o) => o.id === id);
    if (isInfoOption) {
      onClearServiceType();
    }
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Box className={classes.stepContainer}>
      <Text className={classes.stepTitle}>¿Qué tipo de servicio buscás?</Text>
      <Text className={classes.stepDescription}>
        Seleccioná la opción que mejor se adapte a tu situación
      </Text>

      <div className={classes.consultaOptionsGrid}>
        {/* Opciones seleccionables con radio */}
        {ACTIVE_OPTIONS.map((option) => (
          <div
            key={option.id}
            className={`${classes.consultaOptionCard} ${
              selectedServiceType === option.id ? classes.consultaOptionCardSelected : ''
            }`}
            onClick={() => onSelectServiceType(option.id)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <Radio
                value={option.id}
                checked={selectedServiceType === option.id}
                onChange={() => onSelectServiceType(option.id)}
                onClick={(e) => e.stopPropagation()}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Text className={classes.consultaOptionLabel} style={{ flex: 1 }}>
                    {option.label}
                  </Text>
                  <motion.span
                    animate={{ rotate: expandedId === option.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexShrink: 0 }}
                    onClick={(e) => { e.stopPropagation(); toggle(option.id); }}
                  >
                    <IconChevronDown size={14} style={{ color: 'var(--mg-gray)', cursor: 'pointer' }} />
                  </motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {expandedId === option.id && (
                    <motion.div
                      key="desc"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <Text className={classes.consultaOptionDescription} style={{ marginTop: 6 }}>
                        {option.description}
                      </Text>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}

        {/* Opciones griseadas — próximamente */}
        {DISABLED_OPTIONS.map((option) => (
          <div key={option.id} className={classes.serviceTypeOptionCardDisabled}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text className={classes.consultaOptionLabel}>{option.label}</Text>
              <span className={classes.comingSoonBadge}>Próximamente</span>
            </div>
          </div>
        ))}

        {/* Opciones informativas — mismo dropdown, sin radio */}
        {INFO_OPTIONS.map((option) => (
          <div
            key={option.id}
            className={classes.consultaOptionCard}
            onClick={() => toggle(option.id)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Text className={classes.consultaOptionLabel} style={{ flex: 1 }}>
                    {option.label}
                  </Text>
                  <motion.span
                    animate={{ rotate: expandedId === option.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexShrink: 0 }}
                  >
                    <IconChevronDown size={14} style={{ color: 'var(--mg-gray)' }} />
                  </motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {expandedId === option.id && (
                    <motion.div
                      key="desc"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <Text className={classes.consultaOptionDescription} style={{ marginTop: 6 }}>
                          {option.description}
                          <a
                            href={option.waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={classes.whatsappLink}
                          >
                            {option.waPhone}
                          </a>
                        </Text>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}
