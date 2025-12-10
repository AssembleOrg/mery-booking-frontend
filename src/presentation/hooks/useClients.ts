import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientService, type CreateClientDto, type CreateClientPublicDto, type Client, type CreateClientPublicResponse } from '@/infrastructure/http';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/presentation/contexts';

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation<Client | CreateClientPublicResponse, Error, CreateClientDto | CreateClientPublicDto>({
    mutationFn: async (data) => {
      // Si no está autenticado, usar endpoint público
      if (!isAuthenticated) {
        // Verificar que tenga dni (requerido para endpoint público)
        if ('dni' in data && data.dni) {
          return await ClientService.createPublic(data as CreateClientPublicDto);
        }
        throw new Error('DNI es requerido para crear un cliente público');
      }
      // Si está autenticado, usar endpoint normal
      return await ClientService.create(data as CreateClientDto);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      const isNew = 'isNew' in data ? data.isNew : true;
      notifications.show({
        title: isNew ? 'Cliente creado' : 'Cliente encontrado',
        message: isNew 
          ? 'El cliente se ha creado exitosamente' 
          : 'Se encontró un cliente existente con ese DNI',
        color: 'green',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el cliente';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}


