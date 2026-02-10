import { WorkspacesContent } from '@/components/features/workspaces'
import { z } from 'zod'

import MainLayout from '@/components/layout/MainLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workspaces')({
    validateSearch: z.object({
        user_id: z.string(),
    }),
    component: WorkspacesPage,
})

function WorkspacesPage() {
    return (
        <MainLayout>
            {({ selectedWorkspace }) => (
                <WorkspacesContent selectedWorkspace={selectedWorkspace} />
            )}
        </MainLayout>
    )
}
