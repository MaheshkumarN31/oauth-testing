// ========================================
// Templates Query Hook
// ========================================

import { useQuery } from '@tanstack/react-query'
import { fetchTemplatesAPI } from '@/services/api'

export const TEMPLATES_QUERY_KEY = 'templates'

interface UseTemplatesOptions {
  companyId: string | undefined
  page: number
  pageSize: number
  enabled?: boolean
}

/**
 * Hook to fetch templates with pagination
 */
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
      return fetchTemplatesAPI({ company_id: companyId, page: page + 1, limit: pageSize })
    },
    enabled: enabled && !!companyId,
  })
}
