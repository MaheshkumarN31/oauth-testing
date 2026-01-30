
import { useQuery } from '@tanstack/react-query'
import type { Workspace } from '@/types'
import { fetchWorkspacesAPI } from '@/services/api'

export const WORKSPACES_QUERY_KEY = ['workspaces']

export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACES_QUERY_KEY,
    queryFn: async () => {
      const response = await fetchWorkspacesAPI()
      return response.data
    },
  })
}

export function getDefaultWorkspace(
  workspaces: Array<Workspace> | undefined,
): Workspace | null {
  return workspaces?.[0] ?? null
}
