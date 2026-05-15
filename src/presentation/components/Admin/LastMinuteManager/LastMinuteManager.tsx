'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Button,
  Modal,
  TextInput,
  NumberInput,
  Stack,
  Box,
  Skeleton,
  Badge,
  Group,
  Text,
  Checkbox,
  ScrollArea,
  Center,
  Divider,
  SimpleGrid,
  Select,
  Pagination,
} from '@mantine/core';
import { IconPencil, IconTrash, IconFlame } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { DatePickerInput, TimeInput, DatesProvider } from '@mantine/dates';
import { useForm, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { LastMinuteBookingService, ServiceService } from '@/infrastructure/http';
import type {
  LastMinuteBooking,
  CreateLastMinuteBookingDto,
  LmbStatus,
  ServiceEntity,
} from '@/infrastructure/http';
import { ConfirmationModal } from '@/presentation/components';
import classes from './LastMinuteManager.module.css';

interface FormData {
  date: Date | string | null; // Mantine 8 DatePickerInput emite string "YYYY-MM-DD"
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  discountPercent: number;
  serviceIds: string[];
  notes: string;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Acepta Date o string (Mantine 8 DatePickerInput emite "YYYY-MM-DD")
 * y devuelve un Date local (no UTC).
 */
function toDate(value: Date | string | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const [y, m, d] = value.split('T')[0].split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
  return null;
}

/**
 * Combina date + "HH:MM" en un ISO con offset GMT-3.
 */
function toGmt3Iso(date: Date | string, hhmm: string): string {
  const d = toDate(date);
  if (!d) throw new Error('Fecha inválida');
  const [h, m] = hhmm.split(':').map(Number);
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${mo}-${day}T${pad2(h)}:${pad2(m)}:00-03:00`;
}

const AR_TZ = 'America/Argentina/Buenos_Aires';

function formatLocalDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('es-AR', {
    timeZone: AR_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('es-AR', {
    timeZone: AR_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return { date, time };
}

const STATUS_LABEL: Record<LmbStatus, string> = {
  PENDING: 'Pendiente',
  CONSUMED: 'Consumido',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLOR: Record<LmbStatus, string> = {
  PENDING: 'orange',
  CONSUMED: 'green',
  EXPIRED: 'gray',
  CANCELLED: 'red',
};

export function LastMinuteManager() {
  const [lmbs, setLmbs] = useState<LastMinuteBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isLoading, setIsLoading] = useState(true);

  const [filterDateFrom, setFilterDateFrom] = useState<Date | string | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<Date | string | null>(null);
  const [filterStatus, setFilterStatus] = useState<LmbStatus | ''>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<LastMinuteBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<LastMinuteBooking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [allServices, setAllServices] = useState<ServiceEntity[]>([]);
  const [serviceSearchFilter, setServiceSearchFilter] = useState('');

  const isMobile = useMediaQuery('(max-width: 767px)');

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      date: null,
      startTime: '14:00',
      endTime: '15:00',
      discountPercent: 20,
      serviceIds: [],
      notes: '',
    },
  });

  const selectedServiceIds = watch('serviceIds') || [];

  const fetchLmbs = useCallback(async () => {
    try {
      setIsLoading(true);
      const fmt = (raw: Date | string | null) => {
        const d = toDate(raw);
        if (!d) return undefined;
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      };
      const res = await LastMinuteBookingService.getAll({
        dateFrom: fmt(filterDateFrom),
        dateTo: fmt(filterDateTo),
        status: filterStatus || undefined,
        page,
        limit,
      });
      setLmbs(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error('[LastMinuteManager] fetch error', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterDateFrom, filterDateTo, filterStatus, page, limit]);

  const fetchServices = useCallback(async () => {
    try {
      const services = await ServiceService.getAllWithoutPagination();
      setAllServices(services);
    } catch (error) {
      console.error('[LastMinuteManager] services fetch error', error);
    }
  }, []);

  useEffect(() => {
    fetchLmbs();
  }, [fetchLmbs]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const eligibleServices = useMemo(
    () => allServices.filter((s) => (s as any).isLmbEligible),
    [allServices],
  );

  const filteredServices = useMemo(() => {
    return allServices
      .filter((s) => s.name.toLowerCase().includes(serviceSearchFilter.toLowerCase()))
      .sort((a, b) => {
        const aSel = selectedServiceIds.includes(a.id);
        const bSel = selectedServiceIds.includes(b.id);
        if (aSel && !bSel) return -1;
        if (!aSel && bSel) return 1;
        const aEl = (a as any).isLmbEligible ? 0 : 1;
        const bEl = (b as any).isLmbEligible ? 0 : 1;
        return aEl - bEl;
      });
  }, [allServices, serviceSearchFilter, selectedServiceIds]);

  const handleServiceToggle = (id: string, current: string[]) => {
    if (current.includes(id)) return current.filter((x) => x !== id);
    return [...current, id];
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setServiceSearchFilter('');
    reset({
      date: null,
      startTime: '14:00',
      endTime: '15:00',
      discountPercent: 20,
      serviceIds: eligibleServices.map((s) => s.id),
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lmb: LastMinuteBooking) => {
    setEditing(lmb);
    setServiceSearchFilter('');
    const startFmt = formatLocalDateTime(lmb.startTime);
    const endFmt = formatLocalDateTime(lmb.endTime);
    // date como "YYYY-MM-DD" para Mantine 8
    const [dd, mm, yyyy] = startFmt.date.split('/');
    reset({
      date: `${yyyy}-${mm}-${dd}`,
      startTime: startFmt.time,
      endTime: endFmt.time,
      discountPercent: lmb.discountPercent,
      serviceIds: lmb.services.map((s) => s.id),
      notes: lmb.notes ?? '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setServiceSearchFilter('');
  };

  const onSubmit = async (data: FormData) => {
    if (!data.date) {
      notifications.show({ title: 'Error', message: 'La fecha es requerida.', color: 'red' });
      return;
    }
    if (data.serviceIds.length === 0) {
      notifications.show({ title: 'Error', message: 'Seleccioná al menos un servicio.', color: 'red' });
      return;
    }
    if (data.endTime <= data.startTime) {
      notifications.show({
        title: 'Error',
        message: 'La hora de fin debe ser posterior a la de inicio.',
        color: 'red',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateLastMinuteBookingDto = {
        startTime: toGmt3Iso(data.date, data.startTime),
        endTime: toGmt3Iso(data.date, data.endTime),
        discountPercent: Number(data.discountPercent),
        serviceIds: data.serviceIds,
        notes: data.notes || undefined,
      };

      if (editing) {
        await LastMinuteBookingService.update(editing.id, payload);
        notifications.show({ title: 'LMB actualizado', message: 'Cambios guardados.', color: 'green' });
      } else {
        await LastMinuteBookingService.create(payload);
        notifications.show({ title: 'LMB creado', message: 'Slot creado correctamente.', color: 'green' });
      }
      handleCloseModal();
      fetchLmbs();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      notifications.show({
        title: 'Error',
        message: Array.isArray(msg) ? msg.join(', ') : msg || 'Error al guardar el LMB.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      setIsDeleting(true);
      await LastMinuteBookingService.delete(toDelete.id);
      notifications.show({ title: 'LMB eliminado', message: 'Slot eliminado.', color: 'green' });
      setDeleteModalOpen(false);
      setToDelete(null);
      fetchLmbs();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      notifications.show({
        title: 'No se puede eliminar',
        message: Array.isArray(msg) ? msg.join(', ') : msg || 'Error al eliminar.',
        color: 'orange',
      });
      setDeleteModalOpen(false);
      setToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Box className={classes.container}>
      <div className={classes.header}>
        <h2 className={classes.title}>
          <IconFlame size={20} style={{ color: '#ea580c', verticalAlign: 'middle', marginRight: 6 }} />
          Last Minute Bookings
        </h2>
        <Button
          onClick={handleOpenCreate}
          variant="filled"
          style={{ backgroundColor: '#ea580c', color: 'white', border: 'none' }}
        >
          + Nuevo LMB
        </Button>
      </div>

      {/* Filtros */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="md">
        <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
          <DatePickerInput
            label="Desde"
            placeholder="DD/MM/AAAA"
            value={filterDateFrom as any}
            onChange={(d) => { setFilterDateFrom(d as Date | string | null); setPage(1); }}
            valueFormat="DD/MM/YYYY"
            clearable
          />
          <DatePickerInput
            label="Hasta"
            placeholder="DD/MM/AAAA"
            value={filterDateTo as any}
            onChange={(d) => { setFilterDateTo(d as Date | string | null); setPage(1); }}
            valueFormat="DD/MM/YYYY"
            clearable
          />
        </DatesProvider>
        <Select
          label="Estado"
          placeholder="Todos"
          value={filterStatus || null}
          onChange={(v) => { setFilterStatus((v as LmbStatus) || ''); setPage(1); }}
          data={[
            { value: 'PENDING', label: 'Pendiente' },
            { value: 'CONSUMED', label: 'Consumido' },
            { value: 'EXPIRED', label: 'Expirado' },
            { value: 'CANCELLED', label: 'Cancelado' },
          ]}
          clearable
        />
      </SimpleGrid>

      {isLoading ? (
        <Stack gap="sm">{[1, 2, 3].map((i) => <Skeleton key={i} height={50} />)}</Stack>
      ) : lmbs.length === 0 ? (
        <div className={classes.emptyState}>No hay LMBs para los filtros aplicados</div>
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Servicios</th>
                <th>Descuento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lmbs.map((lmb) => {
                const start = formatLocalDateTime(lmb.startTime);
                const end = formatLocalDateTime(lmb.endTime);
                return (
                  <tr key={lmb.id}>
                    <td>{start.date}</td>
                    <td>{start.time} — {end.time}</td>
                    <td>
                      {lmb.services.map((s) => (
                        <span key={s.id} className={classes.serviceBadge}>{s.name}</span>
                      ))}
                    </td>
                    <td><span className={classes.discountBadge}>{lmb.discountPercent}%</span></td>
                    <td>
                      <Badge color={STATUS_COLOR[lmb.status]} variant="light">
                        {STATUS_LABEL[lmb.status]}
                      </Badge>
                    </td>
                    <td>
                      <div className={classes.actions}>
                        {lmb.status === 'PENDING' && (
                          <>
                            <button className={classes.editBtn} onClick={() => handleOpenEdit(lmb)}>
                              <IconPencil size={13} strokeWidth={1.8} />
                              Editar
                            </button>
                            <button
                              className={classes.deleteBtn}
                              onClick={() => { setToDelete(lmb); setDeleteModalOpen(true); }}
                            >
                              <IconTrash size={13} strokeWidth={1.8} />
                              Eliminar
                            </button>
                          </>
                        )}
                        {lmb.status === 'CONSUMED' && lmb.booking && (
                          <Text size="xs" c="dimmed">
                            Reserva: {lmb.booking.bookingCode ?? lmb.booking.id.slice(0, 8)}
                          </Text>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      )}

      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Group>
      )}

      {/* Create/Edit Modal */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editing ? 'Editar Last Minute Booking' : 'Nuevo Last Minute Booking'}
        size="xl"
        fullScreen={isMobile}
        centered={!isMobile}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Controller
                name="date"
                control={control}
                rules={{ required: 'La fecha es requerida' }}
                render={({ field }) => (
                  <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
                    <DatePickerInput
                      label="* Fecha"
                      placeholder="DD/MM/AAAA"
                      value={field.value}
                      onChange={field.onChange}
                      valueFormat="DD/MM/YYYY"
                      error={errors.date?.message}
                    />
                  </DatesProvider>
                )}
              />
              <Controller
                name="startTime"
                control={control}
                rules={{ required: 'Hora inicio requerida' }}
                render={({ field }) => (
                  <TimeInput
                    label="* Hora inicio"
                    value={field.value}
                    onChange={(e) => field.onChange(e.currentTarget.value)}
                    error={errors.startTime?.message}
                  />
                )}
              />
              <Controller
                name="endTime"
                control={control}
                rules={{ required: 'Hora fin requerida' }}
                render={({ field }) => (
                  <TimeInput
                    label="* Hora fin"
                    value={field.value}
                    onChange={(e) => field.onChange(e.currentTarget.value)}
                    error={errors.endTime?.message}
                  />
                )}
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Controller
                name="discountPercent"
                control={control}
                rules={{ required: 'El descuento es requerido' }}
                render={({ field }) => (
                  <NumberInput
                    label="* Descuento (%)"
                    placeholder="20"
                    min={1}
                    max={100}
                    suffix="%"
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    error={errors.discountPercent?.message}
                  />
                )}
              />
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Notas (opcional)"
                    placeholder="Para uso interno"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </SimpleGrid>

            <Divider />

            <Box>
              <Text size="sm" fw={600} mb="xs">
                Servicios eligibles dentro de este LMB *
              </Text>
              <Text size="xs" c="dimmed" mb="sm">
                Por defecto se pre-seleccionan los marcados como &quot;eligibles para LMB&quot; globalmente. Podés agregar o quitar.
              </Text>

              <TextInput
                placeholder="Buscar servicio por nombre..."
                value={serviceSearchFilter}
                onChange={(e) => setServiceSearchFilter(e.currentTarget.value)}
                mb="md"
                size="sm"
              />

              <ScrollArea h={280}>
                <Stack gap="xs">
                  <Controller
                    name="serviceIds"
                    control={control}
                    rules={{
                      validate: (value) => value.length > 0 || 'Seleccioná al menos un servicio',
                    }}
                    render={({ field: { value = [], onChange } }) => (
                      <>
                        {filteredServices.length === 0 ? (
                          <Center py="xl">
                            <Text c="dimmed" size="sm">No se encontraron servicios</Text>
                          </Center>
                        ) : (
                          filteredServices.map((service) => (
                            <Box key={service.id} className={classes.serviceCheckboxCard}>
                              <Checkbox
                                label={
                                  <Box>
                                    <Group gap="xs">
                                      <Text fw={500} size="sm">{service.name}</Text>
                                      {(service as any).isLmbEligible && (
                                        <Badge color="orange" variant="light" size="xs">
                                          Eligible LMB
                                        </Badge>
                                      )}
                                    </Group>
                                    <Group gap="xs" mt={4}>
                                      <Badge color="gray" variant="light" size="sm">
                                        ${Number(service.price).toLocaleString('es-AR')}
                                      </Badge>
                                      <Badge color="gray" variant="light" size="sm">
                                        {service.duration} min
                                      </Badge>
                                    </Group>
                                  </Box>
                                }
                                checked={value.includes(service.id)}
                                onChange={() => onChange(handleServiceToggle(service.id, value))}
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
                <Text size="xs" c="red" mt={5}>{errors.serviceIds.message}</Text>
              )}
              {selectedServiceIds.length > 0 && (
                <Text size="xs" c="dimmed" mt="sm">
                  {selectedServiceIds.length} servicio{selectedServiceIds.length !== 1 ? 's' : ''} seleccionado{selectedServiceIds.length !== 1 ? 's' : ''}
                </Text>
              )}
            </Box>

            <Divider />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={handleCloseModal}>Cancelar</Button>
              <Button
                type="submit"
                loading={isSubmitting}
                variant="filled"
                style={{ backgroundColor: '#ea580c', color: 'white', border: 'none' }}
              >
                {editing ? 'Guardar Cambios' : 'Crear LMB'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ConfirmationModal
        opened={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setToDelete(null); }}
        onConfirm={handleDelete}
        title="Eliminar Last Minute Booking"
        message="¿Estás seguro de eliminar este LMB? Solo se pueden eliminar los que están pendientes."
        confirmButtonText="Eliminar"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
    </Box>
  );
}
