'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Stack, Text, Modal, TextInput, Box, Skeleton, Center, NumberInput, Checkbox, Textarea, Select, Group } from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { ServiceService, CategoryService } from '@/infrastructure/http';
import type { ServiceEntity, CreateServiceDto, Category } from '@/infrastructure/http';
import { ConfirmationModal } from '@/presentation/components';
import classes from './ServicesManager.module.css';

interface FormData {
  name: string;
  description: string;
  categoryId: string;
  showOnSite: boolean;
  duration: number;
  price: number;
  minQuantity: number;
  maxQuantity: number;
  urlImage: string;
}

export function ServicesManager() {
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceEntity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      // Primero cargar categorías
      const categoriesResponse = await CategoryService.getAll();
      
      // Validar que la respuesta tenga la estructura esperada
      if (!categoriesResponse || !categoriesResponse.data) {
        console.error('Invalid categories response:', categoriesResponse);
        setCategories([]);
        return;
      }
      
      const categoriesList = categoriesResponse.data;
      setCategories(categoriesList);

      // Buscar categoría "Paramedical Tattoo" (case insensitive)
      const paramedicalCategory = categoriesList.find(
        (cat) => cat.name.toLowerCase().includes('paramedical')
      );

      // Setear como default
      const defaultCategoryId = paramedicalCategory?.id || '';
      setSelectedCategoryId(defaultCategoryId);

      // Cargar servicios con el filtro (siempre hacer fetch)
      // Si hay categoría paramedical, usar su ID, sino undefined (todos los servicios)
      const categoryFilter = defaultCategoryId ? defaultCategoryId : undefined;
      
      const servicesResponse = await ServiceService.getAll(
        undefined,
        undefined,
        categoryFilter
      );
      
      // Validar que la respuesta tenga la estructura esperada
      if (!servicesResponse || !servicesResponse.data) {
        console.error('Invalid services response:', servicesResponse);
        setServices([]);
        return;
      }
      
      setServices(servicesResponse.data);
    } catch (error) {
      console.error('Error initializing data:', error);
      setCategories([]);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async (categoryId?: string) => {
    try {
      setIsLoading(true);
      const categoryFilter = categoryId || undefined;
      const response = await ServiceService.getAll(undefined, undefined, categoryFilter);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (value: string | null) => {
    const categoryId = value || '';
    setSelectedCategoryId(categoryId);
    fetchServices(categoryId);
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    reset({
      name: '',
      description: '',
      categoryId: '',
      showOnSite: true,
      duration: 60,
      price: 0,
      minQuantity: 1,
      maxQuantity: 1,
      urlImage: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceEntity) => {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description || '',
      categoryId: service.categoryId,
      showOnSite: service.showOnSite,
      duration: service.duration,
      price: service.price,
      minQuantity: service.minQuantity,
      maxQuantity: service.maxQuantity,
      urlImage: service.urlImage || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      const serviceData = {
        ...data,
        description: data.description || undefined,
        urlImage: data.urlImage || undefined,
      };

      if (editingService) {
        await ServiceService.update(editingService.id, serviceData);
      } else {
        await ServiceService.create(serviceData as CreateServiceDto);
      }

      await fetchServices(selectedCategoryId);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (service: ServiceEntity) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      setIsDeleting(true);
      await ServiceService.delete(serviceToDelete.id);
      await fetchServices(selectedCategoryId);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  const renderSkeletonRows = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Table.Tr key={index}>
          <Table.Td><Skeleton height={20} /></Table.Td>
          <Table.Td><Skeleton height={20} /></Table.Td>
          <Table.Td><Skeleton height={20} width={80} /></Table.Td>
          <Table.Td><Skeleton height={20} width={100} /></Table.Td>
          <Table.Td><Skeleton height={20} width={40} /></Table.Td>
          <Table.Td>
            <Group gap="xs">
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
          <Text className={classes.title}>Gestión de Servicios</Text>
          <Button
            color="pink"
            onClick={handleOpenCreate}
            className={classes.createButton}
          >
            + Nuevo Servicio
          </Button>
        </Box>

        {/* Filtro de Categoría */}
        <Box className={classes.filterContainer}>
          <Select
            label="Filtrar por categoría"
            placeholder="Todas las categorías"
            data={[
              { value: '', label: 'Todas las categorías' },
              ...categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
            ]}
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            className={classes.filterSelect}
            clearable
          />
        </Box>

        <Box className={classes.tableContainer}>
          <Table striped highlightOnHover className={classes.table}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Categoría</Table.Th>
                <Table.Th>Duración</Table.Th>
                <Table.Th>Precio</Table.Th>
                <Table.Th>Visible</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                renderSkeletonRows()
              ) : services.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Center py="xl">
                      <Text c="dimmed">
                        {selectedCategoryId
                          ? 'No hay servicios para esta categoría'
                          : 'No hay servicios creados'}
                      </Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                services.map((service) => (
                  <Table.Tr key={service.id}>
                    <Table.Td>{service.name}</Table.Td>
                    <Table.Td>{getCategoryName(service.categoryId)}</Table.Td>
                    <Table.Td>{service.duration} min</Table.Td>
                    <Table.Td>AR${service.price.toLocaleString('es-AR')}</Table.Td>
                    <Table.Td>
                      <Text c={service.showOnSite ? 'green' : 'red'} fw={500}>
                        {service.showOnSite ? 'Sí' : 'No'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Box className={classes.actions}>
                        <Button
                          variant="light"
                          color="blue"
                          size="xs"
                          onClick={() => handleOpenEdit(service)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          onClick={() => handleOpenDelete(service)}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Stack>

      {/* Modal Create/Edit */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        centered
        size="lg"
        classNames={{
          title: classes.modalTitle,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nombre del servicio"
              placeholder="Ej: Corte Clásico"
              {...register('name', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres',
                },
              })}
              error={errors.name?.message}
            />

            <Textarea
              label="Descripción (opcional)"
              placeholder="Descripción del servicio"
              minRows={3}
              {...register('description')}
            />

            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'La categoría es requerida' }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Categoría"
                  placeholder="Selecciona una categoría"
                  data={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  error={errors.categoryId?.message}
                />
              )}
            />

            <Box className={classes.formRow}>
              <Controller
                name="duration"
                control={control}
                rules={{
                  required: 'La duración es requerida',
                  min: { value: 1, message: 'Mínimo 1 minuto' },
                }}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    label="Duración (minutos)"
                    placeholder="60"
                    min={1}
                    error={errors.duration?.message}
                    style={{ flex: 1 }}
                  />
                )}
              />

              <Controller
                name="price"
                control={control}
                rules={{
                  required: 'El precio es requerido',
                  min: { value: 0, message: 'El precio debe ser positivo' },
                }}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    label="Precio (AR$)"
                    placeholder="5000"
                    min={0}
                    decimalScale={2}
                    error={errors.price?.message}
                    style={{ flex: 1 }}
                  />
                )}
              />
            </Box>

            <Box className={classes.formRow}>
              <Controller
                name="minQuantity"
                control={control}
                rules={{
                  required: 'La cantidad mínima es requerida',
                  min: { value: 1, message: 'Mínimo 1' },
                }}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    label="Cantidad Mínima"
                    placeholder="1"
                    min={1}
                    error={errors.minQuantity?.message}
                    style={{ flex: 1 }}
                  />
                )}
              />

              <Controller
                name="maxQuantity"
                control={control}
                rules={{
                  required: 'La cantidad máxima es requerida',
                  min: { value: 1, message: 'Mínimo 1' },
                }}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    label="Cantidad Máxima"
                    placeholder="1"
                    min={1}
                    error={errors.maxQuantity?.message}
                    style={{ flex: 1 }}
                  />
                )}
              />
            </Box>

            <TextInput
              label="URL de Imagen (opcional)"
              placeholder="https://example.com/image.jpg"
              {...register('urlImage')}
            />

            <Controller
              name="showOnSite"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Checkbox
                  {...field}
                  checked={value}
                  onChange={(e) => onChange(e.currentTarget.checked)}
                  label="Mostrar en el sitio web"
                />
              )}
            />

            <Box className={classes.modalActions}>
              <Button
                variant="outline"
                color="gray"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="pink"
                loading={isSubmitting}
              >
                {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
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
        title="Eliminar Servicio"
        message={`¿Estás seguro de que deseas eliminar el servicio "${serviceToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmationWord="eliminar"
        confirmButtonText="Eliminar Servicio"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
    </>
  );
}

