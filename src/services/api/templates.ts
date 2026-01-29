// ========================================
// Templates API
// ========================================

import { apiGet, apiPost, uploadToPresignedUrl } from './client'
import type { TemplatesResponse, ApiResponse, PresignedUrlResponse } from '@/types'

/**
 * Fetch templates for a workspace with pagination
 */
export async function fetchTemplates(
    companyId: string,
    page: number = 1,
    limit: number = 10
): Promise<TemplatesResponse> {
    return apiGet<TemplatesResponse>(
        `/api/company-document-responses-v2?company_id=${companyId}&page=${page}&limit=${limit}`
    )
}

/**
 * Get presigned URLs for file uploads
 */
export async function getPresignedUrls(
    filenames: Array<string>,
    companyId: string
): Promise<ApiResponse<PresignedUrlResponse>> {
    return apiPost<ApiResponse<PresignedUrlResponse>>(
        '/api/documents-templates/processed-files',
        { filenames, company_id: companyId }
    )
}

/**
 * Upload a file to S3 using presigned URL
 */
export async function uploadFileToS3(
    file: File,
    presignedUrl: string
): Promise<boolean> {
    return uploadToPresignedUrl(presignedUrl, file)
}

/**
 * Upload multiple files and return results
 */
export async function uploadMultipleFiles(
    files: Array<File>,
    uploadUrls: Array<string>,
    onProgress?: (index: number, status: 'uploading' | 'success' | 'error') => void
): Promise<Array<{ success: boolean; error?: string }>> {
    const results = await Promise.all(
        files.map(async (file, index) => {
            onProgress?.(index, 'uploading')
            try {
                await uploadFileToS3(file, uploadUrls[index])
                onProgress?.(index, 'success')
                return { success: true }
            } catch (error) {
                onProgress?.(index, 'error')
                return { success: false, error: (error as Error).message }
            }
        })
    )
    return results
}
