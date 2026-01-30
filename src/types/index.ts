
export interface IAPIResponse {
  success: boolean
  status: number
  data: any
}

export interface ApiResponse<T = any> {
  success: boolean
  status?: number
  data: T
  message?: string
  error?: string
}


export interface OAuthUrlResponse {
  url: string
  state?: string
}

export interface OAuthTokenResponse {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  user?: User
}

export interface ValidateTokenResponse {
  valid: boolean
  user?: User
}


export interface User {
  id: string
  email: string
  name?: string
  role?: string
  company_id?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}


export interface Workspace {
  id: string
  _id?: string // For compatibility
  name: string
  type?: string
  status?: string
  description?: string
  company_id?: string
  owner_id?: string
  created_at?: string
  updated_at?: string
  members_count?: number
  documents_count?: number
  user_id?: string
  [key: string]: any
}

export interface WorkspacesResponse {
  workspaces: Array<Workspace>
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface WorkspaceMember {
  id: string
  user_id: string
  workspace_id: string
  role: string
  user?: User
  joined_at?: string
  [key: string]: any
}


export interface Document {
  id: string
  title: string
  content?: any
  company_id: string
  workspace_id?: string
  status?: 'draft' | 'published' | 'archived'
  template_id?: string
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export interface DocumentsResponse {
  documents: Array<Document>
  total: number
  page: number
  limit: number
  has_more: boolean
}


export interface Template {
  id: string
  name: string
  description?: string
  category?: string
  company_id: string
  content?: any
  thumbnail_url?: string
  is_public?: boolean
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export interface TemplatesResponse {
  templates: Array<Template>
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface PresignedUrlData {
  filename: string
  url: string
  file_key: string
  expires_at?: string
}

export interface PresignedUrlResponse {
  presigned_urls: Array<PresignedUrlData>
}

export interface UploadProgress {
  index: number
  status: 'uploading' | 'success' | 'error'
  progress?: number
}

export interface UploadResult {
  success: boolean
  filename?: string
  file_key?: string
  error?: string
}


export interface ContactType {
  id: string
  name: string
  company_id: string
  description?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export interface ContactTypesResponse {
  contact_types: Array<ContactType>
  total: number
}


export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface SearchParams {
  search?: string
}

export interface FilterParams
  extends PaginationParams,
  SortParams,
  SearchParams {
  [key: string]: any
}


export interface ErrorResponse {
  success: false
  status: number
  error: string
  message?: string
  error_code?: string
  details?: any
}

export interface SuccessResponse<T = any> {
  success: true
  status: number
  data: T
  message?: string
}

export type APIResponse<T = any> = SuccessResponse<T> | ErrorResponse


export type RecipientRole = 'signer' | 'viewer' | 'approver' | 'cc' | 'sender'

export interface Recipient {
  id: string
  name: string
  role: RecipientRole
  email?: string
  phone?: string
  [key: string]: any
}

export const ROLE_OPTIONS = [
  { label: 'Signer', value: 'signer' },
  { label: 'Viewer', value: 'viewer' },
  { label: 'Approver', value: 'approver' },
  { label: 'CC', value: 'cc' },
]

export type FileUploadStatusType =
  | 'uploading'
  | 'success'
  | 'error'
  | 'idle'
  | 'pending'

export interface FileUploadStatus {
  id?: string
  index?: number
  filename?: string
  status: FileUploadStatusType
  progress?: number
  error?: string
}
