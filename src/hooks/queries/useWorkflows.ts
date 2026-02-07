import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkflowsAPI, createWorkflowAPI, getWorkflowByIdAPI } from '@/services/api'
import { toast } from 'sonner'

export const WORKFLOWS_QUERY_KEY = 'workflows'

interface UseWorkflowsOptions {
  companyId: string | undefined
  enabled?: boolean
}

export function useWorkflows({ companyId, enabled = true }: UseWorkflowsOptions) {
  return useQuery({
    queryKey: [WORKFLOWS_QUERY_KEY, companyId],
    queryFn: async () => {
      if (!companyId) throw new Error('No company ID provided')
      const response = await getWorkflowsAPI({ company_id: companyId })
      return {
        data: response.data?.data || response.data || [],
        total: response.data?.data?.length || response.data?.length || 0,
      }
    },
    enabled: enabled && !!companyId,
  })
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWorkflowAPI,
    onSuccess: () => {
      toast.success('Workflow created successfully')
      queryClient.invalidateQueries({ queryKey: [WORKFLOWS_QUERY_KEY] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create workflow')
    },
  })
}

export function useWorkflow(workflowId: string, enabled = true) {
  return useQuery({
    queryKey: [WORKFLOWS_QUERY_KEY, workflowId],
    queryFn: async () => {
      const response = await getWorkflowByIdAPI(workflowId)
      return response.data?.data || response.data
    },
    enabled: enabled && !!workflowId,
  })
}
