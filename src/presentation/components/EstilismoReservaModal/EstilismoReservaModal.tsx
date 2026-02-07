'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@mantine/core';
import { AnimatePresence } from 'framer-motion';
import { StepIndicator } from '../ReservaModal/StepIndicator';
import { Step1Terms } from '../ReservaModal/Step1Terms';
import { Step4Confirmation } from '../ReservaModal/Step4Confirmation';
import { Step5PaymentSummary } from '../ReservaModal/Step5PaymentSummary';
import classes from './EstilismoReservaModal.module.css';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee, ServiceEntity } from '@/infrastructure/http';

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

  const handleClose = () => {
    setCurrentStep(1);
    setAcceptedTerms(false);
    setClientData(null);
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
      radius="md"
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
                onClientDataCollected={(data) => {
                  setClientData(data);
                  handleStepComplete();
                }}
                onBack={handleStepBack}
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
                onBack={handleStepBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
