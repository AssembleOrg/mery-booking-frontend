import apiClient from './apiClient';

export interface ServiceEntity {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  showOnSite: boolean;
  duration: number;
  price: number;
  minQuantity: number;
  maxQuantity: number;
  urlImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  categoryId: string;
  showOnSite: boolean;
  duration: number;
  price: number;
  minQuantity: number;
  maxQuantity: number;
  urlImage?: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  categoryId?: string;
  showOnSite?: boolean;
  duration?: number;
  price?: number;
  minQuantity?: number;
  maxQuantity?: number;
  urlImage?: string;
}

// Formato de respuesta del backend
interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export class ServiceService {
  private static readonly BASE_PATH = '/services';

  static async getAll(page?: number, limit?: number, categoryId?: string): Promise<PaginatedResponse<ServiceEntity>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (categoryId) params.append('categoryId', categoryId);

    const response = await apiClient.get<BackendResponse<PaginatedResponse<ServiceEntity> | ServiceEntity[]>>(
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

  static async getAllVisible(): Promise<ServiceEntity[]> {
    const response = await apiClient.get<BackendResponse<ServiceEntity[]>>(`${this.BASE_PATH}/visible/all`);
    return response.data.data;
  }

  static async getAllWithoutPagination(): Promise<ServiceEntity[]> {
    const response = await apiClient.get<BackendResponse<ServiceEntity[]>>(`${this.BASE_PATH}/all`);
    return response.data.data;
  }

  static async getById(id: string): Promise<ServiceEntity> {
    const response = await apiClient.get<BackendResponse<ServiceEntity>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  static async create(data: CreateServiceDto): Promise<ServiceEntity> {
    const response = await apiClient.post<BackendResponse<ServiceEntity>>(this.BASE_PATH, data);
    return response.data.data;
  }

  static async update(id: string, data: UpdateServiceDto): Promise<ServiceEntity> {
    const response = await apiClient.patch<BackendResponse<ServiceEntity>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}

