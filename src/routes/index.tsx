import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/')({
  validateSearch: z.object({
    code: z.string().optional(),
  }),
  component: IndexRedirect,
})

function IndexRedirect() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  useEffect(() => {
    if (search.code) {
      navigate({
        to: '/callback',
        search: { code: search.code },
        replace: true,
      })
    } else {
      console.log('no code')
      navigate({ to: '/signin', replace: true })
    }
  }, [])

  return null
}
