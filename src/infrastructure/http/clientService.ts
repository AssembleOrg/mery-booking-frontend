import apiClient from './apiClient';
import publicApiClient from './publicApiClient';

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  totalBooked: number;
  nextBooked: string | null;
  lastBooked: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tipo para respuesta del endpoint de búsqueda (solo campos básicos)
export interface ClientSearchResult {
  id: string;
  fullName: string;
  email: string;
  dni: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface CreateClientDto {
  fullName: string;
  email: string;
  phone: string;
}

export interface CreateClientPublicDto {
  fullName: string;
  email: string;
  phone: string;
  dni: string;
}

export interface CreateClientPublicResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  totalBooked: number;
  nextBooked: string | null;
  lastBooked: string | null;
  createdAt: string;
  updatedAt: string;
  isNew: boolean; // Indica si el cliente fue creado nuevo o ya existía
}

export interface UpdateClientDto {
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

export class ClientService {
  private static readonly BASE_PATH = '/clients';

  static async getAll(page?: number, limit?: number): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await apiClient.get<BackendResponse<Client[]>>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    
    const clientsArray = response.data.data;
    
    return {
      data: clientsArray,
      total: clientsArray.length,
    };
  }

  static async getById(id: string): Promise<Client> {
    const response = await apiClient.get<BackendResponse<Client>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  static async create(data: CreateClientDto): Promise<Client> {
    const response = await apiClient.post<BackendResponse<Client>>(this.BASE_PATH, data);
    return response.data.data;
  }

  static async update(id: string, data: UpdateClientDto): Promise<Client> {
    const response = await apiClient.patch<BackendResponse<Client>>(`${this.BASE_PATH}/${id}`, data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  // Método público (sin autenticación) para crear clientes
  static async createPublic(data: CreateClientPublicDto): Promise<CreateClientPublicResponse> {
    const response = await publicApiClient.post<BackendResponse<CreateClientPublicResponse>>(
      `${this.BASE_PATH}/public`,
      data
    );
    return response.data.data;
  }

  // Método público (sin autenticación) para buscar clientes
  static async search(name?: string): Promise<ClientSearchResult[]> {
    const params = new URLSearchParams();
    if (name) {
      params.append('name', name);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.BASE_PATH}/search?${queryString}` : `${this.BASE_PATH}/search`;

    const response = await publicApiClient.get<BackendResponse<ClientSearchResult[]>>(url);
    return response.data.data;
  }
}


