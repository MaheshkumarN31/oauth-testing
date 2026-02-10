import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { WorkflowSuccessContent } from '@/components/features/workflows'

export const Route = createFileRoute('/workflows_/$workflowId/success')({
  validateSearch: z.object({
    user_id: z.string().optional(),
    workflow_name: z.string().optional(),
  }),
  component: WorkflowSuccessPage,
})

function WorkflowSuccessPage() {
  const { workflow_name } = Route.useSearch()

  return (
    <MainLayout>
      {() => (
        <WorkflowSuccessContent workflowName={workflow_name} />
      )}
    </MainLayout>
  )
}
