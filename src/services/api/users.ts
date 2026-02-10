import { $fetch } from './fetch'
import type { User } from '@/types'

export interface UsersPayload {
    company_id: string
    page?: number
    limit?: number
    search?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    role?: string
}

export interface InviteUserPayload {
    name: string
    email: string
    role: string
    roles?: string[]
    first_name?: string
    last_name?: string
    user_type?: string[]
    user_type_id?: string
    company_id?: string
    permissions?: string[]
    workspaces?: string[]
    groups?: string[]
    departments?: string[]
    locations?: string[]
    branches?: string[]
    tags?: string[]
    workspace_ids?: string[]
    group_ids?: string[]
    department_ids?: string[]
    location_ids?: string[]
    branch_ids?: string[]
}

/**
 * Fetch all users
 * Endpoint: GET /api/users
 */
export const fetchUsersAPI = async (payload: UsersPayload): Promise<any> => {
    try {
        const response = await $fetch.get('/api/users', payload)
        return response
    } catch (err) {
        throw err
    }
}

/**
 * Invite a new user
 * Endpoint: POST /api/users
 */
export const inviteUserAPI = async (payload: InviteUserPayload): Promise<any> => {
    try {
        const response = await $fetch.post('/api/users', payload)
        return response
    } catch (err) {
        throw err
    }
}

/**
 * Update user details
 * Endpoint: PUT /api/users/:id
 */
export const updateUserAPI = async ({
    userId,
    payload,
}: {
    userId: string
    payload: Partial<User>
}): Promise<any> => {
    try {
        const response = await $fetch.put(`/api/users/${userId}`, payload)
        return response
    } catch (err) {
        throw err
    }
}

/**
 * Delete/Remove user from company
 * Endpoint: DELETE /api/users/:id
 */
export const deleteUserAPI = async (userId: string, company_id?: string): Promise<any> => {
    try {
        const response = await $fetch.delete(`/api/users/${userId}`, company_id ? { company_id } : undefined)
        return response
    } catch (err) {
        throw err
    }
}

/**
 * Get user by ID
 * Endpoint: GET /api/users/:id
 */
export const getUserByIdAPI = async (userId: string, company_id: string): Promise<any> => {
    try {
        const response = await $fetch.get(`/api/users/${userId}`, { company_id })
        return response
    } catch (err) {
        throw err
    }
}
