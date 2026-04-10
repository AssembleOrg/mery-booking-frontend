'use client';

import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface TrackedRequest {
  method: string;
  url: string;
  statusCode?: number;
  timestamp: string;
  durationMs?: number;
  body?: unknown;
  response?: unknown;
}

const MAX_ENTRIES = 20;
const trackedRequests: TrackedRequest[] = [];
const startTimes = new WeakMap<InternalAxiosRequestConfig, number>();

export function getRecentRequests(): TrackedRequest[] {
  return [...trackedRequests];
}

function truncate(data: unknown): unknown {
  if (data === undefined || data === null) return undefined;
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  if (str && str.length > 500) return str.slice(0, 500) + '…';
  return data;
}

function pushEntry(entry: TrackedRequest) {
  trackedRequests.push(entry);
  if (trackedRequests.length > MAX_ENTRIES) {
    trackedRequests.shift();
  }
}

export function attachTracker(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    startTimes.set(config, Date.now());
    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config;
      const start = startTimes.get(config);

      pushEntry({
        method: (config.method || 'GET').toUpperCase(),
        url: config.url || '',
        statusCode: response.status,
        timestamp: new Date().toISOString(),
        durationMs: start ? Date.now() - start : undefined,
      });

      return response;
    },
    (error: AxiosError) => {
      const config = error.config;
      if (config) {
        const start = startTimes.get(config);

        pushEntry({
          method: (config.method || 'GET').toUpperCase(),
          url: config.url || '',
          statusCode: error.response?.status,
          timestamp: new Date().toISOString(),
          durationMs: start ? Date.now() - start : undefined,
          body: truncate(config.data),
          response: truncate(error.response?.data),
        });
      }

      return Promise.reject(error);
    },
  );
}
