/**
 * Utilitários de requisições HTTP
 */

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  request: async <T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.statusText,
          `Erro na requisição: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`Erro na requisição: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  get: async <T = any>(url: string, headers?: Record<string, string>): Promise<T> => {
    return api.request<T>(url, { method: 'GET', headers });
  },

  post: async <T = any>(
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> => {
    return api.request<T>(url, { method: 'POST', body, headers });
  },

  put: async <T = any>(
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> => {
    return api.request<T>(url, { method: 'PUT', body, headers });
  },

  delete: async <T = any>(url: string, headers?: Record<string, string>): Promise<T> => {
    return api.request<T>(url, { method: 'DELETE', headers });
  },

  patch: async <T = any>(
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> => {
    return api.request<T>(url, { method: 'PATCH', body, headers });
  },
};
