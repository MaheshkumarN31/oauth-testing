import { ContactTypesContent } from '@/components/features/contact-types'
import { z } from 'zod'

import MainLayout from '@/components/layout/MainLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contact-types')({
    validateSearch: z.object({
        user_id: z.string(),
    }),
    component: ContactTypesPage,
})

function ContactTypesPage() {
    return (
        <MainLayout>
            {({ selectedWorkspace }) => (
                <ContactTypesContent selectedWorkspace={selectedWorkspace} />
            )}
        </MainLayout>
    )
}
