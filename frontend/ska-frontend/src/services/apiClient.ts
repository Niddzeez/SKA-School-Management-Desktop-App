import { API_BASE_URL } from '../config/api';

interface ApiErrorResponse {
    error: string;
}

export interface ApiRequestOptions {
    disableAuthRedirect?: boolean;
}

/**
 * Internal helper to handle all API requests
 */
async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    optionsConfig?: ApiRequestOptions
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('ska_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
        method,
        headers,
    };

    if (body !== undefined) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, options);

    if (response.status === 401) {
        if (token) {
            localStorage.removeItem('ska_token');
            if (!optionsConfig?.disableAuthRedirect) {
                window.location.replace('/login');
            }
        }
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const data = (await response.json()) as ApiErrorResponse;
        throw new Error(data.error || 'An unexpected error occurred');
    }

    return (await response.json()) as T;
}

/**
 * Centralized API client utility
 */
export const apiClient = {
    get: <T>(path: string, options?: ApiRequestOptions): Promise<T> =>
        request<T>('GET', path, undefined, options),

    post: <T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> =>
        request<T>('POST', path, body, options),

    patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> =>
        request<T>('PATCH', path, body, options),

    delete: <T>(path: string, options?: ApiRequestOptions): Promise<T> =>
        request<T>('DELETE', path, undefined, options),
};
