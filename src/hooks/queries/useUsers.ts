import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/types'
import {
    fetchUsersAPI,
    inviteUserAPI,
    updateUserAPI,
    deleteUserAPI,
    type UsersPayload,
    type InviteUserPayload,
} from '@/services/api/users'
import { toast } from 'sonner'

export const USERS_QUERY_KEY = ['users']

/**
 * Fetch all users
 */
export function useUsers(payload?: UsersPayload) {
    return useQuery({
        queryKey: [...USERS_QUERY_KEY, payload],
        queryFn: async () => {
            if (!payload?.company_id) return []
            const response = await fetchUsersAPI(payload)
            // Normalize response
            let data = []
            if (Array.isArray(response?.data?.data)) data = response.data.data
            else if (Array.isArray(response?.data)) data = response.data
            else if (Array.isArray(response)) data = response

            return data.map((u: any) => ({
                ...u,
                id: u.id || u._id || String(Math.random()),
            }))
        },
        enabled: !!payload?.company_id,
    })
}

/**
 * Invite new user
 */
export function useInviteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: InviteUserPayload) => inviteUserAPI(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
            toast.success('User invited successfully! 📧')
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || error.message || 'Failed to invite user')
        },
    })
}

/**
 * Update user
 */
export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, payload }: { userId: string; payload: Partial<User> }) =>
            updateUserAPI({ userId, payload }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
            toast.success('User updated successfully')
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || error.message || 'Failed to update user')
        },
    })
}

/**
 * Delete user
 */
export function useDeleteUser(companyId?: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (userId: string) => deleteUserAPI(userId, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
            toast.success('User removed successfully')
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || error.message || 'Failed to remove user')
        },
    })
}
