import { $fetch } from './fetch'

/**
 * Get all workflows for a company
 * GET /api/workflows?company_id=...
 */
export const getWorkflowsAPI = async ({
  company_id,
}: {
  company_id: string
}): Promise<any> => {
  try {
    const response = await $fetch.get('/api/workflows', { company_id })
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Create a new workflow
 * POST /api/workflows
 */
export const createWorkflowAPI = async (payload: {
  name: string
  company_id: string
  template_id: string
  [key: string]: any
}): Promise<any> => {
  try {
    const response = await $fetch.post('/api/workflows', payload)
    return response
  } catch (err) {
    throw err
  }
}
