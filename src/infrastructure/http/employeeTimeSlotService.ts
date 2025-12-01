import apiClient from './apiClient';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface Service {
  id: string;
  name: string;
}

export interface EmployeeTimeSlot {
  id: string;
  employeeId: string;
  date: string | null; // YYYY-MM-DD o null
  dayOfWeek: DayOfWeek | null;
  startTime: number; // 0-23
  endTime: number; // 0-23
  isActive: boolean;
  serviceIds?: string[];
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface CreateEmployeeTimeSlotDto {
  employeeId: string;
  date?: string; // YYYY-MM-DD
  dayOfWeek?: DayOfWeek;
  startTime: number;
  endTime: number;
  isActive?: boolean;
  serviceIds?: string[];
}

export interface UpdateEmployeeTimeSlotDto {
  date?: string | null;
  dayOfWeek?: DayOfWeek | null;
  startTime?: number;
  endTime?: number;
  isActive?: boolean;
}

// Formato de respuesta del backend
interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export class EmployeeTimeSlotService {
  private static readonly BASE_PATH = '/employee-timeslots';

  static async getAll(
    page?: number,
    limit?: number,
    employeeId?: string,
    isActive?: boolean
  ): Promise<PaginatedResponse<EmployeeTimeSlot>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (employeeId) params.append('employeeId', employeeId);
    if (isActive !== undefined) params.append('isActive', isActive.toString());

    const response = await apiClient.get<BackendResponse<PaginatedResponse<EmployeeTimeSlot> | EmployeeTimeSlot[]>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    
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

  static async getById(id: string): Promise<EmployeeTimeSlot> {
    const response = await apiClient.get<BackendResponse<EmployeeTimeSlot>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  static async create(data: CreateEmployeeTimeSlotDto): Promise<EmployeeTimeSlot> {
    const response = await apiClient.post<BackendResponse<EmployeeTimeSlot>>(this.BASE_PATH, data);
    return response.data.data;
  }

  static async update(id: string, data: UpdateEmployeeTimeSlotDto): Promise<EmployeeTimeSlot> {
    const response = await apiClient.patch<BackendResponse<EmployeeTimeSlot>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  static async toggleActive(id: string): Promise<EmployeeTimeSlot> {
    const response = await apiClient.patch<BackendResponse<EmployeeTimeSlot>>(
      `${this.BASE_PATH}/${id}/toggle-active`
    );
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  static async getTimeSlots(id: string): Promise<Array<{ start: number; end: number }>> {
    const response = await apiClient.get<BackendResponse<Array<{ start: number; end: number }>>>(
      `${this.BASE_PATH}/${id}/time-slots`
    );
    return response.data.data;
  }

  static async updateServices(id: string, serviceIds: string[]): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/${id}/services`, { serviceIds });
  }
}

