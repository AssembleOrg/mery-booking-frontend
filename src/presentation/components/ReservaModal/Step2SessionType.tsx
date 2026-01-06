'use client';

import { Text, Stack, Radio } from '@mantine/core';
import { motion } from 'framer-motion';
import classes from './ReservaModal.module.css';
import type { ServiceOption } from '@/infrastructure/types/services';

interface Step2SessionTypeProps {
  serviceOptions: ServiceOption[];
  selectedOption: ServiceOption | null;
  onSelectOption: (option: ServiceOption) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step2SessionType({
  serviceOptions,
  selectedOption,
  onSelectOption,
  onContinue,
  onBack,
}: Step2SessionTypeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={classes.stepContainer}
    >
      <Stack gap="xl">
        <div>
          <Text className={classes.stepTitle}>Elegí tu sesión</Text>
          <Text className={classes.stepDescription}>
            Seleccioná el tipo de sesión que querés reservar
          </Text>
        </div>

        <Stack gap="md">
          {serviceOptions.map((option) => (
            <div
              key={option.id}
              className={`${classes.optionCard} ${
                selectedOption?.id === option.id ? classes.optionCardSelected : ''
              }`}
              onClick={() => onSelectOption(option)}
            >
              <Radio
                value={option.id}
                checked={selectedOption?.id === option.id}
                onChange={() => onSelectOption(option)}
                label={
                  <div className={classes.optionContent}>
                    <Text className={classes.optionLabel}>{option.label}</Text>
                    {option.priceValue && (
                      <Text className={classes.optionPrice}>{option.priceValue}</Text>
                    )}
                    {option.description && (
                      <Text className={classes.optionDescription}>
                        {option.description}
                      </Text>
                    )}
                  </div>
                }
                classNames={{
                  root: classes.radioRoot,
                  radio: classes.radio,
                }}
              />
            </div>
          ))}
        </Stack>

        <div className={classes.buttonGroup}>
          <button
            onClick={onBack}
            className={classes.buttonSecondary}
          >
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
      </Stack>
    </motion.div>
  );
}
