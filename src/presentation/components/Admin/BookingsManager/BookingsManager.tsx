'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Stack,
  Text,
  Select,
  Group,
  Badge,
  Skeleton,
  Center,
  Paper,
  ScrollArea,
  SegmentedControl,
  Table,
  Modal,
  Divider,
  ActionIcon,
  TextInput,
  Textarea,
  Checkbox,
  Loader,
} from '@mantine/core';
import { DatePickerInput, DateValue, DatesProvider } from '@mantine/dates';
import { useForm, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { BookingService, EmployeeService, ServiceService, ClientService } from '@/infrastructure/http';
import type { Booking, BookingResponse, Employee, ServiceEntity, Client, ClientSearchResult } from '@/infrastructure/http';
import { useCreateBooking, useCreateClient, useAvailability } from '@/presentation/hooks';
import { ConfirmationModal } from '@/presentation/components';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import classes from './BookingsManager.module.css';

dayjs.locale('es');

type ViewMode = 'calendar' | 'list';
type CalendarView = 'today' | 'week' | 'month';

export function BookingsManager() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<DateValue>(() => {
    const date = new Date();
    date.setDate(1); // Primer día del mes
    return date;
  });
  const [endDate, setEndDate] = useState<DateValue>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0); // Último día del mes actual
    return date;
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Estados para modales
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [dayBookingsModalOpen, setDayBookingsModalOpen] = useState(false);
  const [bookingDetailsModalOpen, setBookingDetailsModalOpen] = useState(false);
  const [createBookingModalOpen, setCreateBookingModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelConfirmationModalOpen, setCancelConfirmationModalOpen] = useState(false);
  const [clients, setClients] = useState<ClientSearchResult[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  
  // Hooks para crear reserva y cliente
  const createBookingMutation = useCreateBooking();
  const createClientMutation = useCreateClient();
  
  // Formulario para crear reserva manual
  interface CreateBookingFormData {
    clientId: string;
    employeeId: string;
    serviceId: string;
    date: Date | null;
    startTime: string; // HH:mm
    notes: string;
    paid: boolean;
  }
  
  const {
    control: createBookingControl,
    handleSubmit: handleCreateBookingSubmit,
    formState: { errors: createBookingErrors },
    reset: resetCreateBookingForm,
    watch: watchCreateBooking,
    setValue: setCreateBookingValue,
  } = useForm<CreateBookingFormData>({
    defaultValues: {
      clientId: '',
      employeeId: '',
      serviceId: '',
      date: null,
      startTime: '',
      notes: '',
      paid: false,
    },
  });
  
  const selectedServiceIdForBooking = watchCreateBooking('serviceId');
  const selectedEmployeeIdForBooking = watchCreateBooking('employeeId');
  const selectedDateForBooking = watchCreateBooking('date');
  
  // Calcular fechas para la consulta de disponibilidad (rango de 30 días desde la fecha seleccionada)
  const availabilityMinDate = selectedDateForBooking 
    ? dayjs(selectedDateForBooking).format('YYYY-MM-DD')
    : null;
  const availabilityMaxDate = selectedDateForBooking
    ? dayjs(selectedDateForBooking).add(30, 'days').format('YYYY-MM-DD')
    : null;
  
  // Consultar disponibilidad cuando tengamos empleado, servicio y fecha
  const { data: availability, isLoading: isLoadingAvailability } = useAvailability(
    selectedEmployeeIdForBooking || null,
    selectedServiceIdForBooking || null,
    availabilityMinDate,
    availabilityMaxDate
  );
  
  // Cargar clientes cuando se abre el modal (sin filtro inicial)
  useEffect(() => {
    if (createBookingModalOpen) {
      // Cargar primeros 50 clientes al abrir el modal
      searchClients();
    } else {
      // Limpiar búsqueda cuando se cierra el modal
      setClientSearchQuery('');
      setClients([]);
    }
  }, [createBookingModalOpen]);
  
  // Debounce para la búsqueda de clientes cuando el usuario escribe
  useEffect(() => {
    if (!createBookingModalOpen) return;
    
    const trimmedQuery = clientSearchQuery.trim();
    
    // Solo buscar si está vacío (cargar primeros 50) o tiene al menos 2 caracteres
    if (trimmedQuery.length > 0 && trimmedQuery.length < 2) {
      // Si tiene solo 1 carácter, limpiar resultados
      setClients([]);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      const query = trimmedQuery.length >= 2 ? trimmedQuery : undefined;
      searchClients(query);
    }, 300); // Esperar 300ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [clientSearchQuery, createBookingModalOpen]);
  
  const searchClients = async (name?: string) => {
    try {
      setIsLoadingClients(true);
      const results = await ClientService.search(name);
      setClients(results);
    } catch (error) {
      console.error('Error searching clients:', error);
      notifications.show({
        title: 'Error',
        message: 'Error al buscar clientes',
        color: 'red',
      });
      setClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  };
  
  const onSubmitCreateBooking = async (data: CreateBookingFormData) => {
    if (!data.date) {
      notifications.show({
        title: 'Error',
        message: 'Por favor selecciona una fecha',
        color: 'red',
      });
      return;
    }
    
    try {
      const dateString = dayjs(data.date).format('YYYY-MM-DD');
      await createBookingMutation.mutateAsync({
        clientId: data.clientId,
        employeeId: data.employeeId,
        serviceId: data.serviceId,
        date: dateString,
        startTime: data.startTime,
        quantity: 1,
        paid: data.paid,
        notes: data.notes || undefined,
      });
      
      setCreateBookingModalOpen(false);
      resetCreateBookingForm();
      await fetchBookings();
    } catch (error) {
      // Los errores ya se manejan en el hook
      console.error('Error creating booking:', error);
    }
  };
  
  // Generar opciones de hora filtradas por disponibilidad
  const timeOptions = useMemo(() => {
    const allOptions = [];
    for (let hour = 10; hour <= 17; hour++) {
      allOptions.push({ value: `${hour.toString().padStart(2, '0')}:00`, label: `${hour}:00` });
      if (hour < 17) {
        allOptions.push({ value: `${hour.toString().padStart(2, '0')}:30`, label: `${hour}:30` });
      }
    }
    
    // Si tenemos disponibilidad y una fecha seleccionada, filtrar las opciones
    if (availability && selectedDateForBooking && selectedEmployeeIdForBooking && selectedServiceIdForBooking) {
      const dateStr = dayjs(selectedDateForBooking).format('YYYY-MM-DD');
      const dayAvailability = availability.availability.find(day => day.date === dateStr);
      
      if (dayAvailability && dayAvailability.slots) {
        // Filtrar solo los slots disponibles
        const availableSlots = dayAvailability.slots
          .filter(slot => slot.available)
          .map(slot => slot.startTime);
        
        return allOptions.filter(option => availableSlots.includes(option.value));
      }
    }
    
    // Si no hay disponibilidad o no hay fecha seleccionada, devolver todas las opciones
    return allOptions;
  }, [availability, selectedDateForBooking, selectedEmployeeIdForBooking, selectedServiceIdForBooking]);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    updateDateRange();
  }, [calendarView, currentMonth]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchBookings();
    }
  }, [startDate, endDate, selectedEmployeeId, selectedServiceId]);

  // Actualizar hora actual cada minuto para la línea roja
  useEffect(() => {
    if (calendarView === 'today' && viewMode === 'calendar') {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // Actualizar cada minuto

      return () => clearInterval(interval);
    }
  }, [calendarView, viewMode]);

  const updateDateRange = () => {
    const today = new Date();
    
    switch (calendarView) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'week':
        // Usar la semana que contiene el día actual
        const weekStart = new Date(today);
        const dayOfWeek = weekStart.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar para que lunes = 0
        weekStart.setDate(weekStart.getDate() + diff);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Domingo de esta semana
        setStartDate(weekStart);
        setEndDate(weekEnd);
        break;
      case 'month':
        const monthStart = new Date(currentMonth);
        monthStart.setDate(1);
        const monthEnd = new Date(currentMonth);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0); // Último día del mes
        setStartDate(monthStart);
        setEndDate(monthEnd);
        break;
    }
  };

  const initializeData = async () => {
    try {
      setIsLoading(true);
      const [employeesResponse, servicesResponse] = await Promise.all([
        EmployeeService.getAll(),
        ServiceService.getAllWithoutPagination(),
      ]);

      if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
        setEmployees(employeesResponse.data);
      }

      if (Array.isArray(servicesResponse)) {
        setServices(servicesResponse);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      notifications.show({
        title: 'Error',
        message: 'Error al cargar datos iniciales',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!startDate || !endDate) return;

    try {
      setIsLoading(true);
      const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
      const endDateObj = endDate instanceof Date ? endDate : new Date(endDate);
      const startDateStr = formatDateToString(startDateObj);
      const endDateStr = formatDateToString(endDateObj);

      const response = await BookingService.getAll({
        fromDate: startDateStr,
        toDate: endDateStr,
        employeeId: selectedEmployeeId || undefined,
        serviceId: selectedServiceId || undefined,
        // No filtrar por status para mostrar todas las reservas
      });

      // Asegurarse de que response.data sea un array
      const bookingsArray = Array.isArray(response.data) ? response.data : [];
      setBookings(bookingsArray);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      notifications.show({
        title: 'Error',
        message: 'Error al cargar las reservas',
        color: 'red',
      });
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (hour: number | string) => {
    if (typeof hour === 'string') {
      // Si es un string en formato HH:mm, devolverlo tal cual
      return hour;
    }
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Función para truncar texto con "..."
  const truncateText = (text: string, maxLength: number = 15) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Función para parsear hora de formato HH:mm a número
  const parseTimeToNumber = (timeStr: string): number => {
    const [hours] = timeStr.split(':').map(Number);
    return hours;
  };

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'CANCELLED':
        return 'red';
      case 'COMPLETED':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelada';
      case 'COMPLETED':
        return 'Completada';
      default:
        return status;
    }
  };

  // Calendario mensual
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lunes = 0

    const days: (Date | null)[] = [];
    
    // Días del mes anterior (para completar la primera semana)
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(prevYear, prevMonth, prevMonthLastDay - i);
      days.push(date);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }
    
    return days;
  };

  // Calendario semanal
  const getWeekDays = () => {
    if (!startDate) return [];
    const start = new Date(startDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = formatDateToString(date);
    return bookings.filter(
      (booking) =>
        (booking.localDate || booking.date) === dateStr &&
        booking.status !== 'CANCELLED'
    );
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setDayBookingsModalOpen(true);
  };

  const handleBookingClick = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setBookingDetailsModalOpen(true);
  };

  const handleCancelBookingClick = () => {
    // Abrir modal de confirmación en lugar de cancelar directamente
    setCancelConfirmationModalOpen(true);
  };

  const handleConfirmCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setIsCancelling(true);
      await BookingService.cancel(selectedBooking.id);
      notifications.show({
        title: 'Reserva cancelada',
        message: 'La reserva se ha cancelado exitosamente',
        color: 'green',
      });
      setCancelConfirmationModalOpen(false);
      setBookingDetailsModalOpen(false);
      setSelectedBooking(null);
      // Refrescar las reservas
      await fetchBookings();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Error al cancelar la reserva',
        color: 'red',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getBookingsForEmployeeAndTime = (employeeId: string, hour: number, date: Date) => {
    const dateStr = formatDateToString(date);
    return bookings.filter(
      (booking) => {
        const bookingDate = booking.localDate || booking.date;
        const startTime = booking.localStartTime || booking.startTimeFormatted || '';
        return (
          bookingDate === dateStr &&
          booking.employeeId === employeeId &&
          parseTimeToNumber(startTime) === hour &&
          booking.status !== 'CANCELLED'
        );
      }
    );
  };

  // Calcular duración en horas desde strings HH:mm
  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    return (endTotal - startTotal) / 60; // Devolver en horas
  };

  // Helper para obtener la fecha de una reserva (compatibilidad con campos antiguos y nuevos)
  const getBookingDate = (booking: BookingResponse): string => {
    return booking.localDate || booking.date || '';
  };

  // Helper para obtener la hora de inicio formateada
  const getBookingStartTime = (booking: BookingResponse): string => {
    return booking.localStartTime || booking.startTimeFormatted || '';
  };

  // Helper para obtener la hora de fin formateada
  const getBookingEndTime = (booking: BookingResponse): string => {
    return booking.localEndTime || booking.endTimeFormatted || '';
  };

  // Helper para formatear una fecha YYYY-MM-DD a string localizado sin problemas de zona horaria
  const formatDateString = (dateStr: string): string => {
    if (!dateStr) return 'Fecha no disponible';
    
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return 'Fecha no disponible';
    
    // Crear la fecha usando los componentes directamente (evita problemas de UTC)
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEmployeesWithBookingsToday = () => {
    const today = new Date();
    const todayStr = formatDateToString(today);
    const todayBookings = bookings.filter(
      (booking) =>
        getBookingDate(booking) === todayStr &&
        booking.status !== 'CANCELLED'
    );

    // Obtener IDs únicos de empleados
    const employeeIds = new Set(todayBookings.map((b) => b.employeeId));

    // Retornar empleados que tienen reservas hoy
    return employees.filter((emp) => employeeIds.has(emp.id));
  };

  const getCurrentTimePosition = () => {
    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 9 * 60; // 09:00 en minutos
    const endMinutes = 18 * 60; // 18:00 en minutos (hasta las 17:00 visible)

    if (totalMinutes < startMinutes || totalMinutes > endMinutes) {
      return null; // Fuera del rango visible
    }

    // Calcular posición en píxeles basada en las filas de 80px cada una
    // Considerar tanto horas como minutos
    const minutesFromStart = totalMinutes - startMinutes;
    const positionPx = (minutesFromStart / 60) * 80; // Cada hora = 80px, proporcional a los minutos

    return positionPx;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setCalendarView('today');
  };

  const monthDays = getMonthDays();
  const weekDays = getWeekDays();
  const timeSlots = getTimeSlots();

  return (
    <Stack gap="lg">
      <Box className={classes.header}>
        <Text className={classes.title}>Reservas</Text>
        <Button onClick={() => setCreateBookingModalOpen(true)}>
          Crear Reserva Manual
        </Button>
      </Box>

      {/* Filtros */}
      <Paper p="md" className={classes.filtersContainer}>
        <Stack gap="md">
          <Group gap="md" align="flex-end" wrap="wrap">
            <DatePickerInput
              label="Fecha Inicio"
              placeholder="Selecciona fecha inicio"
              value={startDate}
              onChange={setStartDate}
              className={classes.dateInput}
            />
            <DatePickerInput
              label="Fecha Fin"
              placeholder="Selecciona fecha fin"
              value={endDate}
              onChange={setEndDate}
              className={classes.dateInput}
            />
            <Select
              label="Empleado"
              placeholder="Todos los empleados"
              data={employees.map((emp) => ({
                value: emp.id,
                label: emp.fullName,
              }))}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              clearable
              className={classes.filterSelect}
            />
            <Select
              label="Servicio"
              placeholder="Todos los servicios"
              data={services.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
              value={selectedServiceId}
              onChange={setSelectedServiceId}
              clearable
              className={classes.filterSelect}
            />
          </Group>

          <Group justify="space-between" wrap="wrap">
            <Group gap="md">
              <SegmentedControl
                value={calendarView}
                onChange={(value) => setCalendarView(value as CalendarView)}
                data={[
                  { label: 'Hoy', value: 'today' },
                  { label: 'Semana', value: 'week' },
                  { label: 'Mes', value: 'month' },
                ]}
              />
              <SegmentedControl
                value={viewMode}
                onChange={(value) => setViewMode(value as ViewMode)}
                data={[
                  { label: 'Calendario', value: 'calendar' },
                  { label: 'Lista', value: 'list' },
                ]}
              />
            </Group>
            <Group gap="xs">
              {calendarView === 'month' && (
                <>
                  <Button
                    variant="light"
                    onClick={() => navigateMonth('prev')}
                    size="sm"
                  >
                    ←
                  </Button>
                  <Button
                    variant="light"
                    onClick={goToToday}
                    size="sm"
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => navigateMonth('next')}
                    size="sm"
                  >
                    →
                  </Button>
                </>
              )}
              <Button
                variant="light"
                onClick={fetchBookings}
                loading={isLoading}
              >
                Actualizar
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Contenido según vista */}
      {isLoading ? (
        <Center py="xl">
          <Stack gap="md" align="center">
            <Skeleton height={400} width="100%" />
          </Stack>
        </Center>
      ) : viewMode === 'calendar' ? (
        <Paper p="md" className={classes.calendarContainer}>
          {calendarView === 'today' ? (
            <ScrollArea>
              {getEmployeesWithBookingsToday().length === 0 ? (
                <Center py="xl">
                  <Text c="dimmed">No hay empleados con reservas para hoy</Text>
                </Center>
              ) : (
                <Box className={classes.dayCalendar}>
                  {/* Header con empleados */}
                  <Box className={classes.dayCalendarHeader}>
                    <Box className={classes.timeColumn}></Box>
                    {getEmployeesWithBookingsToday().map((employee) => (
                      <Box key={employee.id} className={classes.employeeHeader}>
                        <Text fw={600} size="sm">
                          {employee.fullName}
                        </Text>
                      </Box>
                    ))}
                  </Box>

                {/* Filas de horarios con línea de hora actual */}
                <Box className={classes.dayCalendarBody} style={{ position: 'relative' }}>
                  {/* Línea roja de hora actual */}
                  {getCurrentTimePosition() !== null && (
                    <Box
                      className={classes.currentTimeLine}
                      style={{
                        top: `${getCurrentTimePosition()}px`,
                      }}
                    >
                      <Box className={classes.currentTimeIndicator}></Box>
                    </Box>
                  )}

                  {timeSlots.map((hour) => (
                    <Box key={hour} className={classes.dayCalendarRow}>
                      <Box className={classes.timeColumn}>
                        <Text size="sm" fw={500}>
                          {formatTime(hour)}
                        </Text>
                      </Box>
                      {getEmployeesWithBookingsToday().map((employee) => {
                        const today = new Date();
                        const slotBookings = getBookingsForEmployeeAndTime(
                          employee.id,
                          hour,
                          today
                        );

                        return (
                          <Box key={employee.id} className={classes.dayCalendarCell}>
                            {slotBookings.map((booking) => {
                              const startTime = getBookingStartTime(booking);
                              const endTime = getBookingEndTime(booking);
                              const duration = calculateDuration(startTime, endTime);
                              const height = duration > 0 ? `${duration * 80 - 4}px` : '76px';
                              return (
                                <Paper
                                  key={booking.id}
                                  p="xs"
                                  className={classes.bookingCard}
                                  style={{
                                    backgroundColor: '#e3f2fd',
                                    minHeight: height,
                                    height: duration > 1 ? height : 'auto',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => handleBookingClick(booking)}
                                >
                                  <Text size="xs" fw={500} lineClamp={1} title={booking.client?.fullName || 'Cliente'}>
                                    {truncateText(booking.client?.fullName || 'Sin nombre', 15)}
                                  </Text>
                                  {duration > 1 && (
                                    <Text size="xs" c="dimmed" mt={2}>
                                      {startTime} - {endTime}
                                    </Text>
                                  )}
                                </Paper>
                              );
                            })}
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Box>
              </Box>
              )}
            </ScrollArea>
          ) : calendarView === 'month' ? (
            <Box className={classes.monthCalendar}>
              {/* Header del mes */}
              <Box className={classes.monthHeader}>
                <Text fw={600} size="lg">
                  {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                </Text>
              </Box>

              {/* Días de la semana */}
              <Box className={classes.weekDaysHeader}>
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                  <Box key={day} className={classes.weekDayHeader}>
                    <Text fw={500} size="sm">
                      {day}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* Grid de días del mes */}
              <Box className={classes.monthGrid}>
                {monthDays.map((day, index) => {
                  if (!day) return <Box key={index} className={classes.monthDayCell} />;
                  
                  const dateStr = formatDateToString(day);
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const isToday = formatDateToString(new Date()) === dateStr;
                  const dayBookings = getBookingsForDate(day);
                  const visibleBookings = dayBookings.slice(0, 3);
                  const moreCount = dayBookings.length - 3;

                  return (
                    <Box
                      key={index}
                      className={`${classes.monthDayCell} ${!isCurrentMonth ? classes.otherMonthDay : ''} ${isToday ? classes.todayCell : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDayClick(day)}
                    >
                      <Text
                        size="sm"
                        fw={isToday ? 700 : 500}
                        c={isCurrentMonth ? undefined : 'dimmed'}
                        className={classes.dayNumber}
                      >
                        {day.getDate()}
                      </Text>
                      <Stack gap={2} mt={4}>
                        {visibleBookings.map((booking) => (
                          <Paper
                            key={booking.id}
                            p={4}
                            className={classes.monthBookingCard}
                            style={{
                              backgroundColor: '#e3f2fd',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookingClick(booking);
                            }}
                          >
                            <Text 
                              size="xs" 
                              fw={500} 
                              lineClamp={1}
                              style={{ cursor: 'pointer' }}
                              title={booking.client?.fullName || 'Cliente'}
                            >
                              {truncateText(booking.client?.fullName || 'Sin nombre', 15)}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {getBookingStartTime(booking)}-{getBookingEndTime(booking)}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {booking.service?.name || 'Sin servicio'}
                            </Text>
                          </Paper>
                        ))}
                        {moreCount > 0 && (
                          <Text size="xs" c="dimmed" fw={500} mt={2}>
                            +{moreCount} más
                          </Text>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <ScrollArea>
              <Box className={classes.calendarGrid}>
                {/* Header con días de la semana */}
                <Box className={classes.calendarHeader}>
                  <Box className={classes.timeColumn}></Box>
                  {weekDays.map((day, index) => (
                    <Box key={index} className={classes.dayHeader}>
                      <Text fw={600} size="sm" style={{ textTransform: 'capitalize' }}>
                        {day.toLocaleDateString('es-AR', { weekday: 'short' })}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {day.getDate()} {day.toLocaleDateString('es-AR', { month: 'short' })}
                      </Text>
                    </Box>
                  ))}
                </Box>

                {/* Filas de horarios */}
                {timeSlots.map((hour) => (
                  <Box key={hour} className={classes.calendarRow}>
                    <Box className={classes.timeColumn}>
                      <Text size="sm" fw={500}>
                        {formatTime(hour)}
                      </Text>
                    </Box>
                    {weekDays.map((day, dayIndex) => {
                      const dateStr = formatDateToString(day);
                      // Solo mostrar reservas que empiezan en esta hora exacta
                      const slotBookings = bookings.filter(
                        (booking) => {
                          const bookingDate = getBookingDate(booking);
                          const startTime = getBookingStartTime(booking);
                          return (
                            bookingDate === dateStr &&
                            parseTimeToNumber(startTime) === hour &&
                            booking.status !== 'CANCELLED'
                          );
                        }
                      );

                      return (
                        <Box key={dayIndex} className={classes.calendarCell}>
                          {slotBookings.map((booking) => {
                            const startTime = getBookingStartTime(booking);
                            const endTime = getBookingEndTime(booking);
                            const duration = calculateDuration(startTime, endTime);
                            const height = duration > 0 ? `${duration * 80 - 4}px` : '76px';
                            return (
                              <Paper
                                key={booking.id}
                                p="xs"
                                className={classes.bookingCard}
                                style={{
                                  backgroundColor: '#e3f2fd',
                                  minHeight: height,
                                  height: duration > 1 ? height : 'auto',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleBookingClick(booking)}
                              >
                                <Text size="xs" fw={500} lineClamp={1} title={booking.client?.fullName || 'Cliente'}>
                                  {truncateText(booking.client?.fullName || 'Sin nombre', 15)}
                                </Text>
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {booking.service?.name || 'Sin servicio'}
                                </Text>
                                {duration > 1 && (
                                  <Text size="xs" c="dimmed" mt={2}>
                                    {startTime} - {endTime}
                                  </Text>
                                )}
                                <Group gap={4} mt={4} wrap="wrap">
                                  <Badge
                                    size="xs"
                                    color={getStatusColor(booking.status)}
                                    variant="light"
                                  >
                                    {getStatusLabel(booking.status)}
                                  </Badge>
                                  {booking.paid && (
                                    <Badge size="xs" color="green" variant="light">
                                      Pagado
                                    </Badge>
                                  )}
                                </Group>
                              </Paper>
                            );
                          })}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </ScrollArea>
          )}
        </Paper>
      ) : (
        <Paper p="md" className={classes.listContainer}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Horario</Table.Th>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Empleado</Table.Th>
                <Table.Th>Servicio</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Pagado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bookings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Center py="xl">
                      <Text c="dimmed">No hay reservas en el rango seleccionado</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                bookings.map((booking) => {
                  const bookingDate = getBookingDate(booking);
                  const startTime = getBookingStartTime(booking);
                  const endTime = getBookingEndTime(booking);
                  return (
                    <Table.Tr key={booking.id}>
                      <Table.Td>
                        {bookingDate ? (() => {
                          const [year, month, day] = bookingDate.split('-').map(Number);
                          if (!year || !month || !day) return '-';
                          const date = new Date(year, month - 1, day);
                          return date.toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          });
                        })() : '-'}
                      </Table.Td>
                      <Table.Td>
                        {startTime && endTime ? `${startTime} - ${endTime}` : '-'}
                      </Table.Td>
                    <Table.Td 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleBookingClick(booking)}
                    >
                      {booking.client?.fullName || 'Sin nombre'}
                    </Table.Td>
                    <Table.Td>{booking.employee?.fullName || 'Sin empleado'}</Table.Td>
                    <Table.Td>{booking.service?.name || 'Sin servicio'}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={getStatusColor(booking.status)}
                        variant="light"
                      >
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={booking.paid ? 'green' : 'gray'} variant="light">
                        {booking.paid ? 'Sí' : 'No'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {/* Modal: Lista de reservas del día */}
      <Modal
        opened={dayBookingsModalOpen}
        onClose={() => {
          setDayBookingsModalOpen(false);
          setSelectedDate(null);
        }}
        title={selectedDate ? `Reservas del ${selectedDate.toLocaleDateString('es-AR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}` : 'Reservas del día'}
        size="lg"
      >
        {selectedDate && (
          <Stack gap="md">
            {getBookingsForDate(selectedDate).length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No hay reservas para este día
              </Text>
            ) : (
              getBookingsForDate(selectedDate).map((booking) => (
                <Paper
                  key={booking.id}
                  p="md"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setDayBookingsModalOpen(false);
                    handleBookingClick(booking);
                  }}
                >
                  <Group justify="space-between">
                    <Box>
                      <Text fw={500} size="sm">
                        {booking.client?.fullName || 'Sin nombre'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {getBookingStartTime(booking)} - {getBookingEndTime(booking)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {booking.service?.name || 'Sin servicio'} • {booking.employee?.fullName || 'Sin empleado'}
                      </Text>
                    </Box>
                    <Badge color={getStatusColor(booking.status)} variant="light">
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </Group>
                </Paper>
              ))
            )}
          </Stack>
        )}
      </Modal>

      {/* Modal: Detalles de reserva */}
      <Modal
        opened={bookingDetailsModalOpen}
        onClose={() => {
          setBookingDetailsModalOpen(false);
          setSelectedBooking(null);
        }}
        title="Detalles de la Reserva"
        size="lg"
      >
        {selectedBooking && (
          <Stack gap="md">
            <Box>
              <Text size="sm" fw={500} c="dimmed">Cliente</Text>
              <Text size="md" fw={600}>{selectedBooking.client?.fullName || 'Sin nombre'}</Text>
              <Text size="xs" c="dimmed">{selectedBooking.client?.email || 'Sin email'}</Text>
              <Text size="xs" c="dimmed">{selectedBooking.client?.phone || 'Sin teléfono'}</Text>
            </Box>

            <Divider />

            <Box>
              <Text size="sm" fw={500} c="dimmed">Fecha y Hora</Text>
              <Text size="md">
                {formatDateString(getBookingDate(selectedBooking))}
              </Text>
              <Text size="md" fw={600}>
                {getBookingStartTime(selectedBooking)} - {getBookingEndTime(selectedBooking)}
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text size="sm" fw={500} c="dimmed">Servicio</Text>
              <Text size="md">{selectedBooking.service?.name || 'Sin servicio'}</Text>
              <Text size="xs" c="dimmed">
                Duración: {selectedBooking.service?.duration || 0} minutos
              </Text>
              <Text size="xs" c="dimmed">
                Precio: ${selectedBooking.service?.price || '0'}
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text size="sm" fw={500} c="dimmed">Profesional</Text>
              <Text size="md">{selectedBooking.employee?.fullName || 'Sin empleado'}</Text>
            </Box>

            {selectedBooking.notes && (
              <>
                <Divider />
                <Box>
                  <Text size="sm" fw={500} c="dimmed">Notas</Text>
                  <Text size="sm">{selectedBooking.notes}</Text>
                </Box>
              </>
            )}

            <Divider />

            <Group justify="space-between">
              <Group gap="xs">
                <Badge color={getStatusColor(selectedBooking.status)} variant="light">
                  {getStatusLabel(selectedBooking.status)}
                </Badge>
                <Badge color={selectedBooking.paid ? 'green' : 'gray'} variant="light">
                  {selectedBooking.paid ? 'Pagado' : 'No pagado'}
                </Badge>
              </Group>
            </Group>

            {selectedBooking.status !== 'CANCELLED' && (
              <Button
                color="red"
                variant="outline"
                onClick={handleCancelBookingClick}
                fullWidth
              >
                Cancelar Reserva
              </Button>
            )}
          </Stack>
        )}
      </Modal>

      {/* Modal: Crear reserva manual */}
      <Modal
        opened={createBookingModalOpen}
        onClose={() => {
          setCreateBookingModalOpen(false);
          resetCreateBookingForm();
        }}
        title="Crear Reserva Manual"
        size="lg"
      >
        <form onSubmit={handleCreateBookingSubmit(onSubmitCreateBooking)}>
          <Stack gap="md">
            {/* Cliente */}
            <Controller
              name="clientId"
              control={createBookingControl}
              rules={{ required: 'El cliente es requerido' }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="* Cliente"
                  placeholder="Busca un cliente por nombre..."
                  data={clients.map(c => ({ value: c.id, label: `${c.fullName}${c.email ? ` (${c.email})` : ''}` }))}
                  searchable
                  searchValue={clientSearchQuery}
                  onSearchChange={setClientSearchQuery}
                  disabled={isLoadingClients}
                  error={createBookingErrors.clientId?.message}
                  nothingFoundMessage={isLoadingClients ? "Buscando..." : "No se encontraron clientes"}
                  rightSection={isLoadingClients ? <Loader size="xs" /> : undefined}
                />
              )}
            />

            {/* Empleado */}
            <Controller
              name="employeeId"
              control={createBookingControl}
              rules={{ required: 'El empleado es requerido' }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="* Empleado"
                  placeholder="Selecciona un empleado"
                  data={employees.map(e => ({ value: e.id, label: e.fullName }))}
                  searchable
                  error={createBookingErrors.employeeId?.message}
                />
              )}
            />

            {/* Servicio */}
            <Controller
              name="serviceId"
              control={createBookingControl}
              rules={{ required: 'El servicio es requerido' }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="* Servicio"
                  placeholder="Selecciona un servicio"
                  data={services.map(s => ({ value: s.id, label: s.name }))}
                  searchable
                  error={createBookingErrors.serviceId?.message}
                />
              )}
            />

            {/* Fecha */}
            <Controller
              name="date"
              control={createBookingControl}
              rules={{ required: 'La fecha es requerida' }}
              render={({ field }) => (
                <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
                  <DatePickerInput
                    {...field}
                    label="* Fecha"
                    placeholder="Selecciona una fecha"
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date);
                      // Resetear la hora cuando cambie la fecha
                      setCreateBookingValue('startTime', '');
                    }}
                    minDate={new Date()}
                    error={createBookingErrors.date?.message}
                    locale="es"
                  />
                </DatesProvider>
              )}
            />

            {/* Hora */}
            <Controller
              name="startTime"
              control={createBookingControl}
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
                  label="* Hora de inicio"
                  placeholder={
                    isLoadingAvailability 
                      ? "Cargando disponibilidad..." 
                      : !selectedDateForBooking || !selectedEmployeeIdForBooking || !selectedServiceIdForBooking
                      ? "Selecciona fecha, empleado y servicio primero"
                      : timeOptions.length === 0
                      ? "No hay horarios disponibles para esta fecha"
                      : "Selecciona una hora"
                  }
                  data={timeOptions}
                  error={createBookingErrors.startTime?.message}
                  disabled={isLoadingAvailability || !selectedDateForBooking || !selectedEmployeeIdForBooking || !selectedServiceIdForBooking || timeOptions.length === 0}
                  rightSection={isLoadingAvailability ? <Loader size="xs" /> : undefined}
                />
              )}
            />

            {/* Notas */}
            <Controller
              name="notes"
              control={createBookingControl}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Notas"
                  placeholder="Notas adicionales (opcional)"
                  rows={3}
                />
              )}
            />

            {/* Pagado */}
            <Controller
              name="paid"
              control={createBookingControl}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.currentTarget.checked)}
                  label="Reserva pagada"
                />
              )}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateBookingModalOpen(false);
                  resetCreateBookingForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={createBookingMutation.isPending}
              >
                Crear Reserva
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal: Confirmación de cancelación */}
      <ConfirmationModal
        opened={cancelConfirmationModalOpen}
        onClose={() => setCancelConfirmationModalOpen(false)}
        onConfirm={handleConfirmCancelBooking}
        title="Cancelar Reserva"
        message={selectedBooking 
          ? `¿Estás seguro de que deseas cancelar la reserva de "${selectedBooking.client?.fullName || 'Cliente'}" para el ${formatDateString(getBookingDate(selectedBooking))} a las ${getBookingStartTime(selectedBooking)}?`
          : '¿Estás seguro de que deseas cancelar esta reserva?'
        }
        confirmationWord="cancelar"
        confirmButtonText="Cancelar Reserva"
        confirmButtonColor="red"
        isLoading={isCancelling}
      />
    </Stack>
  );
}

