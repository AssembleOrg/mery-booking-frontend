'use client';

import { useEffect, useState } from 'react';
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
} from '@mantine/core';
import { DatePickerInput, DateValue } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { BookingService, EmployeeService, ServiceService } from '@/infrastructure/http';
import type { Booking, Employee, ServiceEntity } from '@/infrastructure/http';
import classes from './BookingsManager.module.css';

type ViewMode = 'calendar' | 'list';
type CalendarView = 'today' | 'week' | 'month';

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
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

      const bookingsData = await BookingService.getOccupiedTimeSlots({
        startDate: startDateStr,
        endDate: endDateStr,
        employeeId: selectedEmployeeId || undefined,
        serviceId: selectedServiceId || undefined,
      });

      setBookings(bookingsData);
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

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
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
        booking.date === dateStr &&
        booking.status !== 'CANCELLED'
    );
  };

  const getBookingsForEmployeeAndTime = (employeeId: string, hour: number, date: Date) => {
    const dateStr = formatDateToString(date);
    return bookings.filter(
      (booking) =>
        booking.date === dateStr &&
        booking.employeeId === employeeId &&
        booking.startTime === hour &&
        booking.status !== 'CANCELLED'
    );
  };

  const getEmployeesWithBookingsToday = () => {
    const today = new Date();
    const todayStr = formatDateToString(today);
    const todayBookings = bookings.filter(
      (booking) =>
        booking.date === todayStr &&
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
                              const duration = booking.endTime - booking.startTime;
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
                                  }}
                                >
                                  <Text size="xs" fw={500} lineClamp={1}>
                                    {booking.clientName}
                                  </Text>
                                  {duration > 1 && (
                                    <Text size="xs" c="dimmed" mt={2}>
                                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
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
                          >
                            <Text size="xs" fw={500} lineClamp={1}>
                              {booking.clientName}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {formatTime(booking.startTime)}-{formatTime(booking.endTime)}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {booking.serviceName}
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
                        (booking) =>
                          booking.date === dateStr &&
                          booking.startTime === hour &&
                          booking.status !== 'CANCELLED'
                      );

                      return (
                        <Box key={dayIndex} className={classes.calendarCell}>
                          {slotBookings.map((booking) => {
                            const duration = booking.endTime - booking.startTime;
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
                                }}
                              >
                                <Text size="xs" fw={500} lineClamp={1}>
                                  {booking.clientName}
                                </Text>
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {booking.serviceName}
                                </Text>
                                {duration > 1 && (
                                  <Text size="xs" c="dimmed" mt={2}>
                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
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
                bookings.map((booking) => (
                  <Table.Tr key={booking.id}>
                    <Table.Td>
                      {new Date(booking.date).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Table.Td>
                    <Table.Td>
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </Table.Td>
                    <Table.Td>{booking.clientName}</Table.Td>
                    <Table.Td>{booking.employeeName}</Table.Td>
                    <Table.Td>{booking.serviceName}</Table.Td>
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
                ))
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}

