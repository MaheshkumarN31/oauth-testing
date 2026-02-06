import { $fetch } from './fetch'

export interface UserType {
    id: string
    name: string
    description?: string
    permissions: string[]
    company_id: string
    created_at: string
    updated_at?: string
}

export interface UserTypesPayload {
    company_id: string
    page?: number
    limit?: number
    search?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
}

export interface CreateUserTypePayload {
    name: string
    description?: string
    permissions?: string[]
    company_id?: string
}

export interface UpdateUserTypePayload {
    name?: string
    description?: string
    permissions?: string[]
}

/**
 * Fetch all user types
 * Endpoint: GET /api/user_types/v2
 */
export const fetchUserTypesAPI = async (payload: UserTypesPayload): Promise<any> => {
    try {
        const response = await $fetch.get('/api/user_types/v2', payload)
        return response
    } catch (err) {
        throw err
    }
}

/**
 * Create a new user type
 * Endpoint: POST /api/user_types/v2
 */
export const createUserTypeAPI = async (payload: CreateUserTypePayload): Promise<any> => {
    try {
        const response = await $fetch.post('/api/user_types/v2', payload)
        return response
    } catch (err) {
        throw err
    }
}

/**
 * Update a user type
 * Endpoint: PUT /api/user_types/v2/:id
 */
export const updateUserTypeAPI = async ({
    userTypeId,
    payload,
}: {
    userTypeId: string
    payload: UpdateUserTypePayload
}): Promise<any> => {
    try {
        const response = await $fetch.put(`/api/user_types/v2/${userTypeId}`, payload)
        return response
    } catch (err) {
        throw err
    }
}

/**
 * Delete a user type
 * Endpoint: DELETE /api/user_types/v2/:id
 */
export const deleteUserTypeAPI = async (userTypeId: string): Promise<any> => {
    try {
        const response = await $fetch.delete(`/api/user_types/v2/${userTypeId}`)
        return response
    } catch (err) {
        throw err
    }
}

/**
 * Get user type by ID
 * Endpoint: GET /api/user_types/v2/:id
 */
export const getUserTypeByIdAPI = async (userTypeId: string): Promise<any> => {
    try {
        const response = await $fetch.get(`/api/user_types/v2/${userTypeId}`)
        return response
    } catch (err) {
        throw err
    }
}
