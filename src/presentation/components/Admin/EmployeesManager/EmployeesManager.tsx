'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Box,
  Skeleton,
  Center,
  Group,
  TextInput,
  Divider,
  Text,
  Stack,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { EmployeeService, ServiceService, CategoryService } from '@/infrastructure/http';
import type { Employee, ServiceEntity, CreateEmployeeDto, UpdateEmployeeDto, Category } from '@/infrastructure/http';
import { ConfirmationModal } from '@/presentation/components';
import classes from './EmployeesManager.module.css';

interface EmployeeFormData {
  fullName: string;
  email: string;
  phone: string;
}

export function EmployeesManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allServices, setAllServices] = useState<ServiceEntity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register: registerEmployee,
    handleSubmit: handleSubmitEmployee,
    reset: resetEmployee,
    formState: { errors: employeeErrors },
  } = useForm<EmployeeFormData>();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      const employeesResponse = await EmployeeService.getAll();

      if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
        setEmployees(employeesResponse.data);
      } else {
        console.error('Invalid employees response:', employeesResponse);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployeeServices = async (employeeId: string) => {
    try {
      setIsLoadingServices(true);
      const assignedServices = await EmployeeService.getServices(employeeId);
      const assignedServiceIds = assignedServices.map((s) => s.id);
      setSelectedServices(assignedServiceIds);
    } catch (error) {
      console.error('Error loading employee services:', error);
      setSelectedServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const loadAllServices = async () => {
    try {
      setIsLoadingServices(true);
      const [services, categoriesResponse] = await Promise.all([
        ServiceService.getAllWithoutPagination(),
        CategoryService.getAll(),
      ]);
      setAllServices(services);
      if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Error loading all services:', error);
      setAllServices([]);
      setCategories([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleOpenModal = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    await Promise.all([
      loadAllServices(),
      loadEmployeeServices(employee.id),
    ]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setSelectedServices([]);
    setAllServices([]);
    setCategories([]);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  const groupServicesByCategory = (): Array<{ categoryId: string; categoryName: string; services: ServiceEntity[] }> => {
    const grouped = allServices.reduce((acc, service) => {
      const categoryId = service.categoryId || 'uncategorized';
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(service);
      return acc;
    }, {} as Record<string, ServiceEntity[]>);

    return Object.entries(grouped).map(([categoryId, services]) => ({
      categoryId,
      categoryName: categoryId === 'uncategorized' ? 'Sin categoría' : getCategoryName(categoryId),
      services,
    }));
  };

  const handleOpenEditModal = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setIsCreating(false);
      resetEmployee({
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
      });
    } else {
      setSelectedEmployee(null);
      setIsCreating(true);
      resetEmployee({
        fullName: '',
        email: '',
        phone: '',
      });
    }
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    setIsCreating(false);
    resetEmployee({
      fullName: '',
      email: '',
      phone: '',
    });
  };

  const handleSubmitEmployeeForm = async (data: EmployeeFormData) => {
    try {
      setIsSubmittingEmployee(true);
      if (isCreating) {
        const createData: CreateEmployeeDto = {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        };
        await EmployeeService.create(createData);
      } else if (selectedEmployee) {
        const updateData: UpdateEmployeeDto = {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        };
        await EmployeeService.update(selectedEmployee.id, updateData);
      }
      await initializeData();
      handleCloseEditModal();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setIsSubmittingEmployee(false);
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSaveServices = async () => {
    if (!selectedEmployee) return;

    try {
      setIsSubmitting(true);
      await EmployeeService.assignServices(selectedEmployee.id, selectedServices);
      await initializeData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving services:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      setIsDeleting(true);
      await EmployeeService.delete(employeeToDelete.id);
      await initializeData();
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
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
            <Skeleton height={20} width={150} />
          </td>
          <td className={classes.tableCell}>
            <Skeleton height={20} width={200} />
          </td>
          <td className={classes.tableCell}>
            <Skeleton height={20} width={120} />
          </td>
          <td className={classes.tableCell}>
            <Group gap="xs">
              <Skeleton height={28} width={70} />
              <Skeleton height={28} width={120} />
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
            <span className="material-icons-round">people</span>
            Gestión de Empleados
          </h2>
          <Button
            onClick={() => handleOpenEditModal()}
            className={classes.createButton}
          >
            <span className="material-icons-round">add</span>
            Agregar Empleado
          </Button>
        </div>

        <div className={classes.tableWrapper}>
          <table className={classes.table} style={{ backgroundColor: '#ffffff' }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th className={classes.actionsHeader}>Acciones</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: '#ffffff' }}>
              {isLoading ? (
                renderSkeletonRows()
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className={classes.emptyCell}>
                    <Center py="xl">
                      <span>No hay empleados creados</span>
                    </Center>
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className={classes.tableRow} style={{ backgroundColor: '#ffffff' }}>
                    <td className={classes.tableCell} style={{ backgroundColor: '#ffffff' }}>
                      <div className={classes.employeeCell}>
                        <div className={classes.iconContainer}>
                          <span className="material-icons-round">person</span>
                        </div>
                        <div className={classes.employeeName}>{employee.fullName}</div>
                      </div>
                    </td>
                    <td className={classes.tableCell} style={{ backgroundColor: '#ffffff' }}>
                      {employee.email}
                    </td>
                    <td className={classes.tableCell} style={{ backgroundColor: '#ffffff' }}>
                      {employee.phone}
                    </td>
                    <td className={`${classes.tableCell} ${classes.actionsCell}`} style={{ backgroundColor: '#ffffff' }}>
                      <div className={classes.actions}>
                        <button
                          className={classes.editButton}
                          onClick={() => handleOpenEditModal(employee)}
                        >
                          Editar
                        </button>
                        <button
                          className={classes.servicesButton}
                          onClick={() => handleOpenModal(employee)}
                        >
                          Servicios
                        </button>
                        <button
                          className={classes.deleteButton}
                          onClick={() => handleOpenDelete(employee)}
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

      {/* Modal de Configuración de Servicios */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={
          <div className={classes.modalTitleContainer}>
            <span className="material-icons-round">assignment</span>
            <span>Configurar Servicios: {selectedEmployee?.fullName || ''}</span>
          </div>
        }
        centered
        size="90%"
        styles={{
          body: {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
          content: {
            maxWidth: '1400px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
          inner: {
            padding: '1rem',
          },
        }}
        classNames={{
          title: classes.modalTitle,
          body: classes.modalBody,
          content: classes.modalContent,
        }}
      >
        {isLoadingServices ? (
          <Center py="xl">
            <Stack gap="md" align="center">
              <Skeleton height={60} width="100%" />
              <Skeleton height={60} width="100%" />
              <Skeleton height={60} width="100%" />
            </Stack>
          </Center>
        ) : (
          <div className={classes.modalContentWrapper}>
            <div className={classes.modalHeaderSection}>
              <Text size="sm" className={classes.modalDescription}>
                Selecciona los servicios que este empleado puede atender
              </Text>
            </div>

            <div className={classes.servicesScrollContainer}>
              {allServices.length === 0 ? (
                <Center py="xl">
                  <Text className={classes.emptyText}>No hay servicios disponibles</Text>
                </Center>
              ) : (
                <div className={classes.servicesContent}>
                  {(() => {
                    const groupedServices = groupServicesByCategory();
                    return groupedServices.map(({ categoryId, categoryName, services }) => (
                      <Box key={categoryId} className={classes.categorySection}>
                        <Text className={classes.categoryTitle}>
                          {categoryName}
                        </Text>
                        <div className={classes.servicesGrid}>
                          {services.map((service) => {
                            const isSelected = selectedServices.includes(service.id);
                            return (
                              <div
                                key={service.id}
                                className={`${classes.serviceCard} ${isSelected ? classes.serviceCardSelected : ''}`}
                                onClick={() => handleServiceToggle(service.id)}
                              >
                                <div className={classes.serviceCardHeader}>
                                  <div className={classes.serviceIconContainer}>
                                    <span className="material-icons-round">
                                      {service.name.toLowerCase().includes('paramedical') || service.name.toLowerCase().includes('camuflaje')
                                        ? 'healing'
                                        : service.name.toLowerCase().includes('tattoo') || service.name.toLowerCase().includes('cosmético') || service.name.toLowerCase().includes('microblading')
                                        ? 'colorize'
                                        : service.name.toLowerCase().includes('ceja') || service.name.toLowerCase().includes('pestaña') || service.name.toLowerCase().includes('estilismo')
                                        ? 'visibility'
                                        : service.name.toLowerCase().includes('labial') || service.name.toLowerCase().includes('lip')
                                        ? 'face_retouching_natural'
                                        : 'spa'}
                                    </span>
                                  </div>
                                  <div className={classes.serviceCheckboxContainer}>
                                    <div className={`${classes.serviceCheckbox} ${isSelected ? classes.serviceCheckboxChecked : ''}`}>
                                      {isSelected && (
                                        <span className="material-icons-round">check</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className={classes.serviceCardContent}>
                                  <Text className={classes.serviceName}>{service.name}</Text>
                                  {service.description && (
                                    <Text className={classes.serviceDescription}>
                                      {service.description}
                                    </Text>
                                  )}
                                </div>
                                <div className={classes.serviceCardFooter}>
                                  <div className={classes.servicePrice}>
                                    ${service.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                  <div className={classes.serviceDuration}>
                                    <span className="material-icons-round">schedule</span>
                                    {service.duration} min
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Box>
                    ));
                  })()}
                </div>
              )}
            </div>

            <div className={classes.modalFooterSection}>
              <Divider className={classes.divider} />
              <Group justify="flex-end" className={classes.modalActions}>
                <Button
                  variant="outline"
                  color="gray"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className={classes.cancelButton}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveServices}
                  loading={isSubmitting}
                  size="md"
                  className={classes.saveButton}
                >
                  Guardar Cambios
                </Button>
              </Group>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Editar/Crear Empleado */}
      <Modal
        opened={isEditModalOpen}
        onClose={handleCloseEditModal}
        title={
          <div className={classes.modalTitleContainer}>
            <span className="material-icons-round">
              {isCreating ? 'person_add' : 'edit'}
            </span>
            <span>
              {isCreating ? 'Agregar Nuevo Empleado' : `Editar Empleado: ${selectedEmployee?.fullName || ''}`}
            </span>
          </div>
        }
        centered
        size="md"
        classNames={{
          title: classes.modalTitle,
        }}
      >
        <form onSubmit={handleSubmitEmployee(handleSubmitEmployeeForm)}>
          <Stack gap="md">
            <TextInput
              label="Nombre Completo"
              placeholder="Nombre del empleado"
              {...registerEmployee('fullName', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres',
                },
              })}
              error={employeeErrors.fullName?.message}
            />

            <TextInput
              label="Email"
              placeholder="email@example.com"
              type="email"
              {...registerEmployee('email', {
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
              error={employeeErrors.email?.message}
            />

            <TextInput
              label="Teléfono"
              placeholder="+54123456789"
              {...registerEmployee('phone', {
                required: 'El teléfono es requerido',
              })}
              error={employeeErrors.phone?.message}
            />

            <Group justify="flex-end" mt="md" className={classes.modalActions}>
              <Button
                variant="outline"
                color="gray"
                onClick={handleCloseEditModal}
                disabled={isSubmittingEmployee}
                className={classes.cancelButton}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isSubmittingEmployee}
                className={classes.saveButton}
              >
                {isCreating ? 'Crear Empleado' : 'Guardar Cambios'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal Delete Confirmation */}
      <ConfirmationModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Empleado"
        message={`¿Estás seguro de que deseas eliminar al empleado "${employeeToDelete?.fullName}"? Esta acción no se puede deshacer.`}
        confirmationWord="eliminar"
        confirmButtonText="Eliminar Empleado"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
    </>
  );
}
