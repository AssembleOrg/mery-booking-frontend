'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Button,
  Modal,
  TextInput,
  NumberInput,
  Switch,
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
} from '@mantine/core';
import {
  IconPencil,
  IconTrash,
  IconPlayerPause,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { useForm, Controller } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { CouponService, ServiceService } from '@/infrastructure/http';
import type { Coupon, CreateCouponDto, ServiceEntity } from '@/infrastructure/http';
import { ConfirmationModal } from '@/presentation/components';
import classes from './CouponsManager.module.css';

function formatDateToYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface FormData {
  code: string;
  discountPercent: number;
  validFrom: Date | null;
  validTo: Date | null;
  maxUses: number | '';
  serviceIds: string[];
  isActive: boolean;
}

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allServices, setAllServices] = useState<ServiceEntity[]>([]);
  const [serviceSearchFilter, setServiceSearchFilter] = useState('');
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      code: '',
      discountPercent: 10,
      validFrom: null,
      validTo: null,
      maxUses: '',
      serviceIds: [],
      isActive: true,
    },
  });

  const discountPercent = watch('discountPercent');
  const validFrom = watch('validFrom');
  const validTo = watch('validTo');
  const maxUses = watch('maxUses');
  const selectedServiceIds = watch('serviceIds') || [];

  useEffect(() => {
    if (!codeManuallyEdited && discountPercent) {
      setValue('code', `mery-${discountPercent}`);
    }
  }, [discountPercent, codeManuallyEdited, setValue]);

  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await CouponService.getAll();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const services = await ServiceService.getAllWithoutPagination();
      setAllServices(services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchServices();
  }, [fetchCoupons, fetchServices]);

  // Filtrar y ordenar servicios: seleccionados primero, luego por nombre
  const filteredServices = useMemo(() => {
    return allServices
      .filter((s) =>
        s.name.toLowerCase().includes(serviceSearchFilter.toLowerCase()),
      )
      .sort((a, b) => {
        const aSelected = selectedServiceIds.includes(a.id);
        const bSelected = selectedServiceIds.includes(b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });
  }, [allServices, serviceSearchFilter, selectedServiceIds]);

  const handleServiceToggle = (serviceId: string, currentIds: string[]) => {
    if (currentIds.includes(serviceId)) {
      return currentIds.filter((id) => id !== serviceId);
    }
    return [...currentIds, serviceId];
  };

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCodeManuallyEdited(false);
    setServiceSearchFilter('');
    reset({
      code: 'mery-10',
      discountPercent: 10,
      validFrom: null,
      validTo: null,
      maxUses: '',
      serviceIds: [],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCodeManuallyEdited(true);
    setServiceSearchFilter('');
    reset({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      validFrom: coupon.validFrom ? parseLocalDate(coupon.validFrom) : null,
      validTo: coupon.validTo ? parseLocalDate(coupon.validTo) : null,
      maxUses: coupon.maxUses ?? '',
      serviceIds: coupon.services.map((s) => s.id),
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setCodeManuallyEdited(false);
    setServiceSearchFilter('');
  };

  const onSubmit = async (data: FormData) => {
    if (!data.validFrom && !data.validTo && !data.maxUses) {
      notifications.show({
        title: 'Error',
        message: 'Debe establecer al menos una restricción: fechas de validez o cantidad máxima de usos.',
        color: 'red',
      });
      return;
    }

    if (data.serviceIds.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Debe seleccionar al menos un servicio.',
        color: 'red',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const validFrom = data.validFrom instanceof Date ? formatDateToYMD(data.validFrom) : undefined;
      const validTo = data.validTo instanceof Date ? formatDateToYMD(data.validTo) : undefined;

      const payload: CreateCouponDto = {
        code: data.code,
        discountPercent: Number(data.discountPercent),
        serviceIds: data.serviceIds,
        isActive: data.isActive,
        ...(validFrom && { validFrom }),
        ...(validTo && { validTo }),
        ...(data.maxUses && { maxUses: Number(data.maxUses) }),
      };

      if (editingCoupon) {
        await CouponService.update(editingCoupon.id, payload);
        notifications.show({ title: 'Cupón actualizado', message: 'El cupón se actualizó correctamente.', color: 'green' });
      } else {
        await CouponService.create(payload);
        notifications.show({ title: 'Cupón creado', message: 'El cupón se creó correctamente.', color: 'green' });
      }

      handleCloseModal();
      fetchCoupons();
    } catch (error: any) {
      console.error('[CouponsManager] Error saving coupon:', error);
      const msg = error?.response?.data?.message;
      notifications.show({
        title: 'Error',
        message: Array.isArray(msg) ? msg.join(', ') : msg || 'Error al guardar el cupón.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await CouponService.update(coupon.id, { isActive: !coupon.isActive });
      notifications.show({
        title: coupon.isActive ? 'Cupón desactivado' : 'Cupón activado',
        message: coupon.isActive ? 'El cupón ya no podrá ser utilizado.' : 'El cupón está activo nuevamente.',
        color: 'green',
      });
      fetchCoupons();
    } catch (error: any) {
      notifications.show({ title: 'Error', message: error?.response?.data?.message || 'Error al cambiar estado.', color: 'red' });
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      setIsDeleting(true);
      await CouponService.delete(couponToDelete.id);
      notifications.show({ title: 'Cupón eliminado', message: 'El cupón se eliminó correctamente.', color: 'green' });
      setDeleteModalOpen(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      notifications.show({
        title: 'No se puede eliminar',
        message: Array.isArray(msg) ? msg.join(', ') : msg || 'Error al eliminar el cupón.',
        color: 'orange',
      });
      setDeleteModalOpen(false);
      setCouponToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Box className={classes.container}>
      <div className={classes.header}>
        <h2 className={classes.title}>Cupones de Descuento</h2>
        <Button
          onClick={handleOpenCreate}
          variant="filled"
          style={{ backgroundColor: 'var(--mg-pink)', color: 'white', border: 'none' }}
        >
          + Nuevo Cupón
        </Button>
      </div>

      {isLoading ? (
        <Stack gap="sm">
          {[1, 2, 3].map((i) => <Skeleton key={i} height={50} />)}
        </Stack>
      ) : coupons.length === 0 ? (
        <div className={classes.emptyState}>No hay cupones creados</div>
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descuento</th>
                <th>Servicios</th>
                <th>Vigencia</th>
                <th>Usos</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td><strong>{coupon.code}</strong></td>
                  <td><span className={classes.discountBadge}>{coupon.discountPercent}%</span></td>
                  <td>
                    {coupon.services.map((s) => (
                      <span key={s.id} className={classes.serviceBadge}>{s.name}</span>
                    ))}
                  </td>
                  <td>
                    {coupon.validFrom || coupon.validTo
                      ? `${formatDateDisplay(coupon.validFrom)} — ${formatDateDisplay(coupon.validTo)}`
                      : '—'}
                  </td>
                  <td className={classes.usesCell}>
                    {coupon.currentUses}{coupon.maxUses != null ? ` / ${coupon.maxUses}` : ' / \u221E'}
                  </td>
                  <td>
                    {coupon.isActive ? (
                      <span className={classes.statusActive}>
                        <span className={classes.statusDot} />
                        Activo
                      </span>
                    ) : (
                      <span className={classes.statusInactive}>
                        <span className={classes.statusDot} />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={classes.actions}>
                      <button className={classes.editBtn} onClick={() => handleOpenEdit(coupon)}>
                        <IconPencil size={13} strokeWidth={1.8} />
                        Editar
                      </button>
                      {coupon.currentUses > 0 ? (
                        <button
                          className={coupon.isActive ? classes.deactivateBtn : classes.activateBtn}
                          onClick={() => handleToggleActive(coupon)}
                        >
                          {coupon.isActive
                            ? <><IconPlayerPause size={13} strokeWidth={1.8} />Desactivar</>
                            : <><IconPlayerPlay size={13} strokeWidth={1.8} />Activar</>}
                        </button>
                      ) : (
                        <button className={classes.deleteBtn} onClick={() => { setCouponToDelete(coupon); setDeleteModalOpen(true); }}>
                          <IconTrash size={13} strokeWidth={1.8} />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {/* Create/Edit Modal */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
        size="xl"
        fullScreen={isMobile}
        centered={!isMobile}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Controller
                name="discountPercent"
                control={control}
                rules={{ required: 'El porcentaje es requerido' }}
                render={({ field }) => (
                  <NumberInput
                    label="* Porcentaje de descuento"
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
                name="code"
                control={control}
                rules={{ required: 'El código es requerido' }}
                render={({ field }) => (
                  <TextInput
                    label="* Código del cupón"
                    placeholder="mery-20"
                    description="Se auto-genera con el %, pero podés personalizarlo"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      setCodeManuallyEdited(true);
                    }}
                    error={errors.code?.message}
                  />
                )}
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Controller
                name="validFrom"
                control={control}
                render={({ field }) => (
                  <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
                    <DatePickerInput
                      label="Válido desde"
                      placeholder="DD/MM/AAAA"
                      value={field.value}
                      onChange={field.onChange}
                      valueFormat="DD/MM/YYYY"
                      clearable
                    />
                  </DatesProvider>
                )}
              />
              <Controller
                name="validTo"
                control={control}
                render={({ field }) => (
                  <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
                    <DatePickerInput
                      label="Válido hasta"
                      placeholder="DD/MM/AAAA"
                      value={field.value}
                      onChange={field.onChange}
                      valueFormat="DD/MM/YYYY"
                      clearable
                    />
                  </DatesProvider>
                )}
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Controller
                name="maxUses"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label="Cantidad máxima de usos"
                    description="Dejar vacío para usos ilimitados"
                    placeholder="50"
                    min={1}
                    value={field.value === '' ? '' : field.value}
                    onChange={(val) => field.onChange(val === '' ? '' : val)}
                  />
                )}
              />

              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    label="Cupón activo"
                    description="Si está activo, los clientes podrán usarlo"
                    checked={field.value}
                    onChange={field.onChange}
                    mt="xl"
                  />
                )}
              />
            </SimpleGrid>

            {!validFrom && !validTo && !maxUses && (
              <Text size="xs" c="red">
                Debe establecer al menos una restricción: fechas de validez o cantidad máxima de usos.
              </Text>
            )}

            <Divider />

            {/* Service selector - same style as TimeSlotsManager */}
            <Box>
              <Text size="sm" fw={600} mb="xs">
                Servicios donde aplica el cupón *
              </Text>
              <Text size="xs" c="dimmed" mb="sm">
                Seleccioná los servicios en los que se podrá usar este cupón. Podés buscar por nombre.
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
                      required: 'Debes seleccionar al menos un servicio',
                      validate: (value) => value.length > 0 || 'Debes seleccionar al menos un servicio',
                    }}
                    render={({ field: { value = [], onChange } }) => (
                      <>
                        {filteredServices.length === 0 ? (
                          <Center py="xl">
                            <Text c="dimmed" size="sm">
                              No se encontraron servicios con ese nombre
                            </Text>
                          </Center>
                        ) : (
                          filteredServices.map((service) => (
                            <Box key={service.id} className={classes.serviceCheckboxCard}>
                              <Checkbox
                                label={
                                  <Box>
                                    <Text fw={500} size="sm">
                                      {service.name}
                                    </Text>
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
            </Box>

            <Divider />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={handleCloseModal}>Cancelar</Button>
              <Button
                type="submit"
                loading={isSubmitting}
                variant="filled"
                style={{ backgroundColor: 'var(--mg-pink)', color: 'white', border: 'none' }}
              >
                {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        opened={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setCouponToDelete(null); }}
        onConfirm={handleDelete}
        title="Eliminar Cupón"
        message={`¿Estás seguro de eliminar el cupón "${couponToDelete?.code}"?`}
        confirmButtonText="Eliminar"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
    </Box>
  );
}
