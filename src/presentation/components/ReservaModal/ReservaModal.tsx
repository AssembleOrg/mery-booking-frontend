'use client';

import { useState } from 'react';
import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { AnimatePresence } from 'framer-motion';
import { StepIndicator } from './StepIndicator';
import { Step1Terms } from './Step1Terms';
import { Step2SessionType } from './Step2SessionType';
import { Step3Calendar } from './Step3Calendar';
import { Step4Confirmation } from './Step4Confirmation';
import { Step5PaymentSummary } from './Step5PaymentSummary';
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
  serviceEmployees?: Map<string, Employee[]>;
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
  serviceEmployees,
}: ReservaModalProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [clientData, setClientData] = useState<{
    name: string;
    surname: string;
    email: string;
    mobile: string;
    dni: string;
    notes?: string;
    couponCode?: string;
  } | null>(null);
  const [confirmationModalOpened, setConfirmationModalOpened] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [step3EmployeeId, setStep3EmployeeId] = useState<string | null>(null);
  const [step3ServiceId, setStep3ServiceId] = useState<string | null>(null);

  const handleClose = () => {
    // Reset estado al cerrar
    setCurrentStep(1);
    setAcceptedTerms(false);
    setSelectedOption(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedEmployeeId(null);
    setClientData(null);
    setConfirmationModalOpened(false);
    setShowCalendar(false);
    setStep3EmployeeId(null);
    setStep3ServiceId(null);
    onClose();
  };

  const handleStepComplete = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      if (currentStep === 3) {
        setShowCalendar(false);
        setSelectedEmployeeId(null);
        setStep3EmployeeId(null);
        setStep3ServiceId(null);
      }
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
        <StepIndicator currentStep={currentStep} totalSteps={5} />

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
                serviceName={serviceName}
                onClose={onClose}
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
                serviceEmployees={serviceEmployees}
                selectedEmployeeId={selectedEmployeeId}
                onEmployeeSelect={setSelectedEmployeeId}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDateTime={(date, time) => {
                  setSelectedDate(date);
                  setSelectedTime(time);
                }}
                onEmployeeResolved={setSelectedEmployeeId}
                onBack={handleStepBack}
                showCalendar={showCalendar}
                onShowCalendarChange={setShowCalendar}
                onStep3IdsResolved={(empId, svcId) => {
                  setStep3EmployeeId(empId);
                  setStep3ServiceId(svcId);
                }}
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
                selectedEmployeeId={selectedEmployeeId ?? undefined}
                confirmationModalOpened={confirmationModalOpened}
                onConfirmationModalClose={() => setConfirmationModalOpened(false)}
                onClientDataCollected={(data) => {
                  setClientData(data);
                  handleStepComplete();
                }}
              />
            )}

            {currentStep === 5 && selectedOption && selectedDate && selectedTime && clientData && (
              <Step5PaymentSummary
                key="step5"
                serviceName={serviceName}
                serviceKey={serviceKey}
                selectedOption={selectedOption}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                clientData={clientData}
                employees={employees}
                services={services}
                staffConsultasId={staffConsultasId}
                meryGarciaId={meryGarciaId}
                selectedEmployeeId={selectedEmployeeId ?? undefined}
                couponCode={clientData?.couponCode}
                onBack={handleStepBack}
              />
            )}
          </AnimatePresence>
        </div>

        {currentStep === 1 && (
          <div className={classes.buttonGroup}>
            <button type="button" onClick={handleClose} className={classes.buttonSecondary}>
              CANCELAR
            </button>
            <button
              type="button"
              onClick={handleStepComplete}
              disabled={!acceptedTerms}
              className={classes.buttonPrimary}
            >
              CONTINUAR
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className={classes.buttonGroup}>
            <button type="button" onClick={handleStepBack} className={classes.buttonSecondary}>
              ATRÁS
            </button>
            <button
              type="button"
              onClick={handleStepComplete}
              disabled={!selectedOption}
              className={classes.buttonPrimary}
            >
              CONTINUAR
            </button>
          </div>
        )}

        {currentStep === 3 && !showCalendar && (
          <div className={classes.buttonGroup}>
            <button type="button" onClick={handleStepBack} className={classes.buttonSecondary}>
              ATRÁS
            </button>
            <button
              type="button"
              onClick={() => { if (step3EmployeeId && step3ServiceId) setShowCalendar(true); }}
              disabled={!step3EmployeeId || !step3ServiceId}
              className={classes.buttonPrimary}
            >
              CONTINUAR
            </button>
          </div>
        )}

        {currentStep === 3 && showCalendar && (
          <div className={classes.buttonGroup}>
            <button type="button" onClick={() => setShowCalendar(false)} className={classes.buttonSecondary}>
              ATRÁS
            </button>
            <button
              type="button"
              onClick={handleStepComplete}
              disabled={!selectedDate || !selectedTime}
              className={classes.buttonPrimary}
            >
              CONTINUAR
            </button>
          </div>
        )}

        {currentStep === 4 && (
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
