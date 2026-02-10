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
/**
 * Get workflow by ID
 * GET /api/workflows/:id
 */
export const getWorkflowByIdAPI = async (workflowId: string): Promise<any> => {
  try {
    const response = await $fetch.get(`/api/workflows/${workflowId}`)
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Create a workflow response
 * POST /api/workflows/:id/responses
 */
export const createWorkflowResponseAPI = async ({
  workflowId,
  payload,
}: {
  workflowId: string
  payload: any
}): Promise<any> => {
  try {
    const response = await $fetch.post(`/api/workflows/${workflowId}/responses`, payload)
    return response
  } catch (err) {
    throw err
  }
}

/**
 * Send a workflow response
 * POST /api/workflows/:workflow_id/responses/:id/send
 */
export const sendWorkflowResponseAPI = async ({
  workflowId,
  responseId,
}: {
  workflowId: string
  responseId: string
}): Promise<any> => {
  try {
    const response = await $fetch.post(`/api/workflows/${workflowId}/responses/${responseId}/send`)
    return response
  } catch (err) {
    throw err
  }
}
