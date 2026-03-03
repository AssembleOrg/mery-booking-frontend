'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button, Modal, TextInput, Box, Skeleton, NumberInput, Checkbox, Textarea, Select, Group } from '@mantine/core';
import { ServiceService, CategoryService } from '@/infrastructure/http';
import type { ServiceEntity, CreateServiceDto, Category } from '@/infrastructure/http';
import { ConfirmationModal } from '@/presentation/components';
import classes from './ServicesManager.module.css';

interface ServiceForm {
  name: string;
  description: string;
  categoryId: string;
  showOnSite: boolean;
  duration: number | string;
  price: number | string;
  minQuantity: number | string;
  maxQuantity: number | string;
  urlImage: string;
}

const DEFAULT_FORM: ServiceForm = {
  name: '',
  description: '',
  categoryId: '',
  showOnSite: true,
  duration: 60,
  price: 0,
  minQuantity: 1,
  maxQuantity: 1,
  urlImage: '',
};

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

  const [form, setForm] = useState<ServiceForm>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ServiceForm, string>>>({});

  const setField = <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const filterCategoryOptions = useMemo(
    () => [
      { value: '', label: 'Todas las categorías' },
      ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [categories]
  );

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      const categoriesResponse = await CategoryService.getAll();

      if (!categoriesResponse || !categoriesResponse.data) {
        console.error('Invalid categories response:', categoriesResponse);
        setCategories([]);
        return;
      }

      const categoriesList = categoriesResponse.data;
      setCategories(categoriesList);

      const paramedicalCategory = categoriesList.find(
        (cat) => cat.name.toLowerCase().includes('paramedical')
      );

      const defaultCategoryId = paramedicalCategory?.id || '';
      setSelectedCategoryId(defaultCategoryId);

      const categoryFilter = defaultCategoryId ? defaultCategoryId : undefined;

      const servicesResponse = await ServiceService.getAll(
        undefined,
        undefined,
        categoryFilter
      );

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
      setServices(response?.data ?? []);
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
    setForm(DEFAULT_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceEntity) => {
    setEditingService(service);
    setForm({
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
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Partial<Record<keyof ServiceForm, string>> = {};
    if (!form.name || form.name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres';
    if (!form.categoryId) errors.categoryId = 'La categoría es requerida';
    if (!form.duration || Number(form.duration) < 1) errors.duration = 'Mínimo 1 minuto';
    if (form.price === '' || Number(form.price) < 0) errors.price = 'El precio debe ser positivo';
    if (!form.minQuantity || Number(form.minQuantity) < 1) errors.minQuantity = 'Mínimo 1';
    if (!form.maxQuantity || Number(form.maxQuantity) < 1) errors.maxQuantity = 'Mínimo 1';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const serviceData = {
        name: form.name,
        description: form.description || undefined,
        categoryId: form.categoryId,
        showOnSite: form.showOnSite,
        duration: Number(form.duration),
        price: Number(form.price),
        minQuantity: Number(form.minQuantity),
        maxQuantity: Number(form.maxQuantity),
        urlImage: form.urlImage || undefined,
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
            label="Categoría"
            placeholder="Todas las categorías"
            data={filterCategoryOptions}
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            className={classes.filterSelect}
            size="sm"
            clearable
          />
        </div>

        <div className={classes.tableWrapper}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Nombre del Servicio</th>
                <th>Duración</th>
                <th>Precio</th>
                <th className={classes.actionsHeader}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                renderSkeletonRows()
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={4} className={classes.emptyCell}>
                    {selectedCategoryId
                      ? 'No hay servicios para esta categoría'
                      : 'No hay servicios creados'}
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className={classes.tableRow}>
                    <td className={classes.tableCell}>
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
        <form onSubmit={handleSubmit}>
          <Group gap="md" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <TextInput
              label="Nombre del servicio"
              placeholder="Ej: Corte Clásico"
              value={form.name}
              onChange={(e) => setField('name', e.currentTarget.value)}
              error={formErrors.name}
            />

            <Textarea
              label="Descripción (opcional)"
              placeholder="Descripción del servicio"
              minRows={3}
              value={form.description}
              onChange={(e) => setField('description', e.currentTarget.value)}
            />

            <Select
              label="Categoría"
              placeholder="Selecciona una categoría"
              value={form.categoryId}
              onChange={(value) => setField('categoryId', value ?? '')}
              data={categoryOptions}
              error={formErrors.categoryId}
            />

            <Box className={classes.formRow}>
              <NumberInput
                label="Duración (minutos)"
                placeholder="60"
                value={form.duration}
                onChange={(value) => setField('duration', value)}
                min={1}
                error={formErrors.duration}
                style={{ flex: 1 }}
              />

              <NumberInput
                label="Precio (AR$)"
                placeholder="5000"
                value={form.price}
                onChange={(value) => setField('price', value)}
                min={0}
                decimalScale={2}
                error={formErrors.price}
                style={{ flex: 1 }}
              />
            </Box>

            <Box className={classes.formRow}>
              <NumberInput
                label="Cantidad Mínima"
                placeholder="1"
                value={form.minQuantity}
                onChange={(value) => setField('minQuantity', value)}
                min={1}
                error={formErrors.minQuantity}
                style={{ flex: 1 }}
              />

              <NumberInput
                label="Cantidad Máxima"
                placeholder="1"
                value={form.maxQuantity}
                onChange={(value) => setField('maxQuantity', value)}
                min={1}
                error={formErrors.maxQuantity}
                style={{ flex: 1 }}
              />
            </Box>

            <TextInput
              label="URL de Imagen (opcional)"
              placeholder="https://example.com/image.jpg"
              value={form.urlImage}
              onChange={(e) => setField('urlImage', e.currentTarget.value)}
            />

            <Checkbox
              label="Mostrar en el sitio web"
              checked={form.showOnSite}
              onChange={(e) => setField('showOnSite', e.currentTarget.checked)}
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
