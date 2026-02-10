import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { WorkflowsContent } from '@/components/features/workflows'

export const Route = createFileRoute('/workflows')({
  validateSearch: z.object({
    user_id: z.string(),
  }),
  component: WorkflowsPage,
})

function WorkflowsPage() {
  return (
    <MainLayout>
      {({ selectedWorkspace }) => (
        <WorkflowsContent selectedWorkspace={selectedWorkspace} />
      )}
    </MainLayout>
  )
}
