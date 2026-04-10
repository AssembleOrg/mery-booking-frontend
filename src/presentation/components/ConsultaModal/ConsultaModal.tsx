'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { StepIndicator } from '../ReservaModal/StepIndicator';
import { Step1Terms } from '../ReservaModal/Step1Terms';
import Step2ServiceType from './Step2ServiceType';
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
  serviceEmployees?: Map<string, Employee[]>;
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
  serviceEmployees,
}: ConsultaModalProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
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
    couponCode?: string;
  } | null>(null);
  const [step3ShowCalendar, setStep3ShowCalendar] = useState(false);
  const [step3CanContinue, setStep3CanContinue] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Nombre del profesional seleccionado (para mostrar en Step 4)
  const selectedProfessionalName = useMemo(() => {
    const empId = selectedEmployeeId || selectedOption?.employeeId;
    if (!empId || !serviceEmployees || !selectedOption?.serviceId) return undefined;
    const available = serviceEmployees.get(selectedOption.serviceId) ?? [];
    const found = available.find((e) => e.id === empId);
    return found?.fullName;
  }, [selectedEmployeeId, selectedOption, serviceEmployees]);
  const [confirmationModalOpened, setConfirmationModalOpened] = useState(false);

  const handleClose = () => {
    setCurrentStep(1);
    setAcceptedTerms(false);
    setSelectedServiceType(null);
    setSelectedOption(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientData(null);
    setStep3ShowCalendar(false);
    setStep3CanContinue(false);
    setSelectedEmployeeId(null);
    setConfirmationModalOpened(false);
    onClose();
  };

  const isEpitesis = serviceKey === 'epitesis-cap';
  const totalSteps = isEpitesis ? 6 : 5;

  // En epitesis: step 4 = calendario. En otros: step 3 = calendario.
  const calendarStep = isEpitesis ? 4 : 3;
  // En epitesis: step 5 = confirmación. En otros: step 4 = confirmación.
  const confirmationStep = isEpitesis ? 5 : 4;

  const handleStepComplete = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      if (currentStep === calendarStep) {
        setStep3ShowCalendar(false);
        setStep3CanContinue(false);
        setSelectedEmployeeId(null);
      }
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCalendarBack = () => {
    if (step3ShowCalendar) {
      setStep3ShowCalendar(false);
    } else {
      handleStepBack();
    }
  };

  const handleCalendarContinue = () => {
    if (!step3ShowCalendar) {
      setStep3ShowCalendar(true);
    } else {
      handleStepComplete();
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
      withCloseButton={false}
      classNames={{
        content: classes.modalContent,
        header: classes.modalHeader,
        body: classes.modalBody,
      }}
    >
      <div className={classes.container}>
        <div className={classes.header}>
          <button
            type="button"
            onClick={handleClose}
            className={classes.closeButton}
            aria-label="Cerrar"
          >
            ✕
          </button>
          <h2 className={classes.title}>Reserva tu Consulta</h2>
          <p className={classes.subtitle}>{serviceName}</p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <div className={classes.contentArea}>
          <AnimatePresence mode="wait">
            {/* Step 1 — Términos (todos los servicios) */}
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
                  serviceKey={serviceKey}
                />
              </motion.div>
            )}

            {/* Step 2 — Tipo de servicio (SOLO epitesis) */}
            {isEpitesis && currentStep === 2 && (
              <motion.div
                key="step2-service-type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step2ServiceType
                  selectedServiceType={selectedServiceType}
                  onSelectServiceType={setSelectedServiceType}
                  onClearServiceType={() => setSelectedServiceType(null)}
                />
              </motion.div>
            )}

            {/* Step 2 (otros) / Step 3 (epitesis) — Tipo de consulta */}
            {currentStep === (isEpitesis ? 3 : 2) && (
              <motion.div
                key="step-consulta-type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step2ConsultaType
                  consultaOptions={consultaOptions}
                  selectedOption={selectedOption}
                  onSelectOption={setSelectedOption}
                />
              </motion.div>
            )}

            {/* Step 3 (otros) / Step 4 (epitesis) — Calendario */}
            {currentStep === calendarStep && selectedOption && (
              <motion.div
                key="step-calendar"
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
                  availableEmployees={
                    selectedOption.serviceId && serviceEmployees
                      ? (serviceEmployees.get(selectedOption.serviceId) ?? [])
                      : []
                  }
                  selectedEmployeeId={selectedEmployeeId}
                  onEmployeeSelect={setSelectedEmployeeId}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelectDateTime={(date, time) => {
                    setSelectedDate(date);
                    setSelectedTime(time);
                  }}
                  showCalendar={step3ShowCalendar}
                  onCanContinueChange={setStep3CanContinue}
                />
              </motion.div>
            )}

            {/* Step 4 (otros) / Step 5 (epitesis) — Confirmación */}
            {currentStep === confirmationStep && selectedOption && selectedDate && selectedTime && (
              <motion.div
                key="step-confirmation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step4Confirmation
                  serviceName={serviceName}
                  consultaOption={selectedOption}
                  staffConsultasId={staffConsultasId || ''}
                  professionalName={selectedProfessionalName}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  serviceTypeLabel={isEpitesis ? (selectedServiceType ?? undefined) : undefined}
                  confirmationModalOpened={confirmationModalOpened}
                  onConfirmationModalClose={() => setConfirmationModalOpened(false)}
                  onClientDataCollected={(data) => {
                    setClientData(data);
                    handleStepComplete();
                  }}
                />
              </motion.div>
            )}

            {/* Step 5 (otros) / Step 6 (epitesis) — Pago */}
            {currentStep === totalSteps && selectedOption && selectedDate && selectedTime && clientData && (
              <motion.div
                key="step-payment"
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
                  selectedEmployeeId={selectedEmployeeId}
                  couponCode={clientData?.couponCode}
                  serviceTypeLabel={isEpitesis ? (selectedServiceType ?? undefined) : undefined}
                  onBack={handleStepBack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botón step 2 epitesis — tipo de servicio */}
        {isEpitesis && currentStep === 2 && (
          <div className={classes.buttonGroup}>
            <button type="button" onClick={handleStepBack} className={classes.buttonSecondary}>
              ATRÁS
            </button>
            <button
              type="button"
              onClick={handleStepComplete}
              disabled={!selectedServiceType}
              className={classes.buttonPrimary}
            >
              CONTINUAR
            </button>
          </div>
        )}
        {/* Botón tipo de consulta: step 2 (otros) o step 3 (epitesis) */}
        {currentStep === (isEpitesis ? 3 : 2) && (
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
        {/* Botón calendario */}
        {currentStep === calendarStep && (
          <div className={classes.buttonGroup}>
            <button type="button" onClick={handleCalendarBack} className={classes.buttonSecondary}>
              ATRÁS
            </button>
            <button
              type="button"
              onClick={handleCalendarContinue}
              disabled={!step3CanContinue}
              className={classes.buttonPrimary}
            >
              CONTINUAR
            </button>
          </div>
        )}
        {/* Botón confirmación */}
        {currentStep === confirmationStep && (
          <div className={classes.buttonGroup}>
            <button type="button" onClick={handleStepBack} className={classes.buttonSecondary}>
              ATRÁS
            </button>
            <button
              type="button"
              onClick={() => setConfirmationModalOpened(true)}
              className={classes.buttonPrimary}
            >
              CONFIRMAR CONSULTA
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
