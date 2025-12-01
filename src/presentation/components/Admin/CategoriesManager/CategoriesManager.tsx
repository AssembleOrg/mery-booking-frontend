'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Stack, Text, Modal, TextInput, Box, Skeleton, Center, Group } from '@mantine/core';
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
        <Table.Tr key={index}>
          <Table.Td><Skeleton height={20} /></Table.Td>
          <Table.Td><Skeleton height={20} width={200} /></Table.Td>
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
          <Text className={classes.title}>Gestión de Categorías</Text>
          <Button
            color="pink"
            onClick={handleOpenCreate}
            className={classes.createButton}
          >
            + Nueva Categoría
          </Button>
        </Box>

        <Box className={classes.tableContainer}>
          <Table striped highlightOnHover className={classes.table}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Fecha de Creación</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                renderSkeletonRows()
              ) : categories.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed">No hay categorías creadas</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                categories.map((category) => (
                  <Table.Tr key={category.id}>
                    <Table.Td>{category.name}</Table.Td>
                    <Table.Td>
                      {new Date(category.createdAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Table.Td>
                    <Table.Td>
                      <Box className={classes.actions}>
                        <Button
                          variant="light"
                          color="blue"
                          size="xs"
                          onClick={() => handleOpenEdit(category)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          onClick={() => handleOpenDelete(category)}
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
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        centered
        classNames={{
          title: classes.modalTitle,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
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
          </Stack>
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

