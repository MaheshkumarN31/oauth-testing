// ========================================
// Documents API
// ========================================

import { apiGet } from './client'
import type { DocumentsResponse } from '@/types'

/**
 * Fetch documents for a workspace with pagination
 */
export async function fetchDocuments(
    companyId: string,
    page: number = 1,
    limit: number = 10
): Promise<DocumentsResponse> {
    return apiGet<DocumentsResponse>(
        `/api/company-document-responses-v2?company_id=${companyId}&page=${page}&limit=${limit}`
    )
}
