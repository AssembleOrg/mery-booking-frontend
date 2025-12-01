import apiClient from './apiClient';

export type BookingStatus = 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: number;
  startTime: number;
  endTime: number;
  duration: number;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  serviceName: string;
  clientId: string;
  clientName: string;
  quantity: number;
  paid: boolean;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// Formato de respuesta del backend
interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface GetOccupiedTimeSlotsParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  employeeId?: string;
  serviceId?: string;
}

export class BookingService {
  private static readonly BASE_PATH = '/bookings';

  static async getOccupiedTimeSlots(
    params: GetOccupiedTimeSlotsParams
  ): Promise<Booking[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    if (params.employeeId) {
      queryParams.append('employeeId', params.employeeId);
    }
    if (params.serviceId) {
      queryParams.append('serviceId', params.serviceId);
    }

    const response = await apiClient.get<BackendResponse<Booking[]>>(
      `${this.BASE_PATH}/occupied-timeslots?${queryParams.toString()}`
    );
    return response.data.data;
  }
}

