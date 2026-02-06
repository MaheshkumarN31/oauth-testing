import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchUserTypesAPI,
    createUserTypeAPI,
    updateUserTypeAPI,
    deleteUserTypeAPI,
    type UserType,
    type UserTypesPayload,
    type CreateUserTypePayload,
    type UpdateUserTypePayload,
} from '@/services/api/user-types'
import { toast } from 'sonner'

export const USER_TYPES_QUERY_KEY = ['user-types']

/**
 * Fetch all user types
 */
export function useUserTypes(payload?: UserTypesPayload) {
    return useQuery({
        queryKey: [...USER_TYPES_QUERY_KEY, payload],
        queryFn: async () => {
            if (!payload?.company_id) return []
            const response = await fetchUserTypesAPI(payload)
            // Normalize response
            let data = []
            if (Array.isArray(response?.data?.data)) data = response.data.data
            else if (Array.isArray(response?.data)) data = response.data
            else if (Array.isArray(response)) data = response

            return data.map((t: any) => ({
                ...t,
                id: t.id || t._id || String(Math.random()),
            }))
        },
        enabled: !!payload?.company_id,
    })
}

/**
 * Create new user type
 */
export function useCreateUserType() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateUserTypePayload) => createUserTypeAPI(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_TYPES_QUERY_KEY })
            toast.success('User type created successfully!')
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || error.message || 'Failed to create user type')
        },
    })
}

/**
 * Update user type
 */
export function useUpdateUserType() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            userTypeId,
            payload,
        }: {
            userTypeId: string
            payload: UpdateUserTypePayload
        }) => updateUserTypeAPI({ userTypeId, payload }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_TYPES_QUERY_KEY })
            toast.success('User type updated successfully')
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || error.message || 'Failed to update user type')
        },
    })
}

/**
 * Delete user type
 */
export function useDeleteUserType() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (userTypeId: string) => deleteUserTypeAPI(userTypeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_TYPES_QUERY_KEY })
            toast.success('User type deleted successfully')
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || error.message || 'Failed to delete user type')
        },
    })
}
