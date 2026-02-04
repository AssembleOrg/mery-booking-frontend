import publicApiClient from './publicApiClient';

// Formato de respuesta del backend
interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface TempReservation {
  id: string;
  employeeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  expiresAt: string; // ISO 8601
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  remainingSeconds?: number;
  preferenceId?: string | null;
  bookingId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTempReservationDto {
  employeeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  clientData: {
    fullName: string;
    email: string;
    phone: string;
    dni: string;
    notes?: string;
  };
  expirationMinutes?: number; // Opcional, default 15
  notes?: string;
}

export interface LinkPreferenceDto {
  preferenceId: string;
}

export class TempReservationService {
  private static readonly BASE_PATH = '/temp-reservations';

  /**
   * Crea una pre-reserva temporal que bloquea el slot
   */
  static async create(
    data: CreateTempReservationDto
  ): Promise<TempReservation> {
    const response = await publicApiClient.post<
      BackendResponse<TempReservation>
    >(this.BASE_PATH, data);
    return response.data.data;
  }

  /**
   * Obtiene el estado de una pre-reserva
   */
  static async getById(id: string): Promise<TempReservation> {
    const response = await publicApiClient.get<BackendResponse<TempReservation>>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data.data;
  }

  /**
   * Cancela una pre-reserva
   */
  static async cancel(id: string): Promise<void> {
    await publicApiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Vincula una preferencia de Mercado Pago a una pre-reserva
   */
  static async linkPreference(
    id: string,
    preferenceId: string
  ): Promise<TempReservation> {
    const response = await publicApiClient.patch<
      BackendResponse<TempReservation>
    >(`${this.BASE_PATH}/${id}/preference`, { preferenceId });
    return response.data.data;
  }
}
