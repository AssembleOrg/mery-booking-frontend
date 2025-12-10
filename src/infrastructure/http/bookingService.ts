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

export interface GetAllBookingsParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  clientId?: string;
  serviceId?: string; // Agregado para filtrar por servicio
  status?: BookingStatus;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
}

export interface CreateBookingDto {
  clientId: string;
  employeeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (solo :00 o :30)
  quantity?: number;
  paid?: boolean;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  clientId: string;
  employeeId: string;
  serviceId: string;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  date?: string; // YYYY-MM-DD (legacy, usar localDate)
  localDate: string; // YYYY-MM-DD (fecha local)
  startTimeFormatted?: string; // HH:mm (legacy, usar localStartTime)
  endTimeFormatted?: string; // HH:mm (legacy, usar localEndTime)
  localStartTime: string; // HH:mm (hora local de inicio)
  localEndTime: string; // HH:mm (hora local de fin)
  quantity: number;
  paid: boolean;
  status: BookingStatus;
  notes?: string;
  client?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  employee?: {
    id: string;
    fullName: string;
  };
  service?: {
    id: string;
    name: string;
    duration: number;
    price: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityResponse {
  employee: {
    id: string;
    fullName: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
  };
  availability: Array<{
    date: string; // YYYY-MM-DD
    dayOfWeek: string;
    hasActiveTimeSlots: boolean;
    slots: Array<{
      startTime: string; // HH:mm
      endTime: string; // HH:mm
      available: boolean;
    }>;
  }>;
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

  static async getAvailability(
    employeeId: string,
    serviceId: string,
    minDate: string,
    maxDate: string
  ): Promise<AvailabilityResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('employeeId', employeeId);
    queryParams.append('serviceId', serviceId);
    queryParams.append('minDate', minDate);
    queryParams.append('maxDate', maxDate);

    const response = await apiClient.get<BackendResponse<AvailabilityResponse>>(
      `${this.BASE_PATH}/availability?${queryParams.toString()}`
    );
    return response.data.data;
  }

  static async create(data: CreateBookingDto): Promise<BookingResponse> {
    const response = await apiClient.post<BackendResponse<BookingResponse>>(
      this.BASE_PATH,
      data
    );
    return response.data.data;
  }

  static async getAll(params?: GetAllBookingsParams): Promise<PaginatedResponse<BookingResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.clientId) queryParams.append('clientId', params.clientId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH;

    const response = await apiClient.get<BackendResponse<PaginatedResponse<BookingResponse> | BookingResponse[]>>(url);
    const responseData = response.data.data;

    // Si el backend devuelve directamente un array (sin paginación)
    if (Array.isArray(responseData)) {
      return {
        data: responseData,
        total: responseData.length,
      };
    }

    // Si el backend devuelve un objeto paginado
    return responseData;
  }

  static async getById(id: string): Promise<BookingResponse> {
    const response = await apiClient.get<BackendResponse<BookingResponse>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  static async cancel(id: string): Promise<BookingResponse> {
    const response = await apiClient.post<BackendResponse<BookingResponse>>(`${this.BASE_PATH}/${id}/cancel`);
    return response.data.data;
  }
}

