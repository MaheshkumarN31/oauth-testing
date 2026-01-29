// ========================================
// Base API Client with Authentication
// ========================================

const BASE_URL = import.meta.env.VITE_PUBLIC_URL

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
    return localStorage.getItem('access_token')
}

/**
 * Set access token in localStorage
 */
export function setAccessToken(token: string): void {
    localStorage.setItem('access_token', token)
}

/**
 * Remove access token from localStorage
 */
export function removeAccessToken(): void {
    localStorage.removeItem('access_token')
}

/**
 * Get default headers with authorization
 */
function getAuthHeaders(): HeadersInit {
    const token = getAccessToken()
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    }
}

/**
 * API Error class for consistent error handling
 */
export class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

/**
 * GET request with authentication
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
    const token = getAccessToken()
    if (!token) throw new ApiError('No access token found', 401)

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    })

    if (!response.ok) {
        throw new ApiError(`Request failed: ${response.statusText}`, response.status)
    }

    return response.json()
}

/**
 * POST request with authentication
 */
export async function apiPost<T>(
    endpoint: string,
    body: unknown,
    options?: { contentType?: string }
): Promise<T> {
    const token = getAccessToken()
    if (!token) throw new ApiError('No access token found', 401)

    const headers: HeadersInit = {
        ...(options?.contentType
            ? { 'Content-Type': options.contentType }
            : { 'Content-Type': 'application/json' }),
        Authorization: `Bearer ${token}`,
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: options?.contentType === 'application/json' || !options?.contentType
            ? JSON.stringify(body)
            : body as BodyInit,
    })

    if (!response.ok) {
        throw new ApiError(`Request failed: ${response.statusText}`, response.status)
    }

    return response.json()
}

/**
 * POST request without authentication (for OAuth)
 */
export async function apiPostPublic<T>(
    endpoint: string,
    body: URLSearchParams | string,
    contentType: string = 'application/x-www-form-urlencoded'
): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': contentType,
        },
        body,
    })

    return response.json()
}

/**
 * Upload file to presigned URL (S3)
 */
export async function uploadToPresignedUrl(
    presignedUrl: string,
    file: File
): Promise<boolean> {
    const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        mode: 'cors',
    })

    if (!response.ok) {
        throw new ApiError(`Upload failed: ${response.status}`, response.status)
    }

    return true
}
