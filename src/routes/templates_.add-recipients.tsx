import { createFileRoute } from '@tanstack/react-router'
import AddTemplateRecipients from '@/components/addTemplateRecipients'

export const Route = createFileRoute('/templates_/add-recipients')({
  component: AddTemplateRecipients,
})
