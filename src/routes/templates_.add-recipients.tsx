import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/MainLayout'
import { AddRecipientsContent } from '@/components/features/templates'

export const Route = createFileRoute('/templates_/add-recipients')({
  component: AddRecipientsPage,
})

function AddRecipientsPage() {
  return (
    <MainLayout>
      {({ selectedWorkspace }) => (
        <AddRecipientsContent selectedWorkspace={selectedWorkspace} />
      )}
    </MainLayout>
  )
}
