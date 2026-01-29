import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import Templates from '@/components/templates/templates'

export const Route = createFileRoute('/templates')({
  validateSearch: z.object({
    user_id: z.string(),
  }),
  component: Templates,
})
