import { SendDocumentScreen } from '@/components/features/documents'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/documents_/send')({
    component: SendDocumentScreen,
})


