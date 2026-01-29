// ========================================
// Workspaces API
// ========================================

import { apiGet } from './client'
import type { Workspace, ApiResponse } from '@/types'

/**
 * Fetch all workspaces for the authenticated user
 */
export async function fetchWorkspaces(): Promise<ApiResponse<Array<Workspace>>> {
    return apiGet<ApiResponse<Array<Workspace>>>('/api/workspaces/')
}
