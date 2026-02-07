import { useQuery } from '@tanstack/react-query'
import { getContactsAPI } from '@/services/api'

export const CONTACTS_QUERY_KEY = 'contacts'

interface UseContactsOptions {
    companyId: string
    contactType?: string
    enabled?: boolean
    limit?: number
}

export function useContacts({
    companyId,
    contactType,
    enabled = true,
    limit = 100,
}: UseContactsOptions) {
    return useQuery({
        queryKey: [CONTACTS_QUERY_KEY, companyId, contactType, limit],
        queryFn: async () => {
            if (!companyId) throw new Error('No company ID provided')
            const response = await getContactsAPI({
                company_id: companyId,
                contact_type: contactType,
                limit,
            })
            return response.data?.data || response.data || []
        },
        enabled: enabled && !!companyId,
    })
}
