import { useQuery } from '@tanstack/react-query';
import { ServiceService, type ServiceEntity, type PublicServiceResponse } from '@/infrastructure/http';
import { useAuth } from '@/presentation/contexts';

// Tipo unificado para servicios (públicos o completos)
type ServiceData = ServiceEntity | PublicServiceResponse;

export function useServices(categoryId?: string) {
  const { isAuthenticated } = useAuth();

  return useQuery<ServiceData[]>({
    queryKey: ['services', categoryId, isAuthenticated],
    queryFn: async () => {
      // Si no está autenticado
      if (!isAuthenticated) {
        // Si hay categoryId, usar endpoint público (obligatorio)
        if (categoryId) {
          return await ServiceService.getAllPublic(categoryId);
        }
        // Si no hay categoryId y no está autenticado, no podemos hacer la llamada
        // Retornar array vacío o lanzar error
        throw new Error('categoryId is required for public services endpoint');
      }
      // Si está autenticado, usar endpoint normal (categoryId es opcional)
      const response = await ServiceService.getAll(undefined, undefined, categoryId);
      return response.data;
    },
    enabled: isAuthenticated || !!categoryId, // Solo habilitar si está autenticado o hay categoryId
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useService(id: string | null) {
  return useQuery<ServiceEntity>({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) throw new Error('Service ID is required');
      return await ServiceService.getById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

