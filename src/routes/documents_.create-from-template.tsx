import { CreateDocumentFromTemplate } from '@/components/features/documents'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/documents_/create-from-template')({
  component: CreateDocumentFromTemplate,
})


