'use client';

import { useState } from 'react';
import { Loader, Select } from '@mantine/core';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { useForm, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import {
  useGetBookingByCode,
  useRescheduleBookingPublic,
  useAvailability,
} from '@/presentation/hooks';
import { EmployeeService, ServiceService } from '@/infrastructure/http';
import type { Employee, BookingResponse, ServiceEntity } from '@/infrastructure/http';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import classes from './PublicRescheduleBooking.module.css';

dayjs.locale('es');

interface RescheduleFormData {
  serviceId: string;
  date: Date | null;
  startTime: string;
  employeeId: string;
}

type Step = 'search' | 'form' | 'success';

export function PublicRescheduleBooking() {
  const [step, setStep] = useState<Step>('search');
  const [bookingCode, setBookingCode] = useState('');
  const [dni, setDni] = useState('');
  const [foundBooking, setFoundBooking] = useState<BookingResponse | null>(null);
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const getBookingByCodeMutation = useGetBookingByCode();
  const rescheduleMutation = useRescheduleBookingPublic();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RescheduleFormData>({
    defaultValues: {
      serviceId: '',
      date: null,
      startTime: '',
      employeeId: '',
    },
  });

  const selectedDate = watch('date');
  const selectedEmployeeId = watch('employeeId');
  const selectedServiceId = watch('serviceId') || null;

  const availabilityMinDate = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null;
  const availabilityMaxDate = selectedDate
    ? dayjs(selectedDate).add(30, 'days').format('YYYY-MM-DD')
    : null;

  const { data: availability, isLoading: isLoadingAvailability } = useAvailability(
    selectedEmployeeId || null,
    selectedServiceId || null,
    availabilityMinDate,
    availabilityMaxDate
  );

  const timeOptions = (() => {
    const allOptions: { value: string; label: string }[] = [];
    for (let hour = 10; hour <= 17; hour++) {
      allOptions.push({
        value: `${hour.toString().padStart(2, '0')}:00`,
        label: `${hour}:00`,
      });
      if (hour < 17) {
        allOptions.push({
          value: `${hour.toString().padStart(2, '0')}:30`,
          label: `${hour}:30`,
        });
      }
    }

    if (availability && selectedDate && selectedEmployeeId && selectedServiceId) {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const dayAvailability = availability.availability.find(
        (day) => day.date === dateStr
      );

      if (dayAvailability && dayAvailability.slots) {
        const availableSlots = dayAvailability.slots
          .filter((slot) => slot.available)
          .map((slot) => slot.startTime);

        return allOptions.filter((option) => availableSlots.includes(option.value));
      }
    }

    return allOptions;
  })();

  const loadServices = async () => {
    try {
      setIsLoadingServices(true);
      const allServices = await ServiceService.getAllVisible();
      setServices(allServices);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const loadEmployeesForService = async (serviceId: string) => {
    try {
      setIsLoadingEmployees(true);
      const service = await ServiceService.getById(serviceId);
      if (service?.categoryId) {
        const employeesList = await EmployeeService.getAllPublic(
          service.categoryId,
          serviceId
        );
        setEmployees(employeesList);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleServiceChange = async (newServiceId: string) => {
    setValue('serviceId', newServiceId);
    setValue('employeeId', '');
    setValue('date', null);
    setValue('startTime', '');
    setEmployees([]);
    if (newServiceId) {
      await loadEmployeesForService(newServiceId);
    }
  };

  const handleSearch = async () => {
    if (!bookingCode.trim()) {
      notifications.show({
        title: 'Falta el código',
        message: 'Ingresá tu código de reserva',
        color: 'red',
      });
      return;
    }

    if (!dni.trim()) {
      notifications.show({
        title: 'Falta el DNI',
        message: 'Ingresá tu DNI para verificar tu identidad',
        color: 'red',
      });
      return;
    }

    try {
      const booking = await getBookingByCodeMutation.mutateAsync({
        bookingCode: bookingCode.trim().toUpperCase(),
        dni: dni.trim(),
      });
      setFoundBooking(booking);

      const serviceId = (booking as any).serviceId;
      const employeeId = (booking as any).employeeId;
      const localDate = (booking as any).localDate;
      const localStartTime = (booking as any).localStartTime;

      await loadServices();

      if (serviceId) {
        setValue('serviceId', serviceId);
        await loadEmployeesForService(serviceId);
      }

      if (employeeId) setValue('employeeId', employeeId);
      if (localDate) setValue('date', dayjs(localDate).toDate());
      if (localStartTime) setValue('startTime', localStartTime);

      setStep('form');

      // Pequeño delay para que la animación de fade-in arranque antes del scroll
      setTimeout(() => {
        document
          .getElementById('cambiar-reserva-form')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      // El hook ya muestra la notificación de error
    }
  };

  const onSubmitReschedule = async (data: RescheduleFormData) => {
    if (!foundBooking || !data.date) {
      notifications.show({
        title: 'Datos incompletos',
        message: 'Completá todos los campos',
        color: 'red',
      });
      return;
    }

    try {
      const dateString = dayjs(data.date).format('YYYY-MM-DD');
      const codeToUse =
        (foundBooking as any).bookingCode || bookingCode.trim().toUpperCase();

      await rescheduleMutation.mutateAsync({
        bookingCode: codeToUse,
        data: {
          date: dateString,
          startTime: data.startTime,
          employeeId: data.employeeId,
          serviceId: data.serviceId,
          dni: dni.trim(),
        },
      });

      setStep('success');
      setTimeout(() => {
        document
          .getElementById('cambiar-reserva-success')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      // El hook ya muestra la notificación de error
    }
  };

  const handleReset = () => {
    setStep('search');
    setBookingCode('');
    setDni('');
    setFoundBooking(null);
    setServices([]);
    setEmployees([]);
    reset({ serviceId: '', date: null, startTime: '', employeeId: '' });
    setTimeout(() => {
      document
        .getElementById('cambiar-reserva')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const formatLongDate = (dateStr: string) =>
    dayjs(dateStr).locale('es').format('dddd D [de] MMMM');

  const currentService = (foundBooking as any)?.service;
  const currentEmployee = (foundBooking as any)?.employee;
  const currentClient = (foundBooking as any)?.client;
  const currentLocalDate = (foundBooking as any)?.localDate;
  const currentLocalStartTime = (foundBooking as any)?.localStartTime;
  const currentLocalEndTime = (foundBooking as any)?.localEndTime;

  return (
    <div className={classes.wrapper}>
      <header className={classes.header}>
        <span className={classes.overline}>GESTIÓN DE RESERVA</span>
        <h2 className={classes.title}>
          ¿Necesitás <em>cambiar</em> tu turno?
        </h2>
        <p className={classes.subtitle}>
          Ingresá tu código de reserva y DNI. Vas a poder elegir un nuevo profesional,
          fecha y horario sin tener que pasar por nosotros.
        </p>
      </header>

      {/* PASO 1 — Búsqueda */}
      {step === 'search' && (
        <div className={classes.card}>
          <div className={classes.formGrid}>
            <div className={classes.field}>
              <label className={classes.label} htmlFor="reschedule-code">
                Código de reserva
              </label>
              <input
                id="reschedule-code"
                type="text"
                placeholder="Ej: ABC123"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                maxLength={6}
                className={`${classes.input} ${classes.inputCode}`}
                autoComplete="off"
              />
            </div>
            <div className={classes.field}>
              <label className={classes.label} htmlFor="reschedule-dni">
                DNI del titular
              </label>
              <input
                id="reschedule-dni"
                type="text"
                placeholder="Ej: 12345678"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\s/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                maxLength={20}
                className={classes.input}
                autoComplete="off"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className={classes.actions}>
            <button
              type="button"
              className={classes.primaryButton}
              onClick={handleSearch}
              disabled={getBookingByCodeMutation.isPending}
            >
              {getBookingByCodeMutation.isPending ? 'BUSCANDO...' : 'BUSCAR RESERVA'}
            </button>
          </div>

          <p className={classes.helper}>
            Si no recordás tu código, revisá el email o WhatsApp de confirmación que te
            enviamos al reservar.
          </p>
        </div>
      )}

      {/* PASO 2 — Reserva encontrada + nuevo horario */}
      {step === 'form' && foundBooking && (
        <div id="cambiar-reserva-form" className={classes.card}>
          <div className={classes.summary}>
            <span className={classes.summaryOverline}>RESERVA ACTUAL</span>
            <div className={classes.summaryGrid}>
              <div className={classes.summaryItem}>
                <span className={classes.summaryLabel}>Cliente</span>
                <span className={classes.summaryValue}>
                  {currentClient?.fullName || '—'}
                </span>
              </div>
              <div className={classes.summaryItem}>
                <span className={classes.summaryLabel}>Servicio</span>
                <span className={classes.summaryValue}>
                  {currentService?.name || '—'}
                </span>
              </div>
              <div className={classes.summaryItem}>
                <span className={classes.summaryLabel}>Profesional</span>
                <span className={classes.summaryValue}>
                  {currentEmployee?.fullName || '—'}
                </span>
              </div>
              <div className={classes.summaryItem}>
                <span className={classes.summaryLabel}>Fecha y hora</span>
                <span className={classes.summaryValue}>
                  {currentLocalDate ? formatLongDate(currentLocalDate) : '—'}
                  {currentLocalStartTime
                    ? ` · ${currentLocalStartTime}${currentLocalEndTime ? ` a ${currentLocalEndTime}` : ''}`
                    : ''}
                </span>
              </div>
            </div>
          </div>

          <div className={classes.divider}>
            <span>Nueva reserva</span>
          </div>

          <form onSubmit={handleSubmit(onSubmitReschedule)} className={classes.form}>
            <div className={classes.formGrid}>
              <div className={`${classes.field} ${classes.fieldFull}`}>
                <Controller
                  name="serviceId"
                  control={control}
                  rules={{ required: 'Seleccioná un servicio' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Servicio"
                      placeholder={
                        isLoadingServices
                          ? 'Cargando servicios...'
                          : 'Elegí un servicio'
                      }
                      data={services.map((s) => ({ value: s.id, label: s.name }))}
                      searchable
                      error={errors.serviceId?.message}
                      disabled={isLoadingServices}
                      rightSection={isLoadingServices ? <Loader size="xs" /> : undefined}
                      onChange={(val) => {
                        if (val) handleServiceChange(val);
                      }}
                      classNames={{
                        label: classes.mantineLabel,
                        input: classes.mantineInput,
                        error: classes.mantineError,
                      }}
                    />
                  )}
                />
              </div>

              <div className={`${classes.field} ${classes.fieldFull}`}>
                <Controller
                  name="employeeId"
                  control={control}
                  rules={{ required: 'Seleccioná un profesional' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Profesional"
                      placeholder={
                        isLoadingEmployees
                          ? 'Cargando profesionales...'
                          : !selectedServiceId
                          ? 'Elegí un servicio primero'
                          : 'Elegí un profesional'
                      }
                      data={employees.map((e) => ({ value: e.id, label: e.fullName }))}
                      searchable
                      error={errors.employeeId?.message}
                      disabled={isLoadingEmployees || !selectedServiceId}
                      rightSection={isLoadingEmployees ? <Loader size="xs" /> : undefined}
                      classNames={{
                        label: classes.mantineLabel,
                        input: classes.mantineInput,
                        error: classes.mantineError,
                      }}
                    />
                  )}
                />
              </div>

              <div className={classes.field}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'Seleccioná una fecha' }}
                  render={({ field }) => (
                    <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
                      <DatePickerInput
                        {...field}
                        label="Nueva fecha"
                        placeholder="Elegí una fecha"
                        value={field.value}
                        onChange={(date) => {
                          field.onChange(date);
                          setValue('startTime', '');
                        }}
                        minDate={new Date()}
                        error={errors.date?.message}
                        locale="es"
                        classNames={{
                          label: classes.mantineLabel,
                          input: classes.mantineInput,
                          error: classes.mantineError,
                        }}
                      />
                    </DatesProvider>
                  )}
                />
              </div>

              <div className={classes.field}>
                <Controller
                  name="startTime"
                  control={control}
                  rules={{
                    required: 'Seleccioná un horario',
                    pattern: {
                      value: /^([0-1][0-9]|2[0-3]):(00|30)$/,
                      message: 'Formato HH:mm (XX:00 o XX:30)',
                    },
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Nuevo horario"
                      placeholder={
                        isLoadingAvailability
                          ? 'Cargando disponibilidad...'
                          : !selectedDate || !selectedEmployeeId || !selectedServiceId
                          ? 'Elegí fecha y profesional'
                          : timeOptions.length === 0
                          ? 'Sin horarios disponibles'
                          : 'Elegí un horario'
                      }
                      data={timeOptions}
                      error={errors.startTime?.message}
                      disabled={
                        isLoadingAvailability ||
                        !selectedDate ||
                        !selectedEmployeeId ||
                        !selectedServiceId ||
                        timeOptions.length === 0
                      }
                      rightSection={
                        isLoadingAvailability ? <Loader size="xs" /> : undefined
                      }
                      classNames={{
                        label: classes.mantineLabel,
                        input: classes.mantineInput,
                        error: classes.mantineError,
                      }}
                    />
                  )}
                />
              </div>
            </div>

            <div className={classes.actions}>
              <button
                type="button"
                className={classes.secondaryButton}
                onClick={handleReset}
                disabled={rescheduleMutation.isPending}
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className={classes.primaryButton}
                disabled={rescheduleMutation.isPending}
              >
                {rescheduleMutation.isPending ? 'GUARDANDO...' : 'CONFIRMAR CAMBIO'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PASO 3 — Éxito */}
      {step === 'success' && (
        <div id="cambiar-reserva-success" className={classes.card}>
          <div className={classes.successBox}>
            <div className={classes.successIcon} aria-hidden>
              ✓
            </div>
            <h3 className={classes.successTitle}>Reserva actualizada</h3>
            <p className={classes.successText}>
              Tu turno fue reagendado correctamente. Te llega un email y un WhatsApp con
              el nuevo horario en los próximos minutos.
            </p>
            <button
              type="button"
              className={classes.primaryButton}
              onClick={handleReset}
            >
              VOLVER AL INICIO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
