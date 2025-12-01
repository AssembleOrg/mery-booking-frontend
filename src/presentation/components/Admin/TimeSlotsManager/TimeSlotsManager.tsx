'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Stack,
  Text,
  Modal,
  Box,
  Skeleton,
  Center,
  NumberInput,
  Select,
  Switch,
  Group,
  Badge,
  MultiSelect,
  Alert,
  TextInput,
  Checkbox,
  ScrollArea,
  Divider,
  Collapse,
  UnstyledButton,
} from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { EmployeeTimeSlotService, EmployeeService, ServiceService } from '@/infrastructure/http';
import type {
  EmployeeTimeSlot,
  CreateEmployeeTimeSlotDto,
  DayOfWeek,
  Employee,
  ServiceEntity,
} from '@/infrastructure/http';
import { ConfirmationModal } from '@/presentation/components';
import classes from './TimeSlotsManager.module.css';

interface FormData {
  employeeId: string;
  date: string;
  dayOfWeek: DayOfWeek | '';
  startTime: number;
  endTime: number;
  isActive: boolean;
  type: 'date' | 'dayOfWeek'; // Para saber si es fecha específica o día de la semana
  serviceIds: string[];
}

const DAYS_OF_WEEK: Array<{ value: DayOfWeek; label: string }> = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

