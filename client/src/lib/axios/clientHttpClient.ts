/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined in environment variables');
}

const getCookieHeader = (): string => {
    // This works in both server and client contexts
    // On server: reads from headers cookie
    // On client: reads from document.cookie
    if (typeof document !== 'undefined') {
        return document.cookie;
    }
    return '';
};

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

export const clientHttpClient = {
    async get<T>(endpoint: string, options?: { params?: Record<string, unknown> }): Promise<{ data: T }> {
        const response = await axiosInstance.get(endpoint, { params: options?.params });
        return response.data;
    }
};