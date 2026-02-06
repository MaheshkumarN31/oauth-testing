import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { UserTypesContent } from '@/components/features/user-types'

const userTypesSearchSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
})

export const Route = createFileRoute('/user-types')({
  validateSearch: (search) => userTypesSearchSchema.parse(search),
  component: UserTypesRoute,
})

function UserTypesRoute() {
  return (
    <MainLayout>
      {({ selectedWorkspace }) => (
        <UserTypesContent companyId={selectedWorkspace?.id || selectedWorkspace?._id} />
      )}
    </MainLayout>
  )
}
