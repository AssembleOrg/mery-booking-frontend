'use client';

import { Checkbox, Text, Stack } from '@mantine/core';
import { motion } from 'framer-motion';
import classes from './ReservaModal.module.css';

interface Step1TermsProps {
  acceptedTerms: boolean;
  onAcceptChange: (value: boolean) => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function Step1Terms({
  acceptedTerms,
  onAcceptChange,
  onContinue,
  onCancel,
}: Step1TermsProps) {
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
          <Text className={classes.stepTitle}>Antes de reservar</Text>
          <Text className={classes.stepDescription}>
            La seña no es reembolsable. Al confirmar tu reserva, aceptás que el
            depósito no será devuelto en caso de cancelación.
          </Text>
        </div>

        <Checkbox
          checked={acceptedTerms}
          onChange={(event) => onAcceptChange(event.currentTarget.checked)}
          label="Entiendo y acepto las condiciones"
          classNames={{
            root: classes.checkbox,
            label: classes.checkboxLabel,
          }}
        />

        <div className={classes.buttonGroup}>
          <button
            onClick={onCancel}
            className={classes.buttonSecondary}
          >
            CANCELAR
          </button>
          <button
            onClick={onContinue}
            disabled={!acceptedTerms}
            className={classes.buttonPrimary}
          >
            CONTINUAR
          </button>
        </div>
      </Stack>
    </motion.div>
  );
}
