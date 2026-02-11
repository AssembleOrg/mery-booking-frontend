'use client';

import { Checkbox, Text, Stack, Alert, Anchor } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import classes from './ReservaModal.module.css';

interface Step1TermsProps {
  acceptedTerms: boolean;
  onAcceptChange: (value: boolean) => void;
  onContinue: () => void;
  onCancel: () => void;
  serviceName?: string;
  onClose?: () => void;
  showConsultaWarning?: boolean;
}

export function Step1Terms({
  acceptedTerms,
  onAcceptChange,
  onContinue,
  onCancel,
  serviceName,
  onClose,
  showConsultaWarning = true,
}: Step1TermsProps) {
  const handleConsultaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClose) {
      onClose();
      setTimeout(() => {
        const consultasSection = document.getElementById('consultas');
        if (consultasSection) {
          consultasSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={classes.stepContainer}
    >
      <Stack gap="xl">
        {showConsultaWarning && serviceName && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Consulta Previa Obligatoria"
            color="pink"
            variant="light"
            className={classes.consultaWarning}
          >
            <Text size="sm">
              Si es tu primera sesión de {serviceName}, debes realizar una{' '}
              <strong>consulta previa obligatoria</strong> antes de reservar.
            </Text>
          </Alert>
        )}

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
