import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { z } from 'zod'
import { exchangeToken } from '@/services/api'
import { LoadingSpinner } from '@/components/common'

export const Route = createFileRoute('/callback')({
  validateSearch: z.object({
    code: z.string(),
  }),
  component: CallbackPage,
})

function CallbackPage() {
  const { code } = Route.useSearch()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['oauth-token', code],
    queryFn: () => exchangeToken(code),
    enabled: !!code,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (data?.accessToken) {
      console.log('✅ Token saved:', data.accessToken)
      setTimeout(() => {
        navigate({
          to: '/dashboard',
          search: { user_id: data?.user?._id || '' },
          replace: true,
        })
      }, 1000)
    }
  }, [data, navigate])

  useEffect(() => {
    if (isError) {
      navigate({ to: '/signin', replace: true })
    }
  }, [isError, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {isLoading ? (
        <LoadingSpinner message="🔄 Authenticating..." />
      ) : isError ? (
        <p className="text-red-600 text-xl font-semibold">❌ Error occurred</p>
      ) : (
        <LoadingSpinner message="✅ Redirecting..." />
      )}
    </div>
  )
}
