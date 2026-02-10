
import { useQuery } from '@tanstack/react-query'
import { getAllTemplatesAPI } from '@/services/api'

export const TEMPLATES_QUERY_KEY = 'templates'

interface UseTemplatesOptions {
  companyId: string | undefined
  page: number
  pageSize: number
  enabled?: boolean
}

export function useTemplates({
  companyId,
  page,
  pageSize,
  enabled = true,
}: UseTemplatesOptions) {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY, companyId, page, pageSize],
    queryFn: async () => {
      if (!companyId) throw new Error('No company ID provided')
      const response = await getAllTemplatesAPI({
        company_id: companyId,
        status: 'ACTIVE',
        order_by: 'created_at',
        order_type: 'desc',
      })
      // Return the data array from response
      // API returns: { success: true, message: "...", data: [...] }
      return {
        data: response.data?.data || [],
        total: response.data?.data?.length || 0,
      }
    },
    enabled: enabled && !!companyId,
  })
}
