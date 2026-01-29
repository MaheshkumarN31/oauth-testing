import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { TemplatesContent } from '@/components/features/templates'

export const Route = createFileRoute('/templates')({
  validateSearch: z.object({
    user_id: z.string(),
  }),
  component: TemplatesPage,
})

function TemplatesPage() {
  return (
    <MainLayout>
      {({ selectedWorkspace }) => (
        <TemplatesContent selectedWorkspace={selectedWorkspace} />
      )}
    </MainLayout>
  )
}
