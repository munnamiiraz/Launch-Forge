/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { getAuthCookieHeader } from './getAuthCookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined in environment variables');
}

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Attach auth cookies to every outgoing request via custom header
axiosInstance.interceptors.request.use((config) => {
    const cookieHeader = getAuthCookieHeader();
    if (cookieHeader) {
        config.headers['x-auth-cookies'] = cookieHeader;
    }
    return config;
});

export const clientHttpClient = {
    async get<T>(endpoint: string, options?: { params?: Record<string, unknown> }): Promise<{ data: T }> {
        const response = await axiosInstance.get(endpoint, { params: options?.params });
        return response.data;
    }
};