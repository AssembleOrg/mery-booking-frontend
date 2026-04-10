'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Select,
  Loader,
  Modal,
  Text,
  Button,
  Stack,
  Checkbox,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {
  BookingService,
  CategoryService,
  ServiceService,
  EmployeeService,
} from '@/infrastructure/http';
import type {
  BookingResponse,
  Category,
  Employee,
} from '@/infrastructure/http';
import type { PublicServiceResponse } from '@/infrastructure/http/serviceService';
import { Header, Footer, DateTimeSelector } from '@/presentation/components';
import classes from './page.module.css';

dayjs.locale('es');

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function CambiarReservaPage() {
  const router = useRouter();

  // ── Auth ──
  const [bookingCode, setBookingCode] = useState('');
  const [dni, setDni] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ── Booking ──
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  // ── Catalog ──
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<PublicServiceResponse[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // ── Selection ──
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // ── Wizard ──
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 6;

  // ── Derived ──
  const filteredServices = services.filter((s) => s.categoryId === selectedCategoryId);
  const currentService = services.find((s) => s.id === selectedServiceId);
  const bk = booking as any;
  const serviceChanged = currentService && bk?.serviceId && currentService.id !== bk.serviceId;

  // ── Load catalog ──
  useEffect(() => {
    if (!booking) return;
    (async () => {
      setIsLoadingCatalog(true);
      try {
        const [cats, svcs] = await Promise.all([
          CategoryService.getAllPublic(),
          ServiceService.getAllVisible(),
        ]);
        setCategories(cats);
        setServices(svcs);

        // Pre-fill from booking
        const svc = svcs.find((s) => s.id === bk?.serviceId);
        if (svc) {
          setSelectedCategoryId(svc.categoryId);
          setSelectedServiceId(svc.id);
        }
      } catch {
        notifications.show({ title: 'Error', message: 'No se pudo cargar el catálogo', color: 'red' });
      } finally {
        setIsLoadingCatalog(false);
      }
    })();
  }, [booking]);

  // ── Load employees ──
  useEffect(() => {
    if (!selectedServiceId || !selectedCategoryId) {
      setEmployees([]);
      return;
    }
    (async () => {
      setIsLoadingEmployees(true);
      try {
        const emps = await EmployeeService.getAllPublic(selectedCategoryId, selectedServiceId);
        setEmployees(emps);
        if (bk?.employeeId && emps.some((e) => e.id === bk.employeeId)) {
          setSelectedEmployeeId(bk.employeeId);
        } else {
          setSelectedEmployeeId(null);
        }
      } catch {
        setEmployees([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    })();
  }, [selectedServiceId, selectedCategoryId]);

  // ── Handlers ──

  const handleSearch = async () => {
    if (!bookingCode.trim() || !dni.trim()) {
      notifications.show({ title: 'Datos incompletos', message: 'Ingresá código y DNI', color: 'red' });
      return;
    }
    setIsSearching(true);
    try {
      const result = await BookingService.getByCode(bookingCode.trim().toUpperCase(), dni.trim());
      setBooking(result);
      setCurrentStep(2);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Reserva no encontrada. Verificá el código y DNI.';
      setErrorMessage(msg);
      setErrorModalOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategoryId(catId);
    setSelectedServiceId(null);
    setSelectedEmployeeId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setAcceptedTerms(false);
  };

  const handleSubmit = async () => {
    if (!booking || !selectedServiceId || !selectedEmployeeId || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    try {
      const code = bk.bookingCode || bookingCode.trim().toUpperCase();
      await BookingService.reschedulePublic(code, {
        date: dayjs(selectedDate).format('YYYY-MM-DD'),
        startTime: selectedTime,
        employeeId: selectedEmployeeId,
        serviceId: selectedServiceId,
        dni: dni.trim(),
      });
      setCurrentStep(6);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al reagendar';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (d: string | Date) =>
    dayjs(d).locale('es').format('dddd D [de] MMMM');

  // ── Step indicator ──
  const renderStepIndicator = () => (
    <div className={classes.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = (i + 1) as Step;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <div key={stepNum} className={classes.stepIndicatorItem}>
            <div
              className={`${classes.stepCircle} ${isActive ? classes.stepCircleActive : ''} ${isCompleted ? classes.stepCircleCompleted : ''}`}
            >
              {isCompleted ? (
                <span className={classes.stepCheck}>✓</span>
              ) : (
                <span className={classes.stepNumber}>{stepNum}</span>
              )}
            </div>
            {stepNum < totalSteps && (
              <div className={`${classes.stepLine} ${isCompleted ? classes.stepLineCompleted : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const motionProps = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.3 },
  };

  return (
    <>
      <Header />
      <Box className={classes.pageWrapper}>
        <Container size="sm" className={classes.container}>
          <div className={classes.card}>
            {renderStepIndicator()}

            <AnimatePresence mode="wait">
              {/* ═══ STEP 1: Verificación ═══ */}
              {currentStep === 1 && (
                <motion.div key="step1" {...motionProps} className={classes.stepContent}>
                  <div className={classes.stepHeader}>
                    <h2 className={classes.stepTitle}>Verificá tu reserva</h2>
                    <p className={classes.stepSubtitle}>
                      Ingresá el código de tu reserva y tu DNI para continuar.
                    </p>
                  </div>

                  <div className={classes.formGroup}>
                    <div className={classes.field}>
                      <label className={classes.label}>Código de reserva</label>
                      <input
                        type="text"
                        placeholder="Ej: ABC123"
                        value={bookingCode}
                        onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        maxLength={6}
                        className={`${classes.input} ${classes.inputCode}`}
                        autoComplete="off"
                      />
                    </div>
                    <div className={classes.field}>
                      <label className={classes.label}>DNI del titular</label>
                      <input
                        type="text"
                        placeholder="Ej: 12345678"
                        value={dni}
                        onChange={(e) => setDni(e.target.value.replace(/\s/g, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        maxLength={20}
                        className={classes.input}
                        autoComplete="off"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className={classes.buttonGroup}>
                    <button type="button" className={classes.buttonPrimary} onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? 'BUSCANDO...' : 'BUSCAR RESERVA'}
                    </button>
                  </div>

                  <p className={classes.helper}>
                    Si no recordás tu código, revisá el email o WhatsApp de confirmación.
                  </p>
                </motion.div>
              )}

              {/* ═══ STEP 2: Categoría + Terms ═══ */}
              {currentStep === 2 && booking && (
                <motion.div key="step2" {...motionProps} className={classes.stepContent}>
                  <div className={classes.stepHeader}>
                    <h2 className={classes.stepTitle}>Términos y categoría</h2>
                    <p className={classes.stepSubtitle}>
                      Aceptá los términos y elegí la categoría del servicio.
                    </p>
                  </div>

                  <div className={classes.summary}>
                    <span className={classes.summaryOverline}>RESERVA ACTUAL</span>
                    <div className={classes.summaryGrid}>
                      <div><span className={classes.summaryLabel}>Cliente</span><span className={classes.summaryValue}>{bk?.client?.fullName}</span></div>
                      <div><span className={classes.summaryLabel}>Servicio</span><span className={classes.summaryValue}>{bk?.service?.name}</span></div>
                      <div><span className={classes.summaryLabel}>Profesional</span><span className={classes.summaryValue}>{bk?.employee?.fullName}</span></div>
                      <div><span className={classes.summaryLabel}>Fecha</span><span className={classes.summaryValue}>{bk?.localDate ? formatDate(bk.localDate) : '—'} · {bk?.localStartTime || ''}</span></div>
                    </div>
                  </div>

                  {isLoadingCatalog ? (
                    <div className={classes.loaderWrap}><Loader color="pink" /></div>
                  ) : (
                    <>
                      <Select
                        label="Categoría"
                        placeholder="Seleccioná una categoría"
                        data={categories.map((c) => ({ value: c.id, label: c.name }))}
                        value={selectedCategoryId}
                        onChange={handleCategoryChange}
                        searchable
                        classNames={{ label: classes.mantineLabel, input: classes.mantineInput }}
                      />

                      <div className={classes.termsBox}>
                        <Checkbox
                          label="Acepto los términos y condiciones del servicio. Entiendo que al reagendar, las condiciones del servicio original aplican."
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.currentTarget.checked)}
                          color="pink"
                          classNames={{ label: classes.termsLabel }}
                        />
                      </div>
                    </>
                  )}

                  <div className={classes.buttonGroup}>
                    <button type="button" className={classes.buttonSecondary} onClick={() => setCurrentStep(1)}>
                      ATRÁS
                    </button>
                    <button
                      type="button"
                      className={classes.buttonPrimary}
                      disabled={!selectedCategoryId || !acceptedTerms}
                      onClick={() => setCurrentStep(3)}
                    >
                      CONTINUAR
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 3: Tipo de sesión (tarjetas) ═══ */}
              {currentStep === 3 && (
                <motion.div key="step3" {...motionProps} className={classes.stepContent}>
                  <div className={classes.stepHeader}>
                    <h2 className={classes.stepTitle}>Elegí el servicio</h2>
                    <p className={classes.stepSubtitle}>
                      Podés mantener el mismo o elegir uno diferente dentro de la categoría.
                    </p>
                  </div>

                  {filteredServices.length === 0 ? (
                    <div className={classes.loaderWrap}><Loader color="pink" /></div>
                  ) : (
                    <div className={classes.serviceGrid}>
                      {filteredServices.map((svc) => (
                        <button
                          key={svc.id}
                          type="button"
                          className={`${classes.serviceCard} ${selectedServiceId === svc.id ? classes.serviceCardSelected : ''}`}
                          onClick={() => {
                            setSelectedServiceId(svc.id);
                            setSelectedEmployeeId(null);
                            setSelectedDate(null);
                            setSelectedTime(null);
                          }}
                        >
                          <span className={classes.serviceName}>{svc.name}</span>
                          <div className={classes.serviceMeta}>
                            <span className={classes.servicePrice}>
                              ${Number(svc.price).toLocaleString('es-AR')}
                            </span>
                            <span className={classes.serviceDuration}>{svc.duration} min</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={classes.buttonGroup}>
                    <button type="button" className={classes.buttonSecondary} onClick={() => setCurrentStep(2)}>
                      ATRÁS
                    </button>
                    <button
                      type="button"
                      className={classes.buttonPrimary}
                      disabled={!selectedServiceId}
                      onClick={() => setCurrentStep(4)}
                    >
                      CONTINUAR
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 4: Profesional + Fecha/Hora ═══ */}
              {currentStep === 4 && (
                <motion.div key="step4" {...motionProps} className={classes.stepContent}>
                  <div className={classes.stepHeader}>
                    <h2 className={classes.stepTitle}>Fecha y hora</h2>
                    <p className={classes.stepSubtitle}>
                      Seleccioná el profesional y el horario que más te convenga.
                    </p>
                  </div>

                  {serviceChanged && (
                    <div className={classes.serviceChangedNotice}>
                      Cambiaste de servicio. Cualquier diferencia de seña se resuelve en el local.
                    </div>
                  )}

                  <Select
                    label="Profesional"
                    placeholder={isLoadingEmployees ? 'Cargando...' : 'Elegí un profesional'}
                    data={employees.map((e) => ({ value: e.id, label: e.fullName }))}
                    value={selectedEmployeeId}
                    onChange={(val) => {
                      setSelectedEmployeeId(val);
                      setSelectedDate(null);
                      setSelectedTime(null);
                    }}
                    disabled={isLoadingEmployees || employees.length === 0}
                    searchable
                    rightSection={isLoadingEmployees ? <Loader size="xs" /> : undefined}
                    classNames={{ label: classes.mantineLabel, input: classes.mantineInput }}
                  />

                  {selectedEmployeeId && selectedServiceId && (
                    <div className={classes.calendarWrap}>
                      <DateTimeSelector
                        serviceDuration={currentService?.duration || 60}
                        employeeId={selectedEmployeeId}
                        serviceId={selectedServiceId}
                        onSelectDateTime={(date, time) => {
                          setSelectedDate(date);
                          setSelectedTime(time);
                        }}
                      />
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div className={classes.selectionBadge}>
                      <span style={{ textTransform: 'capitalize' }}>{formatDate(selectedDate)}</span>
                      <span className={classes.selectionTime}>{selectedTime} hs</span>
                    </div>
                  )}

                  <div className={classes.buttonGroup}>
                    <button type="button" className={classes.buttonSecondary} onClick={() => setCurrentStep(3)}>
                      ATRÁS
                    </button>
                    <button
                      type="button"
                      className={classes.buttonPrimary}
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setCurrentStep(5)}
                    >
                      CONTINUAR
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 5: Confirmar ═══ */}
              {currentStep === 5 && (
                <motion.div key="step5" {...motionProps} className={classes.stepContent}>
                  <div className={classes.stepHeader}>
                    <h2 className={classes.stepTitle}>Confirmar cambio</h2>
                    <p className={classes.stepSubtitle}>Revisá los datos antes de confirmar.</p>
                  </div>

                  <div className={classes.summary}>
                    <span className={classes.summaryOverline}>NUEVA RESERVA</span>
                    <div className={classes.summaryGrid}>
                      <div><span className={classes.summaryLabel}>Servicio</span><span className={classes.summaryValue}>{currentService?.name || '—'}</span></div>
                      <div><span className={classes.summaryLabel}>Profesional</span><span className={classes.summaryValue}>{employees.find((e) => e.id === selectedEmployeeId)?.fullName || '—'}</span></div>
                      <div><span className={classes.summaryLabel}>Fecha</span><span className={classes.summaryValue} style={{ textTransform: 'capitalize' }}>{selectedDate ? formatDate(selectedDate) : '—'}</span></div>
                      <div><span className={classes.summaryLabel}>Horario</span><span className={classes.summaryValue}>{selectedTime} hs</span></div>
                    </div>
                  </div>

                  {serviceChanged && (
                    <div className={classes.serviceChangedNotice}>
                      Cambiaste de servicio. Cualquier diferencia de seña se resuelve en el local.
                    </div>
                  )}

                  <div className={classes.buttonGroup}>
                    <button type="button" className={classes.buttonSecondary} onClick={() => setCurrentStep(4)} disabled={isSubmitting}>
                      ATRÁS
                    </button>
                    <button
                      type="button"
                      className={classes.buttonPrimary}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'CONFIRMANDO...' : 'CONFIRMAR CAMBIO'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 6: Éxito ═══ */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className={classes.stepContent}
                >
                  <div className={classes.successBox}>
                    <div className={classes.successIcon}>✓</div>
                    <h2 className={classes.stepTitle}>Reserva actualizada</h2>
                    <p className={classes.stepSubtitle}>
                      Tu turno fue reagendado correctamente. Te llega un email y un WhatsApp
                      con los nuevos datos en los próximos minutos.
                    </p>
                    <button type="button" className={classes.buttonPrimary} onClick={() => router.push('/')}>
                      VOLVER AL INICIO
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </Box>
      <Footer />

      <Modal opened={errorModalOpen} onClose={() => setErrorModalOpen(false)} title="Reserva no encontrada" centered classNames={{ title: classes.modalTitle }}>
        <Stack gap="md">
          <Text size="sm">{errorMessage}</Text>
          <Button color="pink" onClick={() => setErrorModalOpen(false)}>Intentar de nuevo</Button>
        </Stack>
      </Modal>
    </>
  );
}
