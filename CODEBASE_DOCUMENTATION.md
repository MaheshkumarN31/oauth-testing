# OAuth Testing Application - Complete Codebase Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Types Layer](#types-layer-srctypes)
4. [API Services Layer](#api-services-layer-srcservicesapi)
5. [React Query Hooks](#react-query-hooks-srchooks)
6. [Common Components](#common-components-srccomponentscommon)
7. [Layout Components](#layout-components-srccomponentslayout)
8. [Feature Components](#feature-components-srccomponentsfeatures)
9. [Route Files](#route-files-srcroutes)
10. [UI Components](#ui-components-srccomponentsui)
11. [Utility Files](#utility-files)

---

## Project Overview

This is a React application built with:

- **Vite** - Build tool and dev server
- **TanStack Router** - File-based routing
- **TanStack React Query** - Server state management
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible UI primitives

The app implements OAuth 2.0 authentication flow and provides:

- Dashboard with document statistics
- Templates management with file upload
- Workspace switching

---

## Folder Structure

```
src/
├── main.tsx                 # Application entry point
├── styles.css              # Global styles and CSS variables
├── routeTree.gen.ts        # Auto-generated route tree
│
├── types/                  # Type definitions
│   └── index.ts
│
├── services/               # API layer
│   └── api/
│       ├── client.ts       # HTTP client
│       ├── auth.ts         # Auth APIs
│       ├── workspaces.ts   # Workspace APIs
│       ├── documents.ts    # Document APIs
│       ├── templates.ts    # Template APIs
│       └── index.ts        # Barrel export
│
├── hooks/                  # Custom React hooks
│   ├── use-mobile.ts       # Mobile detection
│   ├── index.ts
│   └── queries/            # React Query hooks
│       ├── useWorkspaces.ts
│       ├── useDocuments.ts
│       ├── useTemplates.ts
│       └── index.ts
│
├── components/
│   ├── ui/                 # Radix-based UI primitives
│   ├── common/             # Shared business components
│   ├── layout/             # Layout components
│   ├── features/           # Feature-specific components
│   └── core/               # Table and column components
│
├── routes/                 # TanStack Router files
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Entry redirect
│   ├── signin.tsx          # Login page
│   ├── callback.tsx        # OAuth callback
│   ├── auth-check.tsx      # Token validation
│   ├── dashboard.tsx       # Dashboard page
│   ├── templates.tsx       # Templates list
│   └── templates_.add-recipients.tsx
│
└── lib/
    └── utils.ts            # Utility functions
```

---

## Types Layer (`src/types/`)

### [index.ts](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/types/index.ts)

This file contains all shared TypeScript interfaces and types used throughout the application.

```typescript
// ========================================
// Workspace Types
// ========================================

export interface Workspace {
  _id: string // MongoDB ObjectID
  name: string // Display name ("Acme Corp")
  type: string // Workspace type ("business", "personal")
  status: string // Active/inactive status
  user_id: string // Owner's user ID
  application_theme: string // UI theme preference
  created_at: Date // Creation timestamp
  updated_at: Date // Last update timestamp
  plan_type: string // Subscription plan
  is_owner: boolean // Whether current user owns this workspace
  user_types: Array<UserType> // Available user roles in workspace
}

export interface UserType {
  user_type_id: string // Role identifier
  user_type_name: string // Role display name ("Admin", "Member")
}
```

**Why this exists**: Previously, `Workspace` and `UserType` were duplicated in 3 different component files. Centralizing prevents inconsistencies.

```typescript
// ========================================
// Document Types
// ========================================

export interface Document {
  _id: string
  document_name: string
  document_status: 'DRAFT' | 'INPROGRESS' | 'COMPLETED' | 'EXPIRED' | 'DECLINED'
  created_at: string
  updated_at: string
  company_id: string
  sender_name?: string // Optional - only in some views
  recipient_count?: number // Optional
}

// API response wrapper for paginated documents
export interface DocumentsResponse {
  data: Array<Document> // Array of documents
  total: number // Total count for pagination
  page: number // Current page number
  limit: number // Items per page
}
```

```typescript
// ========================================
// Recipient Types
// ========================================

// Union type restricts role to specific values
export type RecipientRole = 'signer' | 'approver' | 'viewer' | 'cc'

export interface Recipient {
  id: string // Client-generated unique ID
  name: string // Display name
  role: RecipientRole // One of the defined roles
  email?: string // Optional email
}

// Constant for role dropdown options
export const ROLE_OPTIONS: Array<{ value: RecipientRole; label: string }> = [
  { value: 'signer', label: 'Signer' },
  { value: 'approver', label: 'Approver' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'cc', label: 'CC' },
]
```

**Why `ROLE_OPTIONS` is here**: Keeps the constant with its related type. Components import both together.

```typescript
// ========================================
// File Upload Types
// ========================================

export type FileUploadStatusType = 'pending' | 'uploading' | 'success' | 'error'

export interface FileUploadStatus {
  file: File // Browser File object
  status: FileUploadStatusType // Current upload state
  progress?: number // Optional 0-100 progress
  error?: string // Error message if failed
}
```

```typescript
// ========================================
// API Response Types
// ========================================

// Generic wrapper for API responses
export interface ApiResponse<T> {
  data: T // The actual payload
  message?: string // Optional message
  success?: boolean // Success indicator
}

// S3 presigned URL response
export interface PresignedUrlResponse {
  upload_urls: Array<string> // URLs to PUT files to
  doc_paths: Array<string> // Paths where files will be stored
}

// OAuth token exchange response
export interface OAuthTokenResponse {
  accessToken: string // JWT access token
  refreshToken?: string // Optional refresh token
  user: {
    _id: string
    email: string
    name?: string
  }
}
```

---

## API Services Layer (`src/services/api/`)

### [client.ts](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/services/api/client.ts)

The base HTTP client that handles authentication and request management.

```typescript
// Environment variable - set in .env file
const BASE_URL = import.meta.env.VITE_PUBLIC_URL

// ========================================
// Token Management
// ========================================

// Retrieve token from browser storage
export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

// Store token after login
export function setAccessToken(token: string): void {
  localStorage.setItem('access_token', token)
}

// Clear token on logout
export function removeAccessToken(): void {
  localStorage.removeItem('access_token')
}
```

**Why localStorage**: Simple persistence that survives page refreshes. For production, consider HttpOnly cookies.

```typescript
// ========================================
// Request Helpers
// ========================================

// Build headers with auth token
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    // Spread operator adds Authorization only if token exists
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Custom error class with HTTP status
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
```

```typescript
// ========================================
// HTTP Methods
// ========================================

// GET request with authentication
export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new ApiError('No access token found', 401)

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new ApiError(
      `Request failed: ${response.statusText}`,
      response.status,
    )
  }

  return response.json() // Parse JSON and cast to type T
}

// POST request with authentication
export async function apiPost<T>(
  endpoint: string,
  body: unknown, // Accept any body shape
  options?: { contentType?: string },
): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new ApiError('No access token found', 401)

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': options?.contentType || 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new ApiError(
      `Request failed: ${response.statusText}`,
      response.status,
    )
  }

  return response.json()
}

// POST without auth - for OAuth token exchange
export async function apiPostPublic<T>(
  endpoint: string,
  body: URLSearchParams | string,
  contentType: string = 'application/x-www-form-urlencoded',
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  })
  return response.json()
}
```

**Why separate `apiPostPublic`**: OAuth endpoints don't require a token (we're getting the token!).

```typescript
// Direct S3 upload using presigned URL
export async function uploadToPresignedUrl(
  presignedUrl: string,
  file: File,
): Promise<boolean> {
  const response = await fetch(presignedUrl, {
    method: 'PUT', // S3 presigned URLs use PUT
    body: file, // File object as raw body
    mode: 'cors', // Cross-origin request to S3
  })

  if (!response.ok) {
    throw new ApiError(`Upload failed: ${response.status}`, response.status)
  }

  return true
}
```

---

### [auth.ts](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/services/api/auth.ts)

OAuth authentication functions.

```typescript
import { apiPostPublic, apiGet, setAccessToken } from './client'
import type { OAuthTokenResponse, OAuthUrlResponse } from '@/types'

// OAuth configuration from environment
const ENV = {
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
  clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
  redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  responseType: import.meta.env.VITE_OAUTH_RESPONSE_TYPE,
  scope: import.meta.env.VITE_OAUTH_SCOPE,
  state: import.meta.env.VITE_OAUTH_STATE,
}

// Step 1: Get authorization URL from server
export async function getOAuthUrl(): Promise<OAuthUrlResponse> {
  const params = new URLSearchParams({
    client_id: ENV.clientId,
    redirect_uri: ENV.redirectUri,
    response_type: ENV.responseType,
    scope: ENV.scope,
    state: ENV.state,
  })

  const response = await fetch(
    `${import.meta.env.VITE_PUBLIC_URL}/oauth/authorize?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error('Failed to fetch OAuth URL')
  }

  return response.json()
}

// Step 2: Exchange authorization code for tokens
export async function exchangeToken(code: string): Promise<OAuthTokenResponse> {
  const payload = new URLSearchParams({
    code, // From OAuth redirect
    client_id: ENV.clientId,
    client_secret: ENV.clientSecret,
    redirect_uri: ENV.redirectUri,
    grant_type: 'authorization_code', // OAuth 2.0 grant type
  })

  const data = await apiPostPublic<OAuthTokenResponse>('/oauth/token', payload)

  // Automatically store the token
  if (data.accessToken) {
    setAccessToken(data.accessToken)
  }

  return data
}

// Validate that current token is still valid
export async function validateToken(): Promise<{
  valid: boolean
  user?: unknown
}> {
  try {
    const user = await apiGet('/oauth/protected1') // Protected endpoint
    return { valid: true, user }
  } catch {
    return { valid: false }
  }
}

// Convenience function to start OAuth flow
export async function initiateOAuthLogin(): Promise<void> {
  const data = await getOAuthUrl()
  if (data?.url) {
    window.location.href = data.url // Redirect to OAuth provider
  }
}
```

**OAuth Flow**:

1. User clicks "Login" → `initiateOAuthLogin()`
2. Browser redirects to OAuth provider
3. User logs in, provider redirects to `/callback?code=xxx`
4. Callback page calls `exchangeToken(code)` → gets `accessToken`
5. Token stored, user redirected to dashboard

---

### [workspaces.ts](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/services/api/workspaces.ts)

```typescript
import { apiGet } from './client'
import type { Workspace, ApiResponse } from '@/types'

// Fetch all workspaces user has access to
export async function fetchWorkspaces(): Promise<
  ApiResponse<Array<Workspace>>
> {
  return apiGet<ApiResponse<Array<Workspace>>>('/api/workspaces/')
}
```

**Simplicity**: One function, one endpoint. The complexity is in the client.

---

### [documents.ts](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/services/api/documents.ts)

```typescript
import { apiGet } from './client'
import type { DocumentsResponse } from '@/types'

export async function fetchDocuments(
  companyId: string,
  page: number = 1, // Default to first page
  limit: number = 10, // Default 10 items per page
): Promise<DocumentsResponse> {
  return apiGet<DocumentsResponse>(
    `/api/company-document-responses-v2?company_id=${companyId}&page=${page}&limit=${limit}`,
  )
}
```

---

### [templates.ts](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/services/api/templates.ts)

```typescript
import { apiGet, apiPost, uploadToPresignedUrl } from './client'
import type {
  TemplatesResponse,
  ApiResponse,
  PresignedUrlResponse,
} from '@/types'

// Get templates list
export async function fetchTemplates(
  companyId: string,
  page: number = 1,
  limit: number = 10,
): Promise<TemplatesResponse> {
  return apiGet<TemplatesResponse>(
    `/api/company-document-responses-v2?company_id=${companyId}&page=${page}&limit=${limit}`,
  )
}

// Get S3 presigned URLs for file upload
export async function getPresignedUrls(
  filenames: Array<string>,
  companyId: string,
): Promise<ApiResponse<PresignedUrlResponse>> {
  return apiPost<ApiResponse<PresignedUrlResponse>>(
    '/api/documents-templates/processed-files',
    { filenames, company_id: companyId },
  )
}

// Upload single file to S3
export async function uploadFileToS3(
  file: File,
  presignedUrl: string,
): Promise<boolean> {
  return uploadToPresignedUrl(presignedUrl, file)
}

// Upload multiple files with progress callback
export async function uploadMultipleFiles(
  files: Array<File>,
  uploadUrls: Array<string>,
  onProgress?: (
    index: number,
    status: 'uploading' | 'success' | 'error',
  ) => void,
): Promise<Array<{ success: boolean; error?: string }>> {
  // Upload all files in parallel
  const results = await Promise.all(
    files.map(async (file, index) => {
      onProgress?.(index, 'uploading') // Notify upload started
      try {
        await uploadFileToS3(file, uploadUrls[index])
        onProgress?.(index, 'success') // Notify success
        return { success: true }
      } catch (error) {
        onProgress?.(index, 'error') // Notify failure
        return { success: false, error: (error as Error).message }
      }
    }),
  )
  return results
}
```

**Why `onProgress` callback**: Allows UI to update each file's status as it uploads.

---

## React Query Hooks (`src/hooks/`)

### [queries/useWorkspaces.ts](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/hooks/queries/useWorkspaces.ts)

```typescript
import { useQuery } from '@tanstack/react-query'
import { fetchWorkspaces } from '@/services/api'
import type { Workspace } from '@/types'

// Constant query key for caching
export const WORKSPACES_QUERY_KEY = ['workspaces']

export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACES_QUERY_KEY, // Cache key - same key = same cache
    queryFn: async () => {
      const response = await fetchWorkspaces()
      return response.data // Unwrap the ApiResponse
    },
  })
}

// Helper to get first workspace as default
export function getDefaultWorkspace(
  workspaces: Array<Workspace> | undefined,
): Workspace | null {
  return workspaces?.[0] ?? null // First item or null
}
```

**What React Query provides**:

- `data` - The fetched data
- `isLoading` - First load in progress
- `isFetching` - Any fetch in progress
- `isError` - Fetch failed
- `refetch()` - Manually re-fetch

---

### [queries/useDocuments.ts](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/hooks/queries/useDocuments.ts)

```typescript
import { useQuery } from '@tanstack/react-query'
import { fetchDocuments } from '@/services/api'

export const DOCUMENTS_QUERY_KEY = 'documents'

interface UseDocumentsOptions {
  companyId: string | undefined
  page: number
  pageSize: number
  enabled?: boolean
}

export function useDocuments({
  companyId,
  page,
  pageSize,
  enabled = true,
}: UseDocumentsOptions) {
  return useQuery({
    // Query key includes pagination params for separate caches per page
    queryKey: [DOCUMENTS_QUERY_KEY, companyId, page, pageSize],
    queryFn: async () => {
      if (!companyId) throw new Error('No company ID provided')
      return fetchDocuments(companyId, page + 1, pageSize) // API is 1-indexed
    },
    enabled: enabled && !!companyId, // Don't fetch if no company selected
  })
}

// Calculate stats from document array
export function calculateDocumentStats(
  documents: Array<{ document_status: string }> | undefined,
) {
  if (!documents) {
    return { total: 0, pending: 0, completed: 0, draft: 0 }
  }

  return {
    total: documents.length,
    pending: documents.filter((d) => d.document_status === 'INPROGRESS').length,
    completed: documents.filter((d) => d.document_status === 'COMPLETED')
      .length,
    draft: documents.filter((d) => d.document_status === 'DRAFT').length,
  }
}
```

**Why `enabled` option**: Prevents queries from running before we have the required data (workspace ID).

---

## Common Components (`src/components/common/`)

### [LoadingSpinner.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/components/common/LoadingSpinner.tsx)

```typescript
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'      // Size variant
  fullScreen?: boolean           // Fill entire screen
  message?: string               // Text below spinner
  className?: string             // Additional CSS classes
}

// Map size prop to Tailwind classes
const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  message = 'Loading...',
  className,
}: LoadingSpinnerProps) {
  // Core spinner element
  const spinner = (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <Loader2
        className={cn(
          'animate-spin text-indigo-500',  // Tailwind animation + color
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )

  // Wrap in full-screen container if needed
  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
```

**Why `cn()` utility**: Merges class names intelligently, handling Tailwind conflicts.

---

### [ErrorState.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/components/common/ErrorState.tsx)

```typescript
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void          // Optional retry handler
  fullScreen?: boolean
  className?: string
}

export function ErrorState({
  title = 'Error loading data',
  message = 'Please try again later',
  onRetry,
  fullScreen = false,
  className,
}: ErrorStateProps) {
  const content = (
    <div className={cn('flex flex-col items-center gap-4 text-destructive', className)}>
      <AlertCircle className="h-12 w-12" />
      <div className="text-center">
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      {/* Only show retry button if handler provided */}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}
```

---

### [PageHeader.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/components/common/PageHeader.tsx)

```typescript
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface PageHeaderProps {
  title: string                           // Main heading
  icon?: LucideIcon                       // Title icon component
  badge?: string                          // Badge text (workspace name)
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  actions?: ReactNode                     // Right-side actions (buttons)
  prefix?: ReactNode                      // Before title (back button)
}

export function PageHeader({
  title,
  icon: Icon,                              // Rename for JSX usage
  badge,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  actions,
  prefix,
}: PageHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 px-4">
        {/* Hamburger menu for sidebar */}
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Optional prefix (e.g., back button) */}
        {prefix}

        <div className="flex items-center gap-2">
          {/* Render icon if provided */}
          {Icon && <Icon className="h-5 w-5 text-indigo-500" />}
          <h1 className="text-lg font-semibold">{title}</h1>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
      </div>

      {/* Right side: search + actions */}
      <div className="ml-auto flex items-center gap-4 px-4">
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-8 h-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        )}
        {actions}
      </div>
    </header>
  )
}
```

**Why `icon: Icon` renaming**: Props are lowercase, but JSX components must be capitalized.

---

### [StatCard.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/components/common/StatCard.tsx)

```typescript
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  title: string                 // Card label
  value: number | string        // Main value to display
  icon: LucideIcon              // Icon component
  colorClass?: string           // Gradient background class
}

