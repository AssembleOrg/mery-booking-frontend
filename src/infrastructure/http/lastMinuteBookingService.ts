'use client';

import apiClient from './apiClient';

export type LmbStatus = 'PENDING' | 'CONSUMED' | 'EXPIRED' | 'CANCELLED';

export interface LastMinuteBooking {
  id: string;
  startTime: string;
  endTime: string;
  discountPercent: number;
  notes?: string | null;
  status: LmbStatus;
  services: { id: string; name: string }[];
  booking?: { id: string; bookingCode: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLastMinuteBookingDto {
  startTime: string;
  endTime: string;
  discountPercent: number;
  serviceIds: string[];
  notes?: string;
}

export interface UpdateLastMinuteBookingDto {
  startTime?: string;
  endTime?: string;
  discountPercent?: number;
  serviceIds?: string[];
  notes?: string;
}

export interface PaginatedLmb {
  data: LastMinuteBooking[];
  total: number;
  page: number;
  limit: number;
}

export interface LmbFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: LmbStatus;
  page?: number;
  limit?: number;
}

interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class LastMinuteBookingService {
  private static readonly BASE_PATH = '/last-minute-bookings';

  static async getAll(filters: LmbFilters = {}): Promise<PaginatedLmb> {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    // Siempre mandar page+limit para que el backend active el wrap paginado en `meta`
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const qs = params.toString();
    const response = await apiClient.get<BackendResponse<LastMinuteBooking[]>>(
      `${this.BASE_PATH}?${qs}`,
    );
    const rows = response.data.data ?? [];
    const meta = response.data.meta;
    return {
      data: rows,
      total: meta?.total ?? rows.length,
      page: meta?.page ?? page,
      limit: meta?.limit ?? limit,
    };
  }

  static async getById(id: string): Promise<LastMinuteBooking> {
    const response = await apiClient.get<BackendResponse<LastMinuteBooking>>(
      `${this.BASE_PATH}/${id}`,
    );
    return response.data.data;
  }

  static async create(data: CreateLastMinuteBookingDto): Promise<LastMinuteBooking> {
    const response = await apiClient.post<BackendResponse<LastMinuteBooking>>(
      this.BASE_PATH,
      data,
    );
    return response.data.data;
  }

  static async update(
    id: string,
    data: UpdateLastMinuteBookingDto,
  ): Promise<LastMinuteBooking> {
    const response = await apiClient.patch<BackendResponse<LastMinuteBooking>>(
      `${this.BASE_PATH}/${id}`,
      data,
    );
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}
