import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Workspace } from '@/types'
import {
  fetchWorkspacesAPI,
  getWorkspaceByIdAPI,
  createWorkspaceAPI,
  updateWorkspaceAPI,
  deleteWorkspaceAPI,
  updateWorkspaceStatusAPI,
} from '@/services/api/workspaces'
import { toast } from 'sonner'

export const WORKSPACES_QUERY_KEY = ['workspaces']

/**
 * Fetch all workspaces
 */
export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACES_QUERY_KEY,
    queryFn: async () => {
      const response = await fetchWorkspacesAPI()
      console.log('DEBUG: Workspaces Response:', response)
      // Handle various response structures
      if (Array.isArray(response?.data?.data)) return response.data.data
      if (Array.isArray(response?.data)) return response.data
      if (Array.isArray(response)) return response
      return []
    },
  })
}

/**
 * Create new workspace
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      name: string
      description?: string
      website?: string
      size?: string
      industry_type?: string
      phone?: string
      email?: string
      address?: string
      entity_type?: string
      time_zone?: { name: string; offset: string }
    }) => createWorkspaceAPI(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY })
      toast.success('Workspace created successfully! 🎉')
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || error.message || 'Failed to create workspace')
    },
  })
}

/**
 * Fetch workspace by ID (for search)
 */
export function useWorkspaceById(workspaceId: string) {
  return useQuery({
    queryKey: [...WORKSPACES_QUERY_KEY, workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null
      const response = await getWorkspaceByIdAPI(workspaceId)
      return response?.data || response
    },
    enabled: !!workspaceId,
  })
}

/**
 * Update workspace (name, description, status)
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      payload,
    }: {
      workspaceId: string
      payload: { name?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' }
    }) => updateWorkspaceAPI({ workspaceId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY })
      toast.success('Workspace updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || error.message || 'Failed to update workspace')
    },
  })
}

/**
 * Update workspace status
 */
export function useUpdateWorkspaceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      status,
    }: {
      workspaceId: string
      status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    }) => updateWorkspaceStatusAPI({ workspaceId, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY })
      toast.success('Workspace status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update workspace status')
    },
  })
}

/**
 * Delete workspace
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workspaceId: string) => deleteWorkspaceAPI(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY })
      toast.success('Workspace deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete workspace')
    },
  })
}

/**
 * Get default workspace
 */
export function getDefaultWorkspace(
  workspaces: Array<Workspace> | undefined,
): Workspace | null {
  return workspaces?.[0] ?? null
}
