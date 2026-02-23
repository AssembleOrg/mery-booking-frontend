'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { AnimatePresence } from 'framer-motion';
import { StepIndicator } from '../ReservaModal/StepIndicator';
import { Step1Terms } from '../ReservaModal/Step1Terms';
import { Step4Confirmation } from '../ReservaModal/Step4Confirmation';
import { Step5PaymentSummary } from '../ReservaModal/Step5PaymentSummary';
import classes from './EstilismoReservaModal.module.css';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee, ServiceEntity } from '@/infrastructure/http';
import { getEstilismoListPriceArs } from '@/config/estilismoPricing';

interface EstilismoReservaModalProps {
  opened: boolean;
  onClose: () => void;
  serviceName: string;
  service: ServiceEntity;
  employee: Employee;
  selectedDate: Date;
  selectedTime: string;
  services: ServiceEntity[];
  employees: Employee[];
}

export function EstilismoReservaModal({
  opened,
  onClose,
  serviceName,
  service,
  employee,
  selectedDate,
  selectedTime,
  services,
  employees,
}: EstilismoReservaModalProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [clientData, setClientData] = useState<{
    name: string;
    surname: string;
    email: string;
    mobile: string;
    dni: string;
    notes?: string;
  } | null>(null);
  const [confirmationModalOpened, setConfirmationModalOpened] = useState(false);

  // Construir ServiceOption a partir de los datos recibidos
  const serviceOption: ServiceOption = useMemo(() => ({
    id: service.id,
    label: service.name,
    contentType: 'sesion',
    serviceId: service.id,
    employeeId: employee.id,
    serviceDuration: service.duration,
    priceValue: `AR$ ${service.price}.-`,
  }), [service, employee]);

  const informationalListPriceArs = useMemo(() => {
    return getEstilismoListPriceArs(service.name);
  }, [service.name]);

  const handleClose = () => {
    setCurrentStep(1);
    setAcceptedTerms(false);
    setClientData(null);
    setConfirmationModalOpened(false);
    onClose();
  };

  const handleStepComplete = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      centered
      padding={0}
      radius={isMobile ? 0 : 'md'}
      fullScreen={isMobile}
      classNames={{
        content: classes.modalContent,
        header: classes.modalHeader,
        body: classes.modalBody,
      }}
      withCloseButton={false}
    >
      <div className={classes.container}>
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        {/* Content Area */}
        <div className={classes.contentArea}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1Terms
                key="step1"
                acceptedTerms={acceptedTerms}
                onAcceptChange={setAcceptedTerms}
                onContinue={handleStepComplete}
                onCancel={handleClose}
                serviceName={serviceName}
                onClose={onClose}
                showConsultaWarning={false}
              />
            )}

            {currentStep === 2 && (
              <Step4Confirmation
                key="step2"
                serviceName={serviceName}
                selectedOption={serviceOption}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                employees={employees}
                services={services}
                selectedEmployeeId={employee.id}
                confirmationModalOpened={confirmationModalOpened}
                onConfirmationModalClose={() => setConfirmationModalOpened(false)}
                onClientDataCollected={(data) => {
                  setClientData(data);
                  handleStepComplete();
                }}
              />
            )}

            {currentStep === 3 && clientData && (
              <Step5PaymentSummary
                key="step3"
                serviceName={serviceName}
                selectedOption={serviceOption}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                clientData={clientData}
                employees={employees}
                services={services}
                selectedEmployeeId={employee.id}
                informationalListPriceArs={informationalListPriceArs ?? undefined}
                onBack={handleStepBack}
              />
            )}
          </AnimatePresence>
        </div>

        {currentStep === 2 && (
          <div className={classes.buttonGroup}>
            <button type="button" onClick={handleStepBack} className={classes.buttonSecondary}>
              ATRÁS
            </button>
            <button
              type="button"
              onClick={() => setConfirmationModalOpened(true)}
              className={classes.buttonPrimary}
            >
              CONFIRMAR RESERVA
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
