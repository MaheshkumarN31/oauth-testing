
const BASE_URL = import.meta.env.VITE_PUBLIC_URL

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}


export function setAccessToken(token: string): void {
  localStorage.setItem('access_token', token)
}

export function removeAccessToken(): void {
  localStorage.removeItem('access_token')
}


function getAuthHeaders(): HeadersInit {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}


export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new ApiError('No access token found', 401)

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new ApiError(
      `Request failed: ${response.statusText}`,
      response.status,
    )
  }

  return response.json()
}


export async function apiPost<T>(
  endpoint: string,
  body: unknown,
  options?: { contentType?: string },
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
    body:
      options?.contentType === 'application/json' || !options?.contentType
        ? JSON.stringify(body)
        : (body as BodyInit),
  })

  if (!response.ok) {
    throw new ApiError(
      `Request failed: ${response.statusText}`,
      response.status,
    )
  }

  return response.json()
}


export async function apiPostPublic<T>(
  endpoint: string,
  body: URLSearchParams | string,
  contentType: string = 'application/x-www-form-urlencoded',
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


export async function uploadToPresignedUrl(
  presignedUrl: string,
  file: File,
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
