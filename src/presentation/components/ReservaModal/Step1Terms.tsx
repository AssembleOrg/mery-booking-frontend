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
  serviceKey?: string;
}

export function Step1Terms({
  acceptedTerms,
  onAcceptChange,
  onContinue,
  onCancel,
  serviceName,
  onClose,
  showConsultaWarning = true,
  serviceKey,
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
        {serviceKey === 'scar-camouflage' && (
          <Alert
            color="pink"
            variant="light"
            icon={<IconAlertCircle size={16} />}
            title="Antes de continuar — Scar Camouflage"
          >
            <Text size="sm" mb={6}>
              <strong>Precio del servicio:</strong> El costo final varía entre{' '}
              <strong>U$S 200 y U$S 400</strong> según la zona a tratar.
              La seña de <strong>AR$ 50.000.-</strong> se abona hoy al reservar la consulta.
            </Text>
            <Text size="sm" mb={10}>
              <strong>Importante:</strong> Antes de la consulta es necesario enviar una foto
              de la zona a tratar al WhatsApp de recepción, para que Mery García evalúe
              la viabilidad del tratamiento.
            </Text>
            <a
              href="https://wa.me/5491161592591?text=Hola%2C%20quiero%20enviar%20una%20foto%20para%20consulta%20de%20Scar%20Camouflage"
              target="_blank"
              rel="noopener noreferrer"
              className={classes.whatsappButton}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar foto al WhatsApp de recepción
            </a>
          </Alert>
        )}

        {serviceKey === 'epitesis-cap' && (
          <Alert
            color="pink"
            variant="light"
            icon={<IconAlertCircle size={16} />}
            title="Antes de continuar — Epitesis CAP"
          >
            <Text size="sm" mb={6}>
              <strong>Requisito médico:</strong> Es indispensable contar con el{' '}
              <strong>aval de tu médico</strong> para poder realizar este servicio.
            </Text>
            <Text size="sm">
              La consulta inicial es el primer paso: nos conoceremos, analizaremos tu caso
              y evaluaremos si podemos acompañarte en el proceso.
            </Text>
          </Alert>
        )}

        {showConsultaWarning && serviceName && serviceKey !== 'scar-camouflage' && serviceKey !== 'epitesis-cap' && (
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

        <div className={`${classes.buttonGroup} ${classes.desktopOnly}`}>
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
