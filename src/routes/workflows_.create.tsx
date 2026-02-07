import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { CreateWorkflowContent } from '@/components/features/workflows'

export const Route = createFileRoute('/workflows_/create')({
  validateSearch: z.object({
    user_id: z.string(),
    workflow_name: z.string().optional(),
  }),
  component: CreateWorkflowPage,
})

function CreateWorkflowPage() {
  return (
    <MainLayout>
      {({ selectedWorkspace }) => (
        <CreateWorkflowContent selectedWorkspace={selectedWorkspace} />
      )}
    </MainLayout>
  )
}
