import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardContent } from '@/components/features/dashboard'

export const Route = createFileRoute('/dashboard')({
  validateSearch: z.object({
    user_id: z.string(),
  }),
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <MainLayout>
      {({ selectedWorkspace }) => (
        <DashboardContent selectedWorkspace={selectedWorkspace} />
      )}
    </MainLayout>
  )
}
