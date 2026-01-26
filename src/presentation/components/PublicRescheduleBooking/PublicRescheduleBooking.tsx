'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Text,
  TextInput,
  Select,
  Modal,
  Group,
  Badge,
  Divider,
  Loader,
  Paper,
} from '@mantine/core';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { useForm, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { useGetBookingByCode, useRescheduleBookingPublic, useAvailability } from '@/presentation/hooks';
import { EmployeeService, ServiceService } from '@/infrastructure/http';
import type { Employee, ServiceEntity } from '@/infrastructure/http';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import classes from './PublicRescheduleBooking.module.css';

dayjs.locale('es');

interface RescheduleFormData {
  date: Date | null;
  startTime: string;
  employeeId: string;
}

export function PublicRescheduleBooking() {
  const [bookingCode, setBookingCode] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [foundBooking, setFoundBooking] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceEntity[]>([]);
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
      date: null,
      startTime: '',
      employeeId: '',
    },
  });

  const selectedDate = watch('date');
  const selectedEmployeeId = watch('employeeId');
  const selectedServiceId = foundBooking?.serviceId;

  const rescheduleAvailabilityMinDate = selectedDate 
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null;
  const rescheduleAvailabilityMaxDate = selectedDate
    ? dayjs(selectedDate).add(30, 'days').format('YYYY-MM-DD')
    : null;

  const { data: availability, isLoading: isLoadingAvailability } = useAvailability(
    selectedEmployeeId || null,
    selectedServiceId || null,
    rescheduleAvailabilityMinDate,
    rescheduleAvailabilityMaxDate
  );

  // Generar opciones de hora
  const timeOptions = (() => {
    const allOptions = [];
    for (let hour = 10; hour <= 17; hour++) {
      allOptions.push({ value: `${hour.toString().padStart(2, '0')}:00`, label: `${hour}:00` });
      if (hour < 17) {
        allOptions.push({ value: `${hour.toString().padStart(2, '0')}:30`, label: `${hour}:30` });
      }
    }
    
    if (availability && selectedDate && selectedEmployeeId && selectedServiceId) {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const dayAvailability = availability.availability.find(day => day.date === dateStr);
      
      if (dayAvailability && dayAvailability.slots) {
        const availableSlots = dayAvailability.slots
          .filter(slot => slot.available)
          .map(slot => slot.startTime);
        
        return allOptions.filter(option => availableSlots.includes(option.value));
      }
    }
    
    return allOptions;
  })();

  const handleSearch = async () => {
    if (!bookingCode.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Por favor ingresa un código de reserva',
        color: 'red',
      });
      return;
    }

    try {
      const booking = await getBookingByCodeMutation.mutateAsync(bookingCode.trim().toUpperCase());
      setFoundBooking(booking);
      setSearchModalOpen(false);
      setRescheduleModalOpen(true);
      
      // Cargar empleados que ofrecen el servicio
      await loadEmployeesForService(booking.serviceId);
      
      // Pre-llenar formulario
      setValue('employeeId', booking.employeeId);
      const bookingDate = dayjs(booking.localDate || booking.date).toDate();
      setValue('date', bookingDate);
      setValue('startTime', booking.localStartTime || booking.startTimeFormatted || '');
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const loadEmployeesForService = async (serviceId: string) => {
    try {
      setIsLoadingEmployees(true);
      // Obtener el servicio para saber la categoría
      const service = await ServiceService.getById(serviceId);
      if (service?.categoryId) {
        // Obtener empleados públicos que ofrecen este servicio
        const employeesList = await EmployeeService.getAllPublic(service.categoryId, serviceId);
        setEmployees(employeesList);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const onSubmitReschedule = async (data: RescheduleFormData) => {
    if (!foundBooking || !data.date) {
      notifications.show({
        title: 'Error',
        message: 'Por favor completa todos los campos',
        color: 'red',
      });
      return;
    }

    try {
      const dateString = dayjs(data.date).format('YYYY-MM-DD');
      const codeToUse = foundBooking.bookingCode || bookingCode.trim().toUpperCase();
      await rescheduleMutation.mutateAsync({
        bookingCode: codeToUse,
        data: {
          date: dateString,
          startTime: data.startTime,
          employeeId: data.employeeId,
        },
      });
      
      setRescheduleModalOpen(false);
      setFoundBooking(null);
      setBookingCode('');
      reset();
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const formatDateString = (dateStr: string) => {
    return dayjs(dateStr).locale('es').format('dddd, D [de] MMMM [de] YYYY');
  };

  return (
    <>
      <Paper className={classes.container} shadow="sm" p="xl" radius="md">
        <Stack gap="md" align="center">
          <Text size="xl" fw={600} ta="center">
            ¿Necesitas reagendar tu turno?
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Ingresa el código de tu reserva para buscar y reagendar tu turno
          </Text>
          <TextInput
            placeholder="Ej: ABC123"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            maxLength={6}
            className={classes.codeInput}
            size="lg"
          />
          <Button
            onClick={handleSearch}
            loading={getBookingByCodeMutation.isPending}
            size="lg"
            className={classes.searchButton}
          >
            Buscar Reserva
          </Button>
        </Stack>
      </Paper>

      {/* Modal: Detalles y Reagendamiento */}
      <Modal
        opened={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false);
          setFoundBooking(null);
          reset();
        }}
        title="Reagendar tu Reserva"
        size="lg"
      >
        {foundBooking && (
          <Stack gap="md">
            {/* Información actual de la reserva */}
            <Paper p="md" withBorder>
              <Text size="sm" fw={500} mb="sm">Reserva Actual</Text>
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Cliente:</strong> {foundBooking.client?.fullName || 'N/A'}
                </Text>
                <Text size="sm">
                  <strong>Fecha y Hora:</strong> {formatDateString(foundBooking.localDate || foundBooking.date)} - {foundBooking.localStartTime || foundBooking.startTimeFormatted} a {foundBooking.localEndTime || foundBooking.endTimeFormatted}
                </Text>
                <Text size="sm">
                  <strong>Servicio:</strong> {foundBooking.service?.name || 'N/A'}
                </Text>
                <Text size="sm">
                  <strong>Profesional:</strong> {foundBooking.employee?.fullName || 'N/A'}
                </Text>
                <Group gap="xs" mt="xs">
                  <Badge color={foundBooking.status === 'CONFIRMED' ? 'green' : 'gray'} variant="light">
                    {foundBooking.status === 'CONFIRMED' ? 'CONFIRMADA' : foundBooking.status}
                  </Badge>
                  {foundBooking.paid && (
                    <Badge color="green" variant="light">PAGADO</Badge>
                  )}
                </Group>
              </Stack>
            </Paper>

            <Divider label="Nueva Fecha y Hora" labelPosition="center" />

            {/* Formulario de reagendamiento */}
            <form onSubmit={handleSubmit(onSubmitReschedule)}>
              <Stack gap="md">
                {/* Empleado */}
                <Controller
                  name="employeeId"
                  control={control}
                  rules={{ required: 'El empleado es requerido' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="* Profesional"
                      placeholder={
                        isLoadingEmployees 
                          ? "Cargando profesionales..." 
                          : "Selecciona un profesional"
                      }
                      data={employees.map(e => ({ value: e.id, label: e.fullName }))}
                      searchable
                      error={errors.employeeId?.message}
                      disabled={isLoadingEmployees}
                      rightSection={isLoadingEmployees ? <Loader size="xs" /> : undefined}
                    />
                  )}
                />

                {/* Fecha */}
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'La fecha es requerida' }}
                  render={({ field }) => (
                    <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
                      <DatePickerInput
                        {...field}
                        label="* Nueva Fecha"
                        placeholder="Selecciona una fecha"
                        value={field.value}
                        onChange={(date) => {
                          field.onChange(date);
                          setValue('startTime', '');
                        }}
                        minDate={new Date()}
                        error={errors.date?.message}
                        locale="es"
                      />
                    </DatesProvider>
                  )}
                />

                {/* Hora */}
                <Controller
                  name="startTime"
                  control={control}
                  rules={{ 
                    required: 'La hora es requerida',
                    pattern: {
                      value: /^([0-1][0-9]|2[0-3]):(00|30)$/,
                      message: 'La hora debe estar en formato HH:mm y solo permite :00 o :30'
                    }
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="* Nueva Hora"
                      placeholder={
                        isLoadingAvailability 
                          ? "Cargando disponibilidad..." 
                          : !selectedDate || !selectedEmployeeId || !selectedServiceId
                          ? "Selecciona fecha y profesional primero"
                          : timeOptions.length === 0
                          ? "No hay horarios disponibles para esta fecha"
                          : "Selecciona una hora"
                      }
                      data={timeOptions}
                      error={errors.startTime?.message}
                      disabled={isLoadingAvailability || !selectedDate || !selectedEmployeeId || !selectedServiceId || timeOptions.length === 0}
                      rightSection={isLoadingAvailability ? <Loader size="xs" /> : undefined}
                    />
                  )}
                />

                <Group justify="flex-end" mt="md">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRescheduleModalOpen(false);
                      setFoundBooking(null);
                      reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={rescheduleMutation.isPending}
                  >
                    Reagendar Turno
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        )}
      </Modal>
    </>
  );
}
