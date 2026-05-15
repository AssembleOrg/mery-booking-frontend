import { useQuery } from '@tanstack/react-query';
import { EmployeeService, type Employee } from '@/infrastructure/http';
import { useAuth } from '@/presentation/contexts';

export function useEmployees(categoryId?: string, serviceId?: string) {
  const { isAuthenticated } = useAuth();

  return useQuery<Employee[]>({
    queryKey: ['employees', isAuthenticated, categoryId, serviceId],
    queryFn: async () => {
      // Cuando hay un servicio seleccionado, siempre usar el endpoint público
      // que filtra por categoryId + serviceId (funciona logueado o no).
      // Esto evita el bug de admin viendo todos los empleados al reservar.
      if (categoryId && serviceId) {
        return await EmployeeService.getAllPublic(categoryId, serviceId);
      }
      if (!isAuthenticated) {
        if (categoryId) {
          return await EmployeeService.getAllPublic(categoryId);
        }
        return await EmployeeService.getAllPublic(categoryId, serviceId);
      }
      const response = await EmployeeService.getAll();
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    enabled: isAuthenticated || true,
  });
}

export function useEmployee(id: string | null) {
  return useQuery<Employee>({
    queryKey: ['employee', id],
    queryFn: async () => {
      if (!id) throw new Error('Employee ID is required');
      return await EmployeeService.getById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useEmployeeServices(employeeId: string | null) {
  return useQuery({
    queryKey: ['employee-services', employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error('Employee ID is required');
      return await EmployeeService.getServices(employeeId);
    },
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

