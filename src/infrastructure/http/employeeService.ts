import apiClient from './apiClient';
import type { ServiceEntity } from './serviceService';

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingDay {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: number;
  endTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface DayOff {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface CreateEmployeeDto {
  fullName: string;
  email: string;
  phone: string;
}

export interface UpdateEmployeeDto {
  fullName?: string;
  email?: string;
  phone?: string;
}

// Formato de respuesta del backend
interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export class EmployeeService {
  private static readonly BASE_PATH = '/employees';

  static async getAll(page?: number, limit?: number): Promise<PaginatedResponse<Employee>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await apiClient.get<BackendResponse<Employee[]>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    
    // El backend devuelve { data: Employee[], success, message, timestamp }
    // response.data.data es el array de empleados
    const employeesArray = response.data.data;
    
    // Retornar en formato paginado para consistencia
    return {
      data: employeesArray,
      total: employeesArray.length,
    };
  }

  static async getById(id: string): Promise<Employee> {
    const response = await apiClient.get<BackendResponse<Employee>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  static async create(data: CreateEmployeeDto): Promise<Employee> {
    const response = await apiClient.post<BackendResponse<Employee>>(this.BASE_PATH, data);
    return response.data.data;
  }

  static async update(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const response = await apiClient.patch<BackendResponse<Employee>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  static async assignServices(employeeId: string, serviceIds: string[]): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/${employeeId}/services`, { serviceIds });
  }

  static async getServices(employeeId: string): Promise<ServiceEntity[]> {
    const response = await apiClient.get<BackendResponse<ServiceEntity[]>>(
      `${this.BASE_PATH}/${employeeId}/services`
    );
    return response.data.data;
  }

  static async getWorkingDays(employeeId: string): Promise<WorkingDay[]> {
    const response = await apiClient.get<BackendResponse<WorkingDay[]>>(
      `${this.BASE_PATH}/${employeeId}/working-days`
    );
    return response.data.data;
  }

  static async getDaysOff(employeeId: string): Promise<DayOff[]> {
    const response = await apiClient.get<BackendResponse<DayOff[]>>(
      `${this.BASE_PATH}/${employeeId}/days-off`
    );
    return response.data.data;
  }
}

