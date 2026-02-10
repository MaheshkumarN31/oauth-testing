import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { WorkflowConfigureContent } from '@/components/features/workflows'

export const Route = createFileRoute('/workflows_/$workflowId/configure')({
  validateSearch: z.object({
    user_id: z.string().optional(),
  }),
  component: WorkflowConfigurePage,
})

function WorkflowConfigurePage() {
  const { workflowId } = Route.useParams()

  return (
    <MainLayout>
      {({ selectedWorkspace }) => (
        <WorkflowConfigureContent
          selectedWorkspace={selectedWorkspace}
          workflowId={workflowId}
        />
      )}
    </MainLayout>
  )
}
