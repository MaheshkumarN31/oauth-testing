import { useQuery } from '@tanstack/react-query'
import { getContactsAPI } from '@/services/api'

export const CONTACTS_QUERY_KEY = 'contacts'

interface UseContactsOptions {
    companyId: string
    contactType?: string
    enabled?: boolean
}

export function useContacts({
    companyId,
    contactType,
    enabled = true,
}: UseContactsOptions) {
    return useQuery({
        queryKey: [CONTACTS_QUERY_KEY, companyId, contactType],
        queryFn: async () => {
            if (!companyId) throw new Error('No company ID provided')
            const response = await getContactsAPI({
                company_id: companyId,
                contact_type: contactType,
            })
            return response.data?.data || response.data || []
        },
        enabled: enabled && !!companyId,
    })
}
