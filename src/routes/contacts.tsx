import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MainLayout } from '@/components/layout/MainLayout'
import { ContactsContent } from '@/components/features/contacts'

export const Route = createFileRoute('/contacts')({
    validateSearch: z.object({
        user_id: z.string(),
    }),
    component: ContactsPage,
})

function ContactsPage() {
    return (
        <MainLayout>
            {({ selectedWorkspace }) => (
                <ContactsContent selectedWorkspace={selectedWorkspace} />
            )}
        </MainLayout>
    )
}
