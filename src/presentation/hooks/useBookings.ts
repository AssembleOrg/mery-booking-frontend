import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingService, type CreateBookingDto, type BookingResponse, type RescheduleBookingDto } from '@/infrastructure/http';
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

export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, { bookingId: string; data: RescheduleBookingDto }>({
    mutationFn: async ({ bookingId, data }) => {
      return await BookingService.reschedule(bookingId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      notifications.show({
        title: 'Reserva reagendada',
        message: 'La reserva se ha reagendado exitosamente',
        color: 'green',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Error al reagendar la reserva';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}

export function useRescheduleBookingPublic() {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, { bookingCode: string; data: RescheduleBookingDto }>({
    mutationFn: async ({ bookingCode, data }) => {
      return await BookingService.reschedulePublic(bookingCode, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      
      notifications.show({
        title: 'Reserva reagendada',
        message: 'Tu reserva se ha reagendado exitosamente',
        color: 'green',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Error al reagendar la reserva';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}

export function useGetBookingByCode() {
  return useMutation<BookingResponse, Error, string>({
    mutationFn: async (bookingCode) => {
      return await BookingService.getByCode(bookingCode);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Error al buscar la reserva';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    },
  });
}


