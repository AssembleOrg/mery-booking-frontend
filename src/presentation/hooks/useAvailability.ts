import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { BookingService, type AvailabilityResponse } from '@/infrastructure/http';
import { useState, useEffect } from 'react';

export function useAvailability(
  employeeId: string | null,
  serviceId: string | null,
  minDate: string | null,
  maxDate: string | null
) {
  const [debouncedEmployeeId] = useDebouncedValue(employeeId, 300);
  const [debouncedServiceId] = useDebouncedValue(serviceId, 300);
  const [debouncedMinDate] = useDebouncedValue(minDate, 300);
  const [debouncedMaxDate] = useDebouncedValue(maxDate, 300);

  return useQuery<AvailabilityResponse>({
    queryKey: ['availability', debouncedEmployeeId, debouncedServiceId, debouncedMinDate, debouncedMaxDate],
    queryFn: async () => {
      if (!debouncedEmployeeId || !debouncedServiceId || !debouncedMinDate || !debouncedMaxDate) {
        throw new Error('All parameters are required');
      }
      return await BookingService.getAvailability(
        debouncedEmployeeId,
        debouncedServiceId,
        debouncedMinDate,
        debouncedMaxDate
      );
    },
    enabled: !!debouncedEmployeeId && !!debouncedServiceId && !!debouncedMinDate && !!debouncedMaxDate,
    staleTime: 1000 * 60 * 2, // 2 minutos (más corto porque es información más dinámica)
  });
}


