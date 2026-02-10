import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getContactTypesAPI,
    createContactTypeAPI,
    deleteContactTypeAPI,
    type CreateContactTypePayload
} from '@/services/api/contact-types'
import { toast } from 'sonner'

export const CONTACT_TYPES_QUERY_KEY = 'contact-types'

export function useContactTypes(companyId: string) {
    return useQuery({
        queryKey: [CONTACT_TYPES_QUERY_KEY, companyId],
        queryFn: async () => {
            if (!companyId) return []
            const response = await getContactTypesAPI(companyId)
            console.log('DEBUG: Contact Types Response:', response)
            // Handle various response structures
            // Case 1: response.data.data (standard)
            // if (Array.isArray(response?.data?.data)) return response.data.data
            // Case 2: response.data (direct array)
            if (Array.isArray(response?.data)) return response.data
            // Case 3: response (direct array)
            if (Array.isArray(response)) return response

            return []
        },
        enabled: !!companyId,
    })
}

export function useCreateContactType() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateContactTypePayload) => createContactTypeAPI(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONTACT_TYPES_QUERY_KEY] })
            toast.success('Contact type created successfully')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create contact type')
        },
    })
}

export function useDeleteContactType() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteContactTypeAPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONTACT_TYPES_QUERY_KEY] })
            toast.success('Contact type deleted successfully')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete contact type')
        },
    })
}