export function TimeSlotsManager() {
  const [timeSlots, setTimeSlots] = useState<EmployeeTimeSlot[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [employeeServices, setEmployeeServices] = useState<ServiceEntity[]>([]);
  const [serviceSearchFilter, setServiceSearchFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEmployeeServices, setIsLoadingEmployeeServices] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<EmployeeTimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [timeSlotToDelete, setTimeSlotToDelete] = useState<EmployeeTimeSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [isCopying, setIsCopying] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const type = watch('type');
  const selectedServiceIds = watch('serviceIds') || [];

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchTimeSlots();
      setExpandedDays(new Set()); // Reset expanded days when employee changes
    } else {
      setTimeSlots([]);
      setExpandedDays(new Set());
    }
  }, [selectedEmployeeId]);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar empleados primero (obligatorio)
      const employeesResponse = await EmployeeService.getAll();
      
      // Validar que la respuesta tenga la estructura esperada
      if (!employeesResponse || !employeesResponse.data || !Array.isArray(employeesResponse.data)) {
        console.error('Invalid employees response:', employeesResponse);
        setEmployees([]);
      } else {
        setEmployees(employeesResponse.data);
      }
      
      // Cargar servicios en paralelo (opcional para el dropdown)
      try {
        const servicesResponse = await ServiceService.getAllVisible();
        if (Array.isArray(servicesResponse)) {
          setServices(servicesResponse);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Error loading services (non-critical):', error);
        setServices([]);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      setEmployees([]);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    if (!selectedEmployeeId) return;
    
    try {
      setIsLoading(true);
      const response = await EmployeeTimeSlotService.getAll(undefined, undefined, selectedEmployeeId);
      
      // Validar que la respuesta tenga la estructura esperada
      if (!response || !response.data) {
        console.error('Invalid time slots response:', response);
        setTimeSlots([]);
        return;
      }
      
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployeeServices = async (employeeId: string) => {
    try {
      setIsLoadingEmployeeServices(true);
      const services = await EmployeeService.getServices(employeeId);
      setEmployeeServices(services);
    } catch (error) {
      console.error('Error loading employee services:', error);
      setEmployeeServices([]);
    } finally {
      setIsLoadingEmployeeServices(false);
    }
  };

  const handleOpenCreate = async () => {
    if (!selectedEmployeeId) {
      notifications.show({
        title: 'Empleado requerido',
        message: 'Por favor, selecciona un empleado antes de crear una nueva franja horaria.',
        color: 'orange',
      });
      return;
    }
    
    setEditingTimeSlot(null);
    setIsCopying(false);
    setServiceSearchFilter('');
    await loadEmployeeServices(selectedEmployeeId);
    reset({
      employeeId: selectedEmployeeId,
      date: '',
      dayOfWeek: '',
      startTime: 9,
      endTime: 10,
      isActive: false,
      type: 'dayOfWeek',
      serviceIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenCopy = async (timeSlot: EmployeeTimeSlot) => {
    if (!selectedEmployeeId) {
      notifications.show({
        title: 'Empleado requerido',
        message: 'Por favor, selecciona un empleado antes de copiar una franja horaria.',
        color: 'orange',
      });
      return;
    }

    setEditingTimeSlot(null);
    setIsCopying(true);
    setServiceSearchFilter('');
    await loadEmployeeServices(selectedEmployeeId);
    const isDateType = !!timeSlot.date;
    reset({
      employeeId: selectedEmployeeId,
      date: '', // Al copiar, no copiamos la fecha específica, solo el día de la semana si aplica
      dayOfWeek: timeSlot.dayOfWeek || '',
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      isActive: false, // Por defecto inactivo al copiar
      type: isDateType ? 'dayOfWeek' : 'dayOfWeek', // Siempre copiamos como día de la semana recurrente
      serviceIds: timeSlot.serviceIds || [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (timeSlot: EmployeeTimeSlot) => {
    setEditingTimeSlot(timeSlot);
    setServiceSearchFilter('');
    await loadEmployeeServices(timeSlot.employeeId);
    const isDateType = !!timeSlot.date;
    reset({
      employeeId: timeSlot.employeeId,
      date: timeSlot.date || '',
      dayOfWeek: (timeSlot.dayOfWeek as DayOfWeek) || '',
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      isActive: timeSlot.isActive,
      type: isDateType ? 'date' : 'dayOfWeek',
      serviceIds: timeSlot.serviceIds || [],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTimeSlot(null);
    setIsCopying(false);
    setEmployeeServices([]);
    setServiceSearchFilter('');
  };

  const filteredEmployeeServices = employeeServices
    .filter((service) =>
      service.name.toLowerCase().includes(serviceSearchFilter.toLowerCase())
    )
    .sort((a, b) => {
      // Ordenar: primero los seleccionados, luego los no seleccionados
      const aSelected = selectedServiceIds.includes(a.id);
      const bSelected = selectedServiceIds.includes(b.id);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0; // Mantener el orden original si ambos tienen el mismo estado
    });

  const handleServiceToggle = (serviceId: string, currentIds: string[]) => {
    if (currentIds.includes(serviceId)) {
      return currentIds.filter((id) => id !== serviceId);
    } else {
      return [...currentIds, serviceId];
    }
  };

  const onSubmit = async (data: FormData) => {
    // Validar que haya al menos un servicio seleccionado
    if (!data.serviceIds || data.serviceIds.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const timeSlotData: CreateEmployeeTimeSlotDto = {
        employeeId: data.employeeId,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive,
        serviceIds: data.serviceIds, // Ahora es obligatorio
      };

      if (data.type === 'date') {
        timeSlotData.date = data.date;
      } else {
        timeSlotData.dayOfWeek = data.dayOfWeek as DayOfWeek;
      }

      if (editingTimeSlot) {
        await EmployeeTimeSlotService.update(editingTimeSlot.id, timeSlotData);
        // Actualizar servicios por separado
        await EmployeeTimeSlotService.updateServices(editingTimeSlot.id, data.serviceIds);
        notifications.show({
          title: 'Franja horaria actualizada',
          message: 'La franja horaria se ha actualizado correctamente.',
          color: 'green',
        });
      } else {
        await EmployeeTimeSlotService.create(timeSlotData);
        notifications.show({
          title: 'Franja horaria creada',
          message: isCopying 
            ? 'La franja horaria se ha copiado y creado correctamente.'
            : 'La franja horaria se ha creado correctamente.',
          color: 'green',
        });
      }

      await fetchTimeSlots();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving time slot:', error);
      notifications.show({
        title: 'Error',
        message: 'Hubo un error al guardar la franja horaria. Por favor, intenta nuevamente.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (timeSlot: EmployeeTimeSlot) => {
    try {
      setIsToggling(timeSlot.id);
      await EmployeeTimeSlotService.toggleActive(timeSlot.id);
      await fetchTimeSlots();
      notifications.show({
        title: 'Estado actualizado',
        message: `La franja horaria ha sido ${timeSlot.isActive ? 'desactivada' : 'activada'} correctamente.`,
        color: 'green',
      });
    } catch (error) {
      console.error('Error toggling time slot:', error);
      notifications.show({
        title: 'Error',
        message: 'Hubo un error al cambiar el estado de la franja horaria.',
        color: 'red',
      });
    } finally {
      setIsToggling(null);
    }
  };

  const handleOpenDelete = (timeSlot: EmployeeTimeSlot) => {
    setTimeSlotToDelete(timeSlot);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!timeSlotToDelete) return;

    try {
      setIsDeleting(true);
      await EmployeeTimeSlotService.delete(timeSlotToDelete.id);
      await fetchTimeSlots();
      setDeleteModalOpen(false);
      setTimeSlotToDelete(null);
      notifications.show({
        title: 'Franja horaria eliminada',
        message: 'La franja horaria se ha eliminado correctamente.',
        color: 'green',
      });
    } catch (error) {
      console.error('Error deleting time slot:', error);
      notifications.show({
        title: 'Error',
        message: 'Hubo un error al eliminar la franja horaria.',
        color: 'red',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.fullName || 'Sin empleado';
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatTimeRange = (start: number, end: number) => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const toggleDay = (dayKey: string) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayKey)) {
        newSet.delete(dayKey);
      } else {
        newSet.add(dayKey);
      }
      return newSet;
    });
  };

  const groupTimeSlotsByDay = () => {
    const grouped: Record<string, EmployeeTimeSlot[]> = {};

    timeSlots.forEach((timeSlot) => {
      let dayKey: string;
      let dayLabel: string;

      if (timeSlot.date) {
        // Fecha específica
        const date = new Date(timeSlot.date);
        dayKey = `date-${timeSlot.date}`;
        dayLabel = date.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } else if (timeSlot.dayOfWeek) {
        // Día de la semana recurrente
        dayKey = `day-${timeSlot.dayOfWeek}`;
        dayLabel = DAYS_OF_WEEK.find((d) => d.value === timeSlot.dayOfWeek)?.label || timeSlot.dayOfWeek;
      } else {
        return; // Skip si no tiene ni fecha ni día
      }

      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(timeSlot);
    });

    // Ordenar cada grupo por horario de inicio
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.startTime - b.startTime);
    });

    // Convertir a array y ordenar por día de la semana o fecha
    return Object.entries(grouped).map(([dayKey, slots]) => {
      const firstSlot = slots[0];
      let dayLabel: string;
      let sortOrder: number;

      if (firstSlot.date) {
        const date = new Date(firstSlot.date);
        dayLabel = date.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        sortOrder = date.getTime();
      } else {
        const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        dayLabel = DAYS_OF_WEEK.find((d) => d.value === firstSlot.dayOfWeek)?.label || firstSlot.dayOfWeek || '';
        sortOrder = dayOrder.indexOf(firstSlot.dayOfWeek || '') + 1000; // Fechas específicas primero
      }

      return {
        dayKey,
        dayLabel,
        sortOrder,
        slots,
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const renderSkeletonRows = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Table.Tr key={index}>
          <Table.Td><Skeleton height={20} width={120} /></Table.Td>
          <Table.Td><Skeleton height={20} width={100} /></Table.Td>
          <Table.Td><Skeleton height={20} width={80} /></Table.Td>
          <Table.Td><Skeleton height={20} width={150} /></Table.Td>
          <Table.Td><Skeleton height={20} width={60} /></Table.Td>
          <Table.Td>
            <Group gap="xs">
              <Skeleton height={28} width={70} />
              <Skeleton height={28} width={70} />
              <Skeleton height={28} width={70} />
            </Group>
          </Table.Td>
        </Table.Tr>
      ));
  };

  return (
    <>
      <Stack gap="lg">
        <Box className={classes.header}>
          <Text className={classes.title}>Gestión de Franjas Horarias</Text>
          <Button 
            color="pink" 
            onClick={handleOpenCreate} 
            className={classes.createButton}
            disabled={!selectedEmployeeId}
          >
            + Nueva Franja Horaria
          </Button>
        </Box>

        {/* Selector de Empleado (Requerido) */}
        <Box className={classes.filterContainer}>
          <Select
            label="Seleccionar empleado"
            placeholder={
              isLoading 
                ? "Cargando empleados..." 
                : employees.length === 0 
                  ? "No hay empleados disponibles" 
                  : "Selecciona un empleado para ver sus franjas horarias"
            }
            data={employees.map((emp) => ({
              value: emp.id,
              label: emp.fullName,
            }))}
            value={selectedEmployeeId}
            onChange={(value) => setSelectedEmployeeId(value || '')}
            className={classes.filterSelect}
            required
            disabled={isLoading || employees.length === 0}
          />
          {employees.length === 0 && !isLoading && (
            <Alert color="yellow" mt="md" title="Sin empleados">
              No se encontraron empleados. Por favor, crea empleados primero.
            </Alert>
          )}
          {!selectedEmployeeId && employees.length > 0 && (
            <Alert color="blue" mt="md" title="Selecciona un empleado">
              Por favor, selecciona un empleado para gestionar sus franjas horarias.
            </Alert>
          )}
        </Box>

        {selectedEmployeeId && (
          <Box className={classes.tableContainer}>
            {isLoading ? (
              <Stack gap="md" p="md">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} height={60} />
                ))}
              </Stack>
            ) : timeSlots.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">No hay franjas horarias para este empleado</Text>
              </Center>
            ) : (
              <Stack gap="xs" p="md">
                {groupTimeSlotsByDay().map(({ dayKey, dayLabel, slots }) => {
                  const isExpanded = expandedDays.has(dayKey);
                  const firstSlot = slots[0];
                  const isDateSpecific = !!firstSlot.date;

                  return (
                    <Box key={dayKey} className={classes.dayGroup}>
                      <UnstyledButton
                        className={classes.dayHeader}
                        onClick={() => toggleDay(dayKey)}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="md">
                            <Text fw={600} size="lg" className={classes.dayTitle}>
                              {dayLabel}
                            </Text>
                            <Badge color={isDateSpecific ? 'blue' : 'violet'} size="lg">
                              {slots.length} horario{slots.length !== 1 ? 's' : ''}
                            </Badge>
                          </Group>
                          <Text size="xl" c="dimmed">
                            {isExpanded ? '−' : '+'}
                          </Text>
                        </Group>
                      </UnstyledButton>

                      <Collapse in={isExpanded}>
                        <Stack gap="xs" mt="xs" p="sm" className={classes.timeSlotsList}>
                          {slots.map((timeSlot) => (
                            <Box key={timeSlot.id} className={classes.timeSlotCard}>
                              <Group justify="space-between" align="flex-start" wrap="nowrap">
                                <Box style={{ flex: 1 }}>
                                  <Group gap="md" mb="xs">
                                    <Text fw={500} size="md">
                                      {formatTimeRange(timeSlot.startTime, timeSlot.endTime)}
                                    </Text>
                                    <Badge color={timeSlot.isActive ? 'green' : 'gray'} size="sm">
                                      {timeSlot.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                  </Group>
                                  {timeSlot.services && timeSlot.services.length > 0 ? (
                                    <Group gap={4} wrap="wrap">
                                      {timeSlot.services.map((service) => (
                                        <Badge key={service.id} color="pink" variant="light" size="sm">
                                          {service.name}
                                        </Badge>
                                      ))}
                                    </Group>
                                  ) : (
                                    <Text size="xs" c="dimmed">
                                      Sin servicios
                                    </Text>
                                  )}
                                </Box>
                                <Group gap="xs" ml="md">
                                  <Button
                                    variant="light"
                                    color="violet"
                                    size="xs"
                                    onClick={() => handleOpenCopy(timeSlot)}
                                  >
                                    Copiar
                                  </Button>
                                  <Button
                                    variant="light"
                                    color={timeSlot.isActive ? 'orange' : 'green'}
                                    size="xs"
                                    onClick={() => handleToggleActive(timeSlot)}
                                    loading={isToggling === timeSlot.id}
                                  >
                                    {timeSlot.isActive ? 'Desactivar' : 'Activar'}
                                  </Button>
                                  <Button
                                    variant="light"
                                    color="blue"
                                    size="xs"
                                    onClick={() => handleOpenEdit(timeSlot)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    variant="light"
                                    color="red"
                                    size="xs"
                                    onClick={() => handleOpenDelete(timeSlot)}
                                  >
                                    Eliminar
                                  </Button>
                                </Group>
                              </Group>
                            </Box>
                          ))}
                        </Stack>
                      </Collapse>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        )}
      </Stack>

      {/* Modal Create/Edit/Copy */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingTimeSlot 
            ? 'Editar Franja Horaria' 
            : isCopying 
              ? 'Copiar Franja Horaria' 
              : 'Nueva Franja Horaria'
        }
        centered
        size="lg"
        classNames={{
          title: classes.modalTitle,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Controller
              name="employeeId"
              control={control}
              rules={{ required: 'El empleado es requerido' }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Empleado"
                  placeholder="Selecciona un empleado"
                  data={employees.map((emp) => ({
                    value: emp.id,
                    label: emp.fullName,
                  }))}
                  error={errors.employeeId?.message}
                  disabled={true}
                  description="El empleado no puede ser modificado una vez abierto el modal"
                />
              )}
            />

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Tipo de franja horaria"
                  data={[
                    { value: 'dayOfWeek', label: 'Día de la Semana (Recurrente)' },
                    { value: 'date', label: 'Fecha Específica' },
                  ]}
                />
              )}
            />

            {type === 'date' ? (
              <Box>
                <Text size="sm" fw={500} mb={5}>
                  Fecha Específica
                </Text>
                <Controller
                  name="date"
                  control={control}
                  rules={{
                    required: type === 'date' ? 'La fecha es requerida' : false,
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={classes.dateInput}
                      required={type === 'date'}
                    />
                  )}
                />
                {errors.date && (
                  <Text size="xs" c="red" mt={5}>
                    {errors.date.message}
                  </Text>
                )}
              </Box>
            ) : (
              <Controller
                name="dayOfWeek"
                control={control}
                rules={{
                  required: type === 'dayOfWeek' ? 'El día de la semana es requerido' : false,
                }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Día de la Semana"
                    placeholder="Selecciona un día"
                    data={DAYS_OF_WEEK}
                    error={errors.dayOfWeek?.message}
                  />
                )}
              />
            )}

            <Box className={classes.formRow}>
              <Controller
                name="startTime"
                control={control}
                rules={{
                  required: 'La hora de inicio es requerida',
                  min: { value: 0, message: 'Mínimo 0' },
                  max: { value: 23, message: 'Máximo 23' },
                }}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    label="Hora de Inicio"
                    placeholder="9"
                    min={0}
                    max={23}
                    error={errors.startTime?.message}
                    style={{ flex: 1 }}
                  />
                )}
              />

              <Controller
                name="endTime"
                control={control}
                rules={{
                  required: 'La hora de fin es requerida',
                  min: { value: 0, message: 'Mínimo 0' },
                  max: { value: 23, message: 'Máximo 23' },
                }}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    label="Hora de Fin"
                    placeholder="10"
                    min={0}
                    max={23}
                    error={errors.endTime?.message}
                    style={{ flex: 1 }}
                  />
                )}
              />
            </Box>

            <Controller
              name="isActive"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Switch
                  {...field}
                  checked={value}
                  onChange={(e) => onChange(e.currentTarget.checked)}
                  label="Activar inmediatamente"
                  description="Si está activo, aparecerá como disponible para reservar"
                />
              )}
            />

            <Box>
              <Text size="sm" fw={500} mb={5}>
                Servicios disponibles en este horario <Text component="span" c="red">*</Text>
              </Text>
              <Text size="xs" c="dimmed" mb="sm">
                Selecciona al menos un servicio. Puedes buscar por nombre.
              </Text>
              
              {isLoadingEmployeeServices ? (
                <Center py="xl">
                  <Stack gap="md" align="center">
                    <Skeleton height={40} width="100%" />
                    <Skeleton height={40} width="100%" />
                    <Skeleton height={40} width="100%" />
                  </Stack>
                </Center>
              ) : employeeServices.length === 0 ? (
                <Alert color="yellow" title="Sin servicios asignados">
                  Este empleado no tiene servicios asignados. Por favor, asigna servicios al empleado primero.
                </Alert>
              ) : (
                <>
                  <TextInput
                    placeholder="Buscar servicio por nombre..."
                    value={serviceSearchFilter}
                    onChange={(e) => setServiceSearchFilter(e.currentTarget.value)}
                    mb="md"
                    size="sm"
                  />
                  
                  <ScrollArea h={300}>
                    <Stack gap="xs">
                      <Controller
                        name="serviceIds"
                        control={control}
                        rules={{
                          required: 'Debes seleccionar al menos un servicio',
                          validate: (value) => value.length > 0 || 'Debes seleccionar al menos un servicio',
                        }}
                        render={({ field: { value = [], onChange } }) => (
                          <>
                            {filteredEmployeeServices.length === 0 ? (
                              <Center py="xl">
                                <Text c="dimmed" size="sm">
                                  No se encontraron servicios con ese nombre
                                </Text>
                              </Center>
                            ) : (
                              filteredEmployeeServices.map((service) => (
                                <Box key={service.id} className={classes.serviceCheckboxCard}>
                                  <Checkbox
                                    label={
                                      <Box>
                                        <Text fw={500} size="sm">
                                          {service.name}
                                        </Text>
                                        <Group gap="xs" mt={4}>
                                          <Badge color="pink" variant="light" size="sm">
                                            ${service.price.toLocaleString('es-AR')}
                                          </Badge>
                                          <Badge color="blue" variant="light" size="sm">
                                            {service.duration} min
                                          </Badge>
                                        </Group>
                                      </Box>
                                    }
                                    checked={value.includes(service.id)}
                                    onChange={() => {
                                      const newValue = handleServiceToggle(service.id, value);
                                      onChange(newValue);
                                    }}
                                  />
                                </Box>
                              ))
                            )}
                          </>
                        )}
                      />
                    </Stack>
                  </ScrollArea>
                  
                  {errors.serviceIds && (
                    <Text size="xs" c="red" mt={5}>
                      {errors.serviceIds.message}
                    </Text>
                  )}
                  
                  {selectedServiceIds.length > 0 && (
                    <Text size="xs" c="dimmed" mt="sm">
                      {selectedServiceIds.length} servicio{selectedServiceIds.length !== 1 ? 's' : ''} seleccionado{selectedServiceIds.length !== 1 ? 's' : ''}
                    </Text>
                  )}
                </>
              )}
            </Box>

            <Divider my="md" />
            
            <Box className={classes.modalActions}>
              <Button variant="outline" color="gray" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                color="pink" 
                loading={isSubmitting}
                disabled={selectedServiceIds.length === 0 || isLoadingEmployeeServices}
              >
                {editingTimeSlot 
                  ? 'Guardar Cambios' 
                  : isCopying 
                    ? 'Copiar Franja Horaria' 
                    : 'Crear Franja Horaria'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Modal>

      {/* Modal Delete Confirmation */}
      <ConfirmationModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Franja Horaria"
        message={`¿Estás seguro de que deseas eliminar esta franja horaria? Esta acción no se puede deshacer.`}
        confirmationWord="eliminar"
        confirmButtonText="Eliminar Franja Horaria"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
    </>
  );
}

