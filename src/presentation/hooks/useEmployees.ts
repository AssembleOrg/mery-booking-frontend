import { useQuery } from '@tanstack/react-query';
import { EmployeeService, type Employee } from '@/infrastructure/http';
import { useAuth } from '@/presentation/contexts';

export function useEmployees(categoryId?: string, serviceId?: string) {
  const { isAuthenticated } = useAuth();

  return useQuery<Employee[]>({
    queryKey: ['employees', isAuthenticated, categoryId, serviceId],
    queryFn: async () => {
      // Si no está autenticado, usar endpoint público
      if (!isAuthenticated) {
        // El endpoint público requiere categoryId
        // Si tenemos categoryId pero no serviceId, llamamos con categoryId
        if (categoryId && !serviceId) {
          return await EmployeeService.getAllPublic(categoryId);
        }
        return await EmployeeService.getAllPublic(categoryId, serviceId);
      }
      // Si está autenticado, usar endpoint normal
      const response = await EmployeeService.getAll();
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: isAuthenticated || true, // Siempre habilitado para usuarios no autenticados (obtener todos los empleados)
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

