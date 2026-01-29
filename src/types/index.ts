// ========================================
// Centralized Type Definitions
// ========================================

// Workspace Types
export interface Workspace {
    _id: string
    name: string
    type: string
    status: string
    user_id: string
    application_theme: string
    created_at: Date
    updated_at: Date
    plan_type: string
    is_owner: boolean
    user_types: Array<UserType>
}

export interface UserType {
    user_type_id: string
    user_type_name: string
}

// Document Types
export interface Document {
    _id: string
    document_name: string
    document_status: 'DRAFT' | 'INPROGRESS' | 'COMPLETED' | 'EXPIRED' | 'DECLINED'
    created_at: string
    updated_at: string
    company_id: string
    sender_name?: string
    recipient_count?: number
}

export interface DocumentsResponse {
    data: Array<Document>
    total: number
    page: number
    limit: number
}

// Template Types
export interface Template {
    _id: string
    template_name: string
    created_at: string
    updated_at: string
    company_id: string
    doc_paths: Array<string>
    recipients: Array<Recipient>
}

export interface TemplatesResponse {
    data: Array<Template>
    total: number
    page: number
    limit: number
}

// Recipient Types
export type RecipientRole = 'signer' | 'approver' | 'viewer' | 'cc'

export interface Recipient {
    id: string
    name: string
    role: RecipientRole
    email?: string
}

export const ROLE_OPTIONS: Array<{ value: RecipientRole; label: string }> = [
    { value: 'signer', label: 'Signer' },
    { value: 'approver', label: 'Approver' },
    { value: 'viewer', label: 'Viewer' },
    { value: 'cc', label: 'CC' },
]

// File Upload Types
export type FileUploadStatusType = 'pending' | 'uploading' | 'success' | 'error'

export interface FileUploadStatus {
    file: File
    status: FileUploadStatusType
    progress?: number
    error?: string
}

// API Response Types
export interface ApiResponse<T> {
    data: T
    message?: string
    success?: boolean
}

export interface PresignedUrlResponse {
    upload_urls: Array<string>
    doc_paths: Array<string>
}

// Auth Types
export interface OAuthTokenResponse {
    accessToken: string
    refreshToken?: string
    user: {
        _id: string
        email: string
        name?: string
    }
}

export interface OAuthUrlResponse {
    url: string
}
