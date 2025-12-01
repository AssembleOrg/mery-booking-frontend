import apiClient from './apiClient';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name?: string;
}

// Formato de respuesta del backend
interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export class CategoryService {
  private static readonly BASE_PATH = '/categories';

  static async getAll(page?: number, limit?: number): Promise<PaginatedResponse<Category>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await apiClient.get<BackendResponse<PaginatedResponse<Category> | Category[]>>(
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

  static async getById(id: string): Promise<Category> {
    const response = await apiClient.get<BackendResponse<Category>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  static async create(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<BackendResponse<Category>>(this.BASE_PATH, data);
    return response.data.data;
  }

  static async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.patch<BackendResponse<Category>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}

