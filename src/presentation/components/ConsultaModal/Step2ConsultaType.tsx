'use client';

import { Box, Text, Button, Radio } from '@mantine/core';
import type { ServiceOption } from '@/infrastructure/types/services';
import classes from './ConsultaModal.module.css';

interface Step2ConsultaTypeProps {
  consultaOptions: ServiceOption[];
  selectedOption: ServiceOption | null;
  onSelectOption: (option: ServiceOption) => void;
}

export default function Step2ConsultaType({
  consultaOptions,
  selectedOption,
  onSelectOption,
}: Step2ConsultaTypeProps) {
  return (
    <Box className={classes.stepContainer}>
      <Text className={classes.stepTitle}>
        Seleccioná el tipo de consulta
      </Text>
      <Text className={classes.stepDescription}>
        Elegí la opción que mejor se adapte a tu situación
      </Text>

      <div className={classes.consultaOptionsGrid}>
        {consultaOptions.map((option) => (
          <div
            key={option.id}
            className={`${classes.consultaOptionCard} ${
              selectedOption?.id === option.id
                ? classes.consultaOptionCardSelected
                : ''
            }`}
            onClick={() => onSelectOption(option)}
          >
            <Radio
              value={option.id}
              checked={selectedOption?.id === option.id}
              onChange={() => onSelectOption(option)}
              label={
                <div className={classes.consultaOptionContent}>
                  <Text className={classes.consultaOptionLabel}>
                    {option.label}
                  </Text>
                  {(option.servicePrice !== undefined || option.priceValue) && (
                    <Text className={classes.consultaOptionPrice}>
                      {option.servicePrice !== undefined
                        ? `AR$ ${option.servicePrice.toLocaleString('es-AR')}.-`
                        : option.priceValue}
                    </Text>
                  )}
                  {option.description && (
                    <Text className={classes.consultaOptionDescription}>
                      {option.description}
                    </Text>
                  )}
                </div>
              }
            />
          </div>
        ))}
      </div>

      {consultaOptions.some((o) => o.id === 'epitesis-consulta') && (
        <div className={classes.consultaOptionCardInfo}>
          <div className={classes.consultaOptionContent}>
            <span className={classes.consultaOptionInfoBadge}>Informativo</span>
            <Text className={classes.consultaOptionLabel}>
              Epitesis CAP — Doná tu molde
            </Text>
            <Text className={classes.consultaOptionDescription}>
              Una forma generosa y filantrópica de ayudar a más personas a acceder a reconstrucciones hiperrealistas.{' '}
              <strong>Contactate con nosotras</strong> para coordinar:{' '}
              <a
                href="https://wa.me/5491128593378?text=-+Hola+chicas%2C+como+est%C3%A1n%3F+Quisiera+donar+mi+molde+para+Epitesis+CAP"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={classes.whatsappLink}
              >
                +54 9 11 2859-3378
              </a>
            </Text>
          </div>
        </div>
      )}

    </Box>
  );
}
