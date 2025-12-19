import { IHttpClient } from "@domain/shared/IHttpClient";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class HttpClientFetch implements IHttpClient {
  constructor(private readonly baseURL: string) {}

  private async request<T>(url: string, config?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...config,
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Network error", 0, error);
    }
  }

  async get<T>(url: string, config?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  async post<T>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}
