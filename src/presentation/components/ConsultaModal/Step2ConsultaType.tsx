'use client';

import { Box, Text, Button, Radio } from '@mantine/core';
import type { ServiceOption } from '@/infrastructure/types/services';
import classes from './ConsultaModal.module.css';

interface Step2ConsultaTypeProps {
  consultaOptions: ServiceOption[];
  selectedOption: ServiceOption | null;
  onSelectOption: (option: ServiceOption) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function Step2ConsultaType({
  consultaOptions,
  selectedOption,
  onSelectOption,
  onBack,
  onContinue,
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
                  {option.priceValue && (
                    <Text className={classes.consultaOptionPrice}>
                      {option.priceValue}
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

      <div className={classes.buttonGroup}>
        <button onClick={onBack} className={classes.buttonSecondary}>
          ATRÁS
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedOption}
          className={classes.buttonPrimary}
        >
          CONTINUAR
        </button>
      </div>
    </Box>
  );
}