export function StatCard({
  title,
  value,
  icon: Icon,
  colorClass = 'bg-gradient-to-br from-blue-500 to-indigo-600',
}: StatCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`${colorClass} rounded-lg p-2`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
```

---

## Layout Components (`src/components/layout/`)

### [MainLayout.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/components/layout/MainLayout.tsx)

The main application layout using render props pattern.

```typescript
import { useEffect, useState, type ReactNode } from 'react'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { LoadingSpinner, ErrorState } from '@/components/common'
import { useWorkspaces, getDefaultWorkspace } from '@/hooks/queries'
import type { Workspace } from '@/types'

interface MainLayoutProps {
  // Render prop: receives workspace state and returns content
  children: (props: {
    selectedWorkspace: Workspace | null
    setSelectedWorkspace: (workspace: Workspace) => void
    workspaces: Array<Workspace>
  }) => ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  // Fetch workspaces using shared hook
  const { data: workspaces, isLoading, isError, refetch } = useWorkspaces()

  // Local state for selected workspace
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)

  // Auto-select first workspace when data loads
  useEffect(() => {
    if (workspaces && !selectedWorkspace) {
      setSelectedWorkspace(getDefaultWorkspace(workspaces))
    }
  }, [workspaces, selectedWorkspace])

  // Show loading while fetching
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading workspaces..." />
  }

  // Show error with retry option
  if (isError) {
    return (
      <ErrorState
        fullScreen
        title="Failed to load workspaces"
        message="Please check your connection and try again"
        onRetry={() => refetch()}
      />
    )
  }

  // Main layout structure
  return (
    <SidebarProvider>
      <AppSidebar
        workspaces={workspaces || []}
        selectedWorkspace={selectedWorkspace}
        setSelectedWorkspace={setSelectedWorkspace}
      />
      <SidebarInset>
        {/* Call children as function, passing workspace state */}
        {children({
          selectedWorkspace,
          setSelectedWorkspace,
          workspaces: workspaces || [],
        })}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

**Render Props Pattern**: Instead of passing children as elements, we pass a function that receives props. This allows the layout to share state with its content without prop drilling.

Usage:

```tsx
<MainLayout>
  {({ selectedWorkspace }) => (
    <DashboardContent selectedWorkspace={selectedWorkspace} />
  )}
</MainLayout>
```

---

## Feature Components (`src/components/features/`)

### [dashboard/DashboardContent.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/components/features/dashboard/DashboardContent.tsx)

```typescript
import { useState } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats } from './DashboardStats'
import { DocsColumns } from '@/components/core/DocsColumns'
import TanStackTable from '@/components/core/TanstackTable'
import { useDocuments, calculateDocumentStats } from '@/hooks/queries'
import type { Workspace } from '@/types'

interface DashboardContentProps {
  selectedWorkspace: Workspace | null
}

export function DashboardContent({ selectedWorkspace }: DashboardContentProps) {
  // Pagination state
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const companyId = selectedWorkspace?._id

  // Fetch documents with pagination
  const { data: documentsData, isLoading, isFetching } = useDocuments({
    companyId,
    page: pageIndex,
    pageSize,
  })

  // Calculate stats from current page data
  const stats = calculateDocumentStats(documentsData?.data)
  const totalDocs = documentsData?.total || 0
  const pageCount = Math.ceil(totalDocs / pageSize)

  return (
    <>
      {/* Page header with title and search */}
      <PageHeader
        title="Dashboard"
        icon={LayoutDashboard}
        badge={selectedWorkspace?.name || 'No workspace'}
        searchPlaceholder="Search documents..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex-1 space-y-6 p-6 overflow-auto">
        {/* Stats cards grid */}
        <DashboardStats
          total={totalDocs}
          pending={stats.pending}
          completed={stats.completed}
          draft={stats.draft}
        />

        {/* Documents table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="h-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Documents</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and track your documents
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TanStackTable
              data={documentsData?.data || []}
              columns={DocsColumns}
              pageIndex={pageIndex}
              pageSize={pageSize}
              pageCount={pageCount}
              totalCount={totalDocs}
              onPageChange={setPageIndex}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setPageIndex(0)   // Reset to first page on size change
              }}
              loading={isLoading || isFetching}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
```

---

### [templates/CreateTemplateDialog.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/components/features/templates/CreateTemplateDialog.tsx)

Dialog for creating templates with file upload (summarized - full file is ~200 lines).

Key parts:

```typescript
export function CreateTemplateDialog({ companyId, userId }: CreateTemplateDialogProps) {
  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Array<File>>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatuses, setUploadStatuses] = useState<Array<FileUploadStatus>>([])

  const handleCreateTemplate = async () => {
    // 1. Get presigned URLs from server
    const presignedData = await getPresignedUrls(filenames, companyId)

    // 2. Upload files to S3 in parallel
    const results = await uploadMultipleFiles(
      selectedFiles,
      presignedData.data.upload_urls,
      (index, status) => {
        // Update individual file status
        setUploadStatuses(prev =>
          prev.map((s, i) => (i === index ? { ...s, status } : s))
        )
      }
    )

    // 3. Navigate to recipient editor
    window.location.href = `/templates_/add-recipients?...`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Template</Button>
      </DialogTrigger>
      <DialogContent>
        {/* Template name input */}
        {/* FileUploadZone component */}
        {/* Submit button */}
      </DialogContent>
    </Dialog>
  )
}
```

---

## Route Files (`src/routes/`)

### [\_\_root.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/routes/__root.tsx)

The root layout wrapping all routes.

```typescript
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create React Query client
const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    // Provide React Query context to entire app
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        {/* Outlet renders child routes */}
        <Outlet />
      </div>
      {/* Dev tools - removed in production */}
      <TanStackRouterDevtools />
    </QueryClientProvider>
  ),
})
```

---

### [dashboard.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/routes/dashboard.tsx)

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardContent } from '@/components/features/dashboard'

