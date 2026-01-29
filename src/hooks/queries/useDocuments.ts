// ========================================
// Documents Query Hook
// ========================================

import { useQuery } from '@tanstack/react-query'
import { fetchDocuments } from '@/services/api'

export const DOCUMENTS_QUERY_KEY = 'documents'

interface UseDocumentsOptions {
    companyId: string | undefined
    page: number
    pageSize: number
    enabled?: boolean
}

/**
 * Hook to fetch documents with pagination
 */
export function useDocuments({ companyId, page, pageSize, enabled = true }: UseDocumentsOptions) {
    return useQuery({
        queryKey: [DOCUMENTS_QUERY_KEY, companyId, page, pageSize],
        queryFn: async () => {
            if (!companyId) throw new Error('No company ID provided')
            return fetchDocuments(companyId, page + 1, pageSize)
        },
        enabled: enabled && !!companyId,
    })
}

/**
 * Calculate document statistics from fetched documents
 */
export function calculateDocumentStats(documents: Array<{ document_status: string }> | undefined) {
    if (!documents) {
        return { total: 0, pending: 0, completed: 0, draft: 0 }
    }

    return {
        total: documents.length,
        pending: documents.filter((d) => d.document_status === 'INPROGRESS').length,
        completed: documents.filter((d) => d.document_status === 'COMPLETED').length,
        draft: documents.filter((d) => d.document_status === 'DRAFT').length,
    }
}
