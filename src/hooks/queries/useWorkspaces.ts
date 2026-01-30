// ========================================
// Workspaces Query Hook
// ========================================

import { useQuery } from '@tanstack/react-query'
import type { Workspace } from '@/types'
import { fetchWorkspacesAPI } from '@/services/api'

export const WORKSPACES_QUERY_KEY = ['workspaces']

/**
 * Hook to fetch and manage workspaces
 * Replaces duplicated useQuery logic from dashboard.tsx, templates.tsx, addTemplateRecipients.tsx
 */
export function useWorkspaces() {
    return useQuery({
        queryKey: WORKSPACES_QUERY_KEY,
        queryFn: async () => {
            const response = await fetchWorkspacesAPI()
            return response.data
        },
    })
}

/**
 * Get the first workspace as default
 */
export function getDefaultWorkspace(workspaces: Array<Workspace> | undefined): Workspace | null {
    return workspaces?.[0] ?? null
}