export const Route = createFileRoute('/dashboard')({
  // Validate URL search params
  validateSearch: z.object({
    user_id: z.string(),
  }),
  component: DashboardPage,
})

function DashboardPage() {
  return (
    // Use MainLayout with render prop
    <MainLayout>
      {({ selectedWorkspace }) => (
        <DashboardContent selectedWorkspace={selectedWorkspace} />
      )}
    </MainLayout>
  )
}
```

**Why `validateSearch`**: Uses Zod to validate query parameters. If `user_id` is missing, navigation will fail.

---

### [callback.tsx](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/routes/callback.tsx)

OAuth callback handler.

```typescript
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { z } from 'zod'
import { exchangeToken } from '@/services/api'
import { LoadingSpinner } from '@/components/common'

export const Route = createFileRoute('/callback')({
  validateSearch: z.object({
    code: z.string(),   // OAuth authorization code
  }),
  component: CallbackPage,
})

function CallbackPage() {
  // Get code from URL
  const { code } = Route.useSearch()
  const navigate = useNavigate()

  // Exchange code for token
  const { data, isLoading, isError } = useQuery({
    queryKey: ['oauth-token', code],
    queryFn: () => exchangeToken(code),
    enabled: !!code,               // Only run if code exists
    refetchOnWindowFocus: false,   // Don't retry on tab focus
  })

  // Redirect after token obtained
  useEffect(() => {
    if (data?.accessToken) {
      console.log('✅ Token saved:', data.accessToken)
      setTimeout(() => {
        navigate({
          to: '/dashboard',
          search: { user_id: data?.user?._id || '' },
          replace: true,   // Replace history, can't go back
        })
      }, 1000)
    }
  }, [data, navigate])

  // Redirect to signin on error
  useEffect(() => {
    if (isError) {
      navigate({ to: '/signin', replace: true })
    }
  }, [isError, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {isLoading ? (
        <LoadingSpinner message="🔄 Authenticating..." />
      ) : isError ? (
        <p className="text-red-600 text-xl font-semibold">❌ Error occurred</p>
      ) : (
        <LoadingSpinner message="✅ Redirecting..." />
      )}
    </div>
  )
}
```

---

## Utility Files

### [lib/utils.ts](file:///c:/Users/mahes/Desktop/Actanos/oauth-testing/src/lib/utils.ts)

```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

// Utility to merge Tailwind classes intelligently
export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}
```

**What it does**:

- `clsx`: Conditionally joins class names
- `twMerge`: Deduplicates conflicting Tailwind classes

Example:

```typescript
cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6')
// Result: 'py-2 px-6 bg-blue-500' (px-6 wins over px-4)
```

---

## Environment Variables

Located in `.env`:

```bash
VITE_PUBLIC_URL=https://api.yourserver.com
VITE_OAUTH_CLIENT_ID=your_client_id
VITE_OAUTH_CLIENT_SECRET=your_client_secret
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/callback
VITE_OAUTH_RESPONSE_TYPE=code
VITE_OAUTH_SCOPE=openid profile email
VITE_OAUTH_STATE=random_state_string
```

**Important**: Variables prefixed with `VITE_` are exposed to the browser. Never put secrets here in production!

---

## Summary

This codebase follows these principles:

1. **Separation of Concerns**: API logic in services, UI in components, state in hooks
2. **DRY (Don't Repeat Yourself)**: Shared types, hooks, and components
3. **Single Responsibility**: Each file has one purpose
4. **Type Safety**: Full TypeScript coverage with strict types
5. **Composition**: Small components composed into larger features
