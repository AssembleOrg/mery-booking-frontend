'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, TextInput, Box, Skeleton, Group } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { CategoryService } from '@/infrastructure/http';
import type { Category, CreateCategoryDto } from '@/infrastructure/http';
import { ConfirmationModal } from '@/presentation/components';
import classes from './CategoriesManager.module.css';

interface FormData {
  name: string;
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await CategoryService.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    reset({ name: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    reset({ name: category.name });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset({ name: '' });
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      if (editingCategory) {
        await CategoryService.update(editingCategory.id, data);
      } else {
        await CategoryService.create(data as CreateCategoryDto);
      }

      await fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      await CategoryService.delete(categoryToDelete.id);
      await fetchCategories();
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSkeletonRows = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <tr key={index} className={classes.tableRow}>
          <td className={classes.tableCell}>
            <div className={classes.categoryCell}>
              <Skeleton height={40} width={40} circle />
              <Skeleton height={20} width={150} style={{ marginLeft: '1rem' }} />
            </div>
          </td>
          <td className={classes.tableCell}><Skeleton height={20} width={200} /></td>
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
            <span className="material-icons-round">category</span>
            Gestión de Categorías
          </h2>
          <Button
            onClick={handleOpenCreate}
            className={classes.createButton}
          >
            <span className="material-icons-round">add</span>
            Nueva Categoría
          </Button>
        </div>

        <div className={classes.tableWrapper}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha de Creación</th>
                <th className={classes.actionsHeader}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                renderSkeletonRows()
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className={classes.emptyCell}>
                    No hay categorías creadas
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className={classes.tableRow}>
                    <td className={classes.tableCell}>
                      <div className={classes.categoryCell}>
                        <div className={classes.iconContainer}>
                          <span className="material-icons-round">folder</span>
                        </div>
                        <div className={classes.categoryName}>{category.name}</div>
                      </div>
                    </td>
                    <td className={classes.tableCell}>
                      {new Date(category.createdAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td className={`${classes.tableCell} ${classes.actionsCell}`}>
                      <div className={classes.actions}>
                        <button
                          className={classes.editButton}
                          onClick={() => handleOpenEdit(category)}
                        >
                          Editar
                        </button>
                        <button
                          className={classes.deleteButton}
                          onClick={() => handleOpenDelete(category)}
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
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        centered
        classNames={{
          title: classes.modalTitle,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Group gap="md" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <TextInput
              label="Nombre de la categoría"
              placeholder="Ej: Cortes de Cabello"
              {...register('name', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres',
                },
              })}
              error={errors.name?.message}
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
                {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
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
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmationWord="eliminar"
        confirmButtonText="Eliminar Categoría"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
    </>
  );
}
