/* eslint-disable no-useless-catch */
import { $fetch } from './fetch'

interface OAuthUrlResponse {
  url: string
  state?: string
}

interface OAuthTokenResponse {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  user?: any
}

interface ValidateTokenResponse {
  valid: boolean
  user?: any
}

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
export const getOAuthUrl = async (): Promise<OAuthUrlResponse> => {
  try {
    const params = new URLSearchParams({
      client_id: ENV.clientId,
      redirect_uri: ENV.redirectUri,
      response_type: ENV.responseType,
      scope: ENV.scope,
      state: ENV.state,
    })

    const response = await $fetch.get(`/oauth/authorize?${params.toString()}`)
    return response.data
  } catch (err) {
    throw err
  }
}

/**
 * Exchange authorization code for access token
 */
export const exchangeToken = async (
  code: string,
): Promise<OAuthTokenResponse> => {
  try {
    const payload = new URLSearchParams({
      code,
      client_id: ENV.clientId,
      client_secret: ENV.clientSecret,
      redirect_uri: ENV.redirectUri,
      grant_type: 'authorization_code',
    })

    console.log(code, ENV, "payload")

    // Use fetch directly with proper headers
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://v2-dev-api.esigns.io/v1.0'
    const response = await fetch(`${baseURL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const rawData = await response.json()

    // Normalize data to match OAuthTokenResponse interface (snake_case)
    const data: OAuthTokenResponse = {
      access_token: rawData.access_token || rawData.accessToken,
      refresh_token: rawData.refresh_token || rawData.refreshToken,
      token_type: rawData.token_type || rawData.tokenType,
      expires_in: rawData.expires_in || rawData.expiresIn,
      user: rawData.user
    }

    // Store tokens in localStorage
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token)
    }
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return data
  } catch (err) {
    throw err
  }
}

/**
 * Validate current access token
 */
export const validateToken = async (): Promise<ValidateTokenResponse> => {
  try {
    const response = await $fetch.get('/oauth/protected1')
    return { valid: true, user: response.data }
  } catch (err) {
    return { valid: false }
  }
}

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<OAuthTokenResponse> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await $fetch.post('/oauth/refresh-token', {
      refresh_token: refreshToken,
    })

    // Update access token
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token)
    }

    return response.data
  } catch (err) {
    throw err
  }
}

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await $fetch.post('/oauth/logout')
  } catch (err) {
    // Continue with local logout even if API call fails
    console.error('Logout API error:', err)
  } finally {
    // Clear local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    // Clear indexedDB
    indexedDB.databases().then((databases) => {
      databases.forEach((db) => {
        if (db.name) indexedDB.deleteDatabase(db.name)
      })
    })
  }
}

/**
 * Redirect to OAuth login
 */
export const initiateOAuthLogin = async (): Promise<void> => {
  try {
    const data = await getOAuthUrl()
    if (data.url) {
      window.location.href = data.url
    }
  } catch (err) {
    throw err
  }
}

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  try {
    const response = await $fetch.get('/oauth/me')
    return response
  } catch (err) {
    throw err
  }
}