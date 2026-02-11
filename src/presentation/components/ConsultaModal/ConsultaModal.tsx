'use client';

import { useState } from 'react';
import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { StepIndicator } from '../ReservaModal/StepIndicator';
import { Step1Terms } from '../ReservaModal/Step1Terms';
import Step2ConsultaType from './Step2ConsultaType';
import Step3Calendar from './Step3Calendar';
import Step4Confirmation from './Step4Confirmation';
import { Step5PaymentSummary } from './Step5PaymentSummary';
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
  serviceKey,
  consultaOptions,
  services,
  employees,
  meryGarciaId,
  staffConsultasId,
}: ConsultaModalProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientData, setClientData] = useState<{
    name: string;
    surname: string;
    email: string;
    mobile: string;
    dni: string;
    notes?: string;
  } | null>(null);

  const handleClose = () => {
    setCurrentStep(1);
    setAcceptedTerms(false);
    setSelectedOption(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientData(null);
    onClose();
  };

  const handleStepComplete = () => {
    if (currentStep < 5) {
      console.log(`[ConsultaModal] Avanzando de step ${currentStep} a step ${currentStep + 1}`);
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
      radius={isMobile ? 0 : 'md'}
      fullScreen={isMobile}
      closeOnClickOutside={false}
      closeOnEscape={false}
      classNames={{
        content: classes.modalContent,
        body: classes.modalBody,
      }}
    >
      <div className={classes.container}>
        <div className={classes.header}>
          <h2 className={classes.title}>Reserva tu Consulta</h2>
          <p className={classes.subtitle}>{serviceName}</p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={5} />

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
                  onClientDataCollected={(data) => {
                    console.log('[ConsultaModal] clientData actualizado:', data);
                    setClientData(data);
                    console.log('[ConsultaModal] Avanzando a Step 5...');
                    handleStepComplete();
                  }}
                />
              </motion.div>
            )}

            {currentStep === 5 && selectedOption && selectedDate && selectedTime && clientData && (
              (() => {
                console.log('[ConsultaModal] Renderizando Step 5 con:', {
                  currentStep,
                  hasSelectedOption: !!selectedOption,
                  hasSelectedDate: !!selectedDate,
                  hasSelectedTime: !!selectedTime,
                  hasClientData: !!clientData,
                });
                return null;
              })(),
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step5PaymentSummary
                  serviceName={serviceName}
                  serviceKey={serviceKey}
                  selectedOption={selectedOption}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  clientData={clientData}
                  employees={employees}
                  services={services}
                  staffConsultasId={staffConsultasId}
                  onBack={handleStepBack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
