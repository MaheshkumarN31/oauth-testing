import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { UsersContent } from '@/components/features/users'

const usersSearchSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
})

export const Route = createFileRoute('/users')({
  validateSearch: (search) => usersSearchSchema.parse(search),
  component: UsersRoute,
})

function UsersRoute() {
  return (
    <MainLayout>
      {({ selectedWorkspace }) => (
        <UsersContent companyId={selectedWorkspace?.id || selectedWorkspace?._id} />
      )}
    </MainLayout>
  )
}
