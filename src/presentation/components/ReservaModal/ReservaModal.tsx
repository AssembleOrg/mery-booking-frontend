'use client';

import { useState } from 'react';
import { Modal } from '@mantine/core';
import { AnimatePresence } from 'framer-motion';
import { StepIndicator } from './StepIndicator';
import { Step1Terms } from './Step1Terms';
import { Step2SessionType } from './Step2SessionType';
import { Step3Calendar } from './Step3Calendar';
import { Step4Confirmation } from './Step4Confirmation';
import classes from './ReservaModal.module.css';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { Employee } from '@/infrastructure/http/employeeService';
import type { ServiceEntity } from '@/infrastructure/http/serviceService';

interface ReservaModalProps {
  opened: boolean;
  onClose: () => void;
  serviceName: string;
  serviceKey: string;
  serviceOptions: ServiceOption[];
  services: ServiceEntity[];
  employees: Employee[];
  staffConsultasId?: string;
  meryGarciaId?: string;
}

export function ReservaModal({
  opened,
  onClose,
  serviceName,
  serviceKey,
  serviceOptions,
  services,
  employees,
  staffConsultasId,
  meryGarciaId,
}: ReservaModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleClose = () => {
    // Reset estado al cerrar
    setCurrentStep(1);
    setAcceptedTerms(false);
    setSelectedOption(null);
    setSelectedDate(null);
    setSelectedTime(null);
    onClose();
  };

  const handleStepComplete = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBookingComplete = () => {
    // Cerrar modal y resetear después de crear reserva exitosamente
    handleClose();
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
        <StepIndicator currentStep={currentStep} totalSteps={4} />

        {/* Content Area con AnimatePresence para transiciones */}
        <div className={classes.contentArea}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1Terms
                key="step1"
                acceptedTerms={acceptedTerms}
                onAcceptChange={setAcceptedTerms}
                onContinue={handleStepComplete}
                onCancel={handleClose}
              />
            )}

            {currentStep === 2 && (
              <Step2SessionType
                key="step2"
                serviceOptions={serviceOptions}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                onContinue={handleStepComplete}
                onBack={handleStepBack}
              />
            )}

            {currentStep === 3 && selectedOption && (
              <Step3Calendar
                key="step3"
                selectedOption={selectedOption}
                employees={employees}
                services={services}
                staffConsultasId={staffConsultasId}
                meryGarciaId={meryGarciaId}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDateTime={(date, time) => {
                  setSelectedDate(date);
                  setSelectedTime(time);
                }}
                onContinue={handleStepComplete}
                onBack={handleStepBack}
              />
            )}

            {currentStep === 4 && selectedOption && selectedDate && selectedTime && (
              <Step4Confirmation
                key="step4"
                serviceName={serviceName}
                selectedOption={selectedOption}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                employees={employees}
                services={services}
                staffConsultasId={staffConsultasId}
                meryGarciaId={meryGarciaId}
                onComplete={handleBookingComplete}
                onBack={handleStepBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
