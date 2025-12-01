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
  Group,
  Checkbox,
  ScrollArea,
  TextInput,
  Badge,
  Divider,
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
    // Cargar servicios cuando se abre el modal
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
        <Table.Tr key={index}>
          <Table.Td><Skeleton height={20} /></Table.Td>
          <Table.Td><Skeleton height={20} /></Table.Td>
          <Table.Td><Skeleton height={20} /></Table.Td>
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
          <Text className={classes.title}>Gestión de Empleados</Text>
          <Button
            color="pink"
            onClick={() => handleOpenEditModal()}
            className={classes.addButton}
          >
            Agregar Empleado
          </Button>
        </Box>

        <Box className={classes.tableContainer}>
          <Table striped highlightOnHover className={classes.table}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Teléfono</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                renderSkeletonRows()
              ) : employees.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Center py="xl">
                      <Text c="dimmed">No hay empleados creados</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                employees.map((employee) => (
                  <Table.Tr key={employee.id}>
                    <Table.Td>{employee.fullName}</Table.Td>
                    <Table.Td>{employee.email}</Table.Td>
                    <Table.Td>{employee.phone}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          variant="light"
                          color="blue"
                          size="xs"
                          onClick={() => handleOpenEditModal(employee)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="light"
                          color="pink"
                          size="xs"
                          onClick={() => handleOpenModal(employee)}
                        >
                          Configurar Servicios
                        </Button>
                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          onClick={() => handleOpenDelete(employee)}
                        >
                          Eliminar
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Stack>

      {/* Modal de Configuración de Servicios */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={`Configurar Servicios: ${selectedEmployee?.fullName || ''}`}
        centered
        size="xl"
        classNames={{
          title: classes.modalTitle,
          body: classes.modalBody,
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
          <Stack gap="md">
            <Text size="sm" c="dimmed" mb="sm">
              Selecciona los servicios que este empleado puede atender
            </Text>

            <Divider />

            <ScrollArea h={500}>
              <Stack gap="lg">
                {allServices.length === 0 ? (
                  <Center py="xl">
                    <Text c="dimmed">No hay servicios disponibles</Text>
                  </Center>
                ) : (
                  (() => {
                    const groupedServices = groupServicesByCategory();
                    return groupedServices.map(({ categoryId, categoryName, services }, index) => (
                      <Box key={categoryId}>
                        <Text
                          className={classes.categoryTitle}
                          fw={600}
                          size="lg"
                          mb="md"
                          mt={index > 0 ? 'xl' : 0}
                        >
                          {categoryName}
                        </Text>
                        <Stack gap="md">
                          {services.map((service) => (
                            <Box key={service.id} className={classes.serviceCard}>
                              <Group justify="space-between" align="flex-start" wrap="nowrap">
                                <Box style={{ flex: 1 }}>
                                  <Checkbox
                                    label={
                                      <Text fw={500} size="md">
                                        {service.name}
                                      </Text>
                                    }
                                    checked={selectedServices.includes(service.id)}
                                    onChange={() => handleServiceToggle(service.id)}
                                    className={classes.serviceCheckbox}
                                  />
                                  {service.description && (
                                    <Text size="sm" c="dimmed" mt={4} ml={28}>
                                      {service.description}
                                    </Text>
                                  )}
                                </Box>
                                <Group gap="md" ml="md">
                                  <Badge color="pink" variant="light" size="lg">
                                    ${service.price.toLocaleString('es-AR')}
                                  </Badge>
                                  <Badge color="blue" variant="light" size="lg">
                                    {service.duration} min
                                  </Badge>
                                </Group>
                              </Group>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    ));
                  })()
                )}
              </Stack>
            </ScrollArea>

            <Divider />

            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                color="gray"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                color="pink"
                onClick={handleSaveServices}
                loading={isSubmitting}
                size="md"
              >
                Guardar Cambios
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Modal de Editar/Crear Empleado */}
      <Modal
        opened={isEditModalOpen}
        onClose={handleCloseEditModal}
        title={isCreating ? 'Agregar Nuevo Empleado' : `Editar Empleado: ${selectedEmployee?.fullName || ''}`}
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

            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                color="gray"
                onClick={handleCloseEditModal}
                disabled={isSubmittingEmployee}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="pink"
                loading={isSubmittingEmployee}
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
