// ========================================
// OAuth Authentication API
// ========================================

import { apiPostPublic, apiGet, setAccessToken } from './client'
import type { OAuthTokenResponse, OAuthUrlResponse } from '@/types'

const ENV = {
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
    clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
    redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    responseType: import.meta.env.VITE_OAUTH_RESPONSE_TYPE,
    scope: import.meta.env.VITE_OAUTH_SCOPE,
    state: import.meta.env.VITE_OAUTH_STATE,
}

/**
 * Get OAuth authorization URL
 */
export async function getOAuthUrl(): Promise<OAuthUrlResponse> {
    const params = new URLSearchParams({
        client_id: ENV.clientId,
        redirect_uri: ENV.redirectUri,
        response_type: ENV.responseType,
        scope: ENV.scope,
        state: ENV.state,
    })

    const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_URL}/oauth/authorize?${params.toString()}`
    )

    if (!response.ok) {
        throw new Error('Failed to fetch OAuth URL')
    }

    return response.json()
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeToken(code: string): Promise<OAuthTokenResponse> {
    const payload = new URLSearchParams({
        code,
        client_id: ENV.clientId,
        client_secret: ENV.clientSecret,
        redirect_uri: ENV.redirectUri,
        grant_type: 'authorization_code',
    })

    const data = await apiPostPublic<OAuthTokenResponse>('/oauth/token', payload)

    // Store the access token
    if (data.accessToken) {
        setAccessToken(data.accessToken)
    }

    return data
}

/**
 * Validate current access token
 */
export async function validateToken(): Promise<{ valid: boolean; user?: unknown }> {
    try {
        const user = await apiGet('/oauth/protected1')
        return { valid: true, user }
    } catch {
        return { valid: false }
    }
}

/**
 * Redirect to OAuth login
 */
export async function initiateOAuthLogin(): Promise<void> {
    const data = await getOAuthUrl()
    if (data?.url) {
        window.location.href = data.url
    }
}
