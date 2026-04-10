'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import type { RescheduleData } from '@/presentation/components/RescheduleConfirmStep';

interface RescheduleParams {
  isReschedule: boolean;
  bookingCode: string;
  dni: string;
  bookingId: string;
  serviceId: string;
  employeeId: string;
  rescheduleData: RescheduleData | undefined;
  clearParams: () => void;
}

export function useRescheduleParams(): RescheduleParams {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingCode = searchParams.get('reschedule') || '';
  const isReschedule = !!bookingCode;

  const rescheduleData: RescheduleData | undefined = useMemo(() => {
    if (!isReschedule) return undefined;
    return {
      bookingCode,
      dni: searchParams.get('dni') || '',
      originalPrice: parseFloat(searchParams.get('originalPrice') || '0'),
      paidStatus: searchParams.get('paidStatus') || 'UNPAID',
      originalServiceName: searchParams.get('originalServiceName') || '',
      clientName: searchParams.get('clientName') || '',
    };
  }, [isReschedule, bookingCode, searchParams]);

  const clearParams = useCallback(() => {
    const url = new URL(window.location.href);
    url.search = '';
    router.replace(url.pathname);
  }, [router]);

  return {
    isReschedule,
    bookingCode,
    dni: searchParams.get('dni') || '',
    bookingId: searchParams.get('bookingId') || '',
    serviceId: searchParams.get('serviceId') || '',
    employeeId: searchParams.get('employeeId') || '',
    rescheduleData,
    clearParams,
  };
}
