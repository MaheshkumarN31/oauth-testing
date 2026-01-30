import { $fetch } from './fetch'

interface Workspace {
  id: string
  name: string
  company_id?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

interface WorkspacesPayload {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

/**
 * Fetch all workspaces for the authenticated user
 */

export const fetchWorkspacesAPI = async (
  payload?: WorkspacesPayload,
): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await $fetch.get('/api/workspaces/', payload || {})
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Fetch workspace by ID
 */
export const getWorkspaceByIdAPI = async (
  workspaceId: string,
): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await $fetch.get(`/api/workspaces/${workspaceId}`)
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Create new workspace
 */
export const createWorkspaceAPI = async (payload: {
  name: string
  description?: string
  [key: string]: any
}): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await $fetch.post('/api/workspaces/', payload)
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Update workspace
 */
export const updateWorkspaceAPI = async ({
  workspaceId,
  payload,
}: {
  workspaceId: string
  payload: Partial<Workspace>
}): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await $fetch.put(`/api/workspaces/${workspaceId}`, payload)
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Delete workspace
 */
export const deleteWorkspaceAPI = async (workspaceId: string): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await $fetch.delete(`/api/workspaces/${workspaceId}`)
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Get workspace members
 */
export const getWorkspaceMembersAPI = async (
  workspaceId: string,
  queryParams?: { page?: number; limit?: number },
): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await $fetch.get(
      `/api/workspaces/${workspaceId}/members`,
      queryParams || {},
    )
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Add member to workspace
 */
export const addWorkspaceMemberAPI = async ({
  workspaceId,
  payload,
}: {
  workspaceId: string
  payload: { user_id: string; role?: string }
}): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await $fetch.post(
      `/api/workspaces/${workspaceId}/members`,
      payload,
    )
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Remove member from workspace
 */
export const removeWorkspaceMemberAPI = async ({
  workspaceId,
  userId,
}: {
  workspaceId: string
  userId: string
}): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await $fetch.delete(
      `/api/workspaces/${workspaceId}/members/${userId}`,
    )
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Update workspace member role
 */
export const updateWorkspaceMemberAPI = async ({
  workspaceId,
  userId,
  payload,
}: {
  workspaceId: string
  userId: string
  payload: { role: string }
}): Promise<any> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await $fetch.put(
      `/api/workspaces/${workspaceId}/members/${userId}`,
      payload,
    )
    return response
  } catch (err) {
    throw err
  }
}
