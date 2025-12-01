import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  };
}

// Formato de respuesta del backend (envuelto)
interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<BackendResponse<AuthResponse>>(
      `${BASE_URL}/auth/login`,
      credentials
    );
    // Extraer el data del wrapper del backend
    return response.data.data;
  }
}

