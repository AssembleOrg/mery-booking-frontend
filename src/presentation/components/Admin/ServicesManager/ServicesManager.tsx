'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, TextInput, Box, Skeleton, Center, NumberInput, Checkbox, Textarea, Select, Group } from '@mantine/core';
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

// Helper function to get icon based on service name
const getServiceIcon = (serviceName: string): string => {
  const name = serviceName.toLowerCase();
  if (name.includes('paramedical') || name.includes('camuflaje')) return 'healing';
  if (name.includes('tattoo') || name.includes('cosmético') || name.includes('microblading')) return 'colorize';
  if (name.includes('ceja') || name.includes('pestaña') || name.includes('estilismo')) return 'visibility';
  if (name.includes('labial') || name.includes('lip')) return 'face_retouching_natural';
  return 'spa';
};

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
        <tr key={index} className={classes.tableRow}>
          <td className={classes.tableCell}>
            <div className={classes.serviceCell}>
              <Skeleton height={40} width={40} circle />
              <Skeleton height={20} width={150} style={{ marginLeft: '1rem' }} />
            </div>
          </td>
          <td className={classes.tableCell}><Skeleton height={20} width={80} /></td>
          <td className={classes.tableCell}><Skeleton height={20} width={100} /></td>
          <td className={classes.tableCell}>
            <Group gap="xs">
              <Skeleton height={28} width={70} />
              <Skeleton height={28} width={70} />
            </Group>
          </td>
        </tr>
      ));
  };

  return (
    <>
      <div className={classes.container}>
        <div className={classes.header}>
          <h2 className={classes.title}>
            <span className="material-icons-round">spa</span>
            Gestión de Servicios
          </h2>
          <Button
            onClick={handleOpenCreate}
            className={classes.createButton}
          >
            <span className="material-icons-round">add</span>
            Nuevo Servicio
          </Button>
        </div>

        {/* Filtro de Categoría */}
        <div className={classes.filterContainer}>
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
        </div>

        <div className={classes.tableWrapper}>
          <table className={classes.table} style={{ backgroundColor: '#ffffff' }}>
            <thead>
              <tr>
                <th>Nombre del Servicio</th>
                <th>Duración</th>
                <th>Precio</th>
                <th className={classes.actionsHeader}>Acciones</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: '#ffffff' }}>
              {isLoading ? (
                renderSkeletonRows()
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={4} className={classes.emptyCell}>
                    <Center py="xl">
                      <span>
                        {selectedCategoryId
                          ? 'No hay servicios para esta categoría'
                          : 'No hay servicios creados'}
                      </span>
                    </Center>
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className={classes.tableRow} style={{ backgroundColor: '#ffffff' }}>
                    <td className={classes.tableCell} style={{ backgroundColor: '#ffffff' }}>
                      <div className={classes.serviceCell}>
                        <div className={classes.iconContainer}>
                          <span className="material-icons-round">{getServiceIcon(service.name)}</span>
                        </div>
                        <div className={classes.serviceInfo}>
                          <div className={classes.serviceName}>{service.name}</div>
                          <div className={classes.serviceDescription}>
                            {service.description || getCategoryName(service.categoryId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={classes.tableCell}>
                      {service.duration} min
                    </td>
                    <td className={classes.tableCell}>
                      ${service.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`${classes.tableCell} ${classes.actionsCell}`}>
                      <div className={classes.actions}>
                        <button
                          className={classes.editButton}
                          onClick={() => handleOpenEdit(service)}
                        >
                          Editar
                        </button>
                        <button
                          className={classes.deleteButton}
                          onClick={() => handleOpenDelete(service)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
          <Group gap="md" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
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
          </Group>
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
