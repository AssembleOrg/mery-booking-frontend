'use client';

import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let clientInstance: AxiosInstance | null = null;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null;
  }
}

function clearToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('accessToken');
  } catch {
    // Ignore errors
  }
}

function createClient(): AxiosInstance {
  if (clientInstance) {
    return clientInstance;
  }

  clientInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor para agregar token
  clientInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor para manejar errores
  clientInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token inválido o expirado
        clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return clientInstance;
}

export const apiClient = {
  getClient: (): AxiosInstance => {
    return createClient();
  },
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('accessToken', token);
    } catch {
      // Ignore errors
    }
  },
};

// Crear un objeto con getter para lazy initialization
const apiClientProxy = {} as AxiosInstance;

// Usar Proxy para interceptar todas las llamadas
const handler: ProxyHandler<AxiosInstance> = {
  get(_target, prop) {
    const client = createClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
};

// Default export para compatibilidad con código existente
export default new Proxy(apiClientProxy, handler);

