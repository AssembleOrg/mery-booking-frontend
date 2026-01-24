'use client';

import { useState } from 'react';
import { Modal } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { StepIndicator } from '../ReservaModal/StepIndicator';
import { Step1Terms } from '../ReservaModal/Step1Terms';
import Step2ConsultaType from './Step2ConsultaType';
import Step3Calendar from './Step3Calendar';
import Step4Confirmation from './Step4Confirmation';
import type { ServiceOption } from '@/infrastructure/types/services';
import type { ServiceEntity, Employee } from '@/infrastructure/http';
import classes from './ConsultaModal.module.css';

interface ConsultaModalProps {
  opened: boolean;
  onClose: () => void;
  serviceName: string;
  serviceKey: string;
  consultaOptions: ServiceOption[];
  services: ServiceEntity[];
  employees: Employee[];
  meryGarciaId?: string;
  staffConsultasId?: string;
}

export default function ConsultaModal({
  opened,
  onClose,
  serviceName,
  consultaOptions,
  services,
  employees,
  meryGarciaId,
  staffConsultasId,
}: ConsultaModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleClose = () => {
    setCurrentStep(1);
    setAcceptedTerms(false);
    setSelectedOption(null);
    setSelectedDate(null);
    setSelectedTime(null);
    onClose();
  };

  const handleStepComplete = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      padding={0}
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      className={classes.modal}
    >
      <div className={classes.container}>
        <div className={classes.header}>
          <h2 className={classes.title}>Reserva tu Consulta</h2>
          <p className={classes.subtitle}>{serviceName}</p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={4} />

        <div className={classes.contentArea}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step1Terms
                  acceptedTerms={acceptedTerms}
                  onAcceptChange={setAcceptedTerms}
                  onCancel={handleClose}
                  onContinue={handleStepComplete}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step2ConsultaType
                  consultaOptions={consultaOptions}
                  selectedOption={selectedOption}
                  onSelectOption={setSelectedOption}
                  onBack={handleStepBack}
                  onContinue={handleStepComplete}
                />
              </motion.div>
            )}

            {currentStep === 3 && selectedOption && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step3Calendar
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
              </motion.div>
            )}

            {currentStep === 4 && selectedOption && selectedDate && selectedTime && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step4Confirmation
                  serviceName={serviceName}
                  consultaOption={selectedOption}
                  staffConsultasId={staffConsultasId || ''}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onBack={handleStepBack}
                  onSuccess={handleClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
