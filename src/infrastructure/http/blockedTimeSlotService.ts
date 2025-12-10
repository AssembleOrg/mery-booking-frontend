import apiClient from './apiClient';
import type { DayOfWeek } from './employeeTimeSlotService';

export interface BlockedTimeSlot {
  id: string;
  employeeId: string;
  date?: string | null; // YYYY-MM-DD o null (para bloqueos específicos)
  dayOfWeek?: DayOfWeek | null; // Para bloqueos recurrentes
  startTime: number; // 0-23
  endTime: number; // 0-23
  reason?: string; // Razón del bloqueo
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockedTimeSlotDto {
  employeeId: string;
  date?: string; // YYYY-MM-DD (para bloqueo específico)
  dayOfWeek?: DayOfWeek; // Para bloqueo recurrente
  startTime: number;
  endTime: number;
  reason?: string;
}

export interface UpdateBlockedTimeSlotDto {
  date?: string | null;
  dayOfWeek?: DayOfWeek | null;
  startTime?: number;
  endTime?: number;
  reason?: string;
}

// Formato de respuesta del backend
interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export class BlockedTimeSlotService {
  private static readonly BASE_PATH = '/blocked-timeslots';

  static async getAll(employeeId?: string): Promise<BlockedTimeSlot[]> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);

    const response = await apiClient.get<BackendResponse<BlockedTimeSlot[]>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response.data.data;
  }

  static async getById(id: string): Promise<BlockedTimeSlot> {
    const response = await apiClient.get<BackendResponse<BlockedTimeSlot>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  static async create(data: CreateBlockedTimeSlotDto): Promise<BlockedTimeSlot> {
    const response = await apiClient.post<BackendResponse<BlockedTimeSlot>>(this.BASE_PATH, data);
    return response.data.data;
  }

  static async update(id: string, data: UpdateBlockedTimeSlotDto): Promise<BlockedTimeSlot> {
    const response = await apiClient.patch<BackendResponse<BlockedTimeSlot>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}



