'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, TextInput, Box, Skeleton, Group, Stack, Pagination } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { ClientService } from '@/infrastructure/http';
import type { Client } from '@/infrastructure/http';
import { ConfirmationModal } from '@/presentation/components';
import classes from './ClientsManager.module.css';

interface ClientFormData {
  fullName: string;
  email: string;
  phone?: string;
  dni?: string;
}

const LIMIT = 20;

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>();

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // Fetch when page or search changes
  useEffect(() => {
    fetchClients(currentPage, debouncedSearch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  const fetchClients = async (page: number, search: string) => {
    try {
      setIsLoading(true);
      if (search.trim()) {
        // Trae todos sin paginación y filtra client-side → datos completos
        const response = await ClientService.getAll();
        const lower = search.toLowerCase();
        const filtered = response.data.filter((c) =>
          c.fullName.toLowerCase().includes(lower)
        );
        setClients(filtered);
        setTotal(0);
      } else {
        const response = await ClientService.getAll(page, LIMIT);
        setClients(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingClient(null);
    reset({ fullName: '', email: '', phone: '', dni: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    reset({ fullName: client.fullName, email: client.email, phone: client.phone, dni: client.dni ?? '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    reset({ fullName: '', email: '', phone: '', dni: '' });
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone?.trim() || undefined,
        dni: data.dni?.trim() || undefined,
      };
      if (editingClient) {
        await ClientService.update(editingClient.id, payload);
      } else {
        await ClientService.create({ ...payload, phone: payload.phone ?? '' });
      }
      await fetchClients(currentPage, debouncedSearch);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      setIsDeleting(true);
      await ClientService.delete(clientToDelete.id);
      await fetchClients(currentPage, debouncedSearch);
      setDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className={classes.tableRow}>
        <td className={classes.tableCell}><Skeleton height={16} radius="sm" /></td>
        <td className={classes.tableCell}><Skeleton height={16} radius="sm" /></td>
        <td className={classes.tableCell}><Skeleton height={16} radius="sm" /></td>
        <td className={classes.tableCell}><Skeleton height={16} radius="sm" width={40} /></td>
        <td className={classes.tableCell}><Skeleton height={16} radius="sm" /></td>
        <td className={classes.tableCell}><Skeleton height={16} radius="sm" /></td>
        <td className={classes.tableCell}><Skeleton height={16} radius="sm" /></td>
        <td className={classes.tableCell}><Skeleton height={16} radius="sm" width={80} /></td>
      </tr>
    ));

  return (
    <Box className={classes.container}>
      {/* Header */}
      <div className={classes.header}>
        <h2 className={classes.title}>
          <span className="material-icons-round">people</span>
          Gestión de Clientes
        </h2>
        <TextInput
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          className={classes.searchInput}
          size="xs"
        />
        <Button onClick={handleOpenCreate} className={classes.createButton}>
          <span className="material-icons-round">add</span>
          Nuevo Cliente
        </Button>
      </div>

      {/* Table */}
      <div className={classes.tableWrapper}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Reservas</th>
              <th>Últ. Reserva</th>
              <th>Próx. Reserva</th>
              <th>Registrado</th>
              <th className={classes.actionsHeader}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              renderSkeletonRows()
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={8} className={classes.emptyCell}>
                  {debouncedSearch ? 'No se encontraron clientes.' : 'No hay clientes registrados.'}
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className={classes.tableRow}>
                  <td className={classes.tableCell}>
                    <div className={classes.clientCell}>
                      <div className={classes.iconContainer}>
                        <span className="material-icons-round">person</span>
                      </div>
                      <span className={classes.clientName}>{client.fullName}</span>
                    </div>
                  </td>
                  <td className={classes.tableCell}>{client.email || '—'}</td>
                  <td className={classes.tableCell}>{client.phone || '—'}</td>
                  <td className={classes.tableCell}>{client.totalBooked ?? 0}</td>
                  <td className={classes.tableCell}>{formatDate(client.lastBooked)}</td>
                  <td className={classes.tableCell}>{formatDate(client.nextBooked)}</td>
                  <td className={classes.tableCell}>{formatDate(client.createdAt)}</td>
                  <td className={`${classes.tableCell} ${classes.actionsCell}`}>
                    <div className={classes.actions}>
                      <button
                        className={classes.editButton}
                        onClick={() => handleOpenEdit(client)}
                      >
                        Editar
                      </button>
                      <button
                        className={classes.deleteButton}
                        onClick={() => handleOpenDelete(client)}
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

      {/* Paginación — solo en modo normal (sin búsqueda activa) */}
      {total > LIMIT && (
        <div className={classes.pagination}>
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={Math.ceil(total / LIMIT)}
            size="sm"
            color="pink"
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        centered
        classNames={{ title: classes.modalTitle }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nombre Completo"
              placeholder="Nombre del cliente"
              error={errors.fullName?.message}
              {...register('fullName', {
                required: 'El nombre es requerido',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              })}
            />
            <TextInput
              label="Email"
              placeholder="email@ejemplo.com"
              type="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
            />
            <TextInput
              label="DNI"
              error={errors.dni?.message}
              {...register('dni')}
            />
            <TextInput
              label="Teléfono"
              placeholder="+54 9 11 1234-5678"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Group justify="flex-end" mt="md" className={classes.modalActions}>
              <Button
                variant="outline"
                color="gray"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" color="pink" loading={isSubmitting}>
                {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${clientToDelete?.fullName}"? Esta acción no se puede deshacer.`}
        confirmationWord="eliminar"
        confirmButtonText="Eliminar Cliente"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
    </Box>
  );
}
