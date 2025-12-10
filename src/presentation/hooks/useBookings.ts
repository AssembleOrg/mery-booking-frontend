import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingService, type CreateBookingDto, type BookingResponse } from '@/infrastructure/http';
import { notifications } from '@mantine/notifications';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, CreateBookingDto>({
    mutationFn: async (data) => {
      return await BookingService.create(data);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      notifications.show({
        title: 'Reserva creada',
        message: 'Tu reserva se ha creado exitosamente',
        color: 'green',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear la reserva';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}


