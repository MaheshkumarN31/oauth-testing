// src/routes/signin.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/signin')({
  component: SignIn,
})

function SignIn() {
  const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID
  const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI
  const responseType = import.meta.env.VITE_OAUTH_RESPONSE_TYPE
  const scope = import.meta.env.VITE_OAUTH_SCOPE
  const state = import.meta.env.VITE_OAUTH_STATE

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['getOauthUrl'],
    queryFn: async () => {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope: scope,
        state: state,
      })

      const res = await fetch(
        `https://v2-dev-api.esigns.io/v1.0/oauth/authorize?${params.toString()}`,
      )
      if (!res.ok) throw new Error('Failed to fetch OAuth URL')
      return res.json()
    },
    enabled: false,
  })

  // Redirect if backend gave a URL
  if (data?.url) {
    window.location.href = data.url
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl px-10 py-12 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome to Esigns
        </h1>

        {isError && (
          <p className="text-red-600 mb-4">❌ Failed to get auth URL</p>
        )}

        <p className="text-gray-600 mb-8">
          Please sign in with your OAuth provider to continue.
        </p>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 transition-colors text-white font-medium py-3 px-6 rounded-lg shadow-md disabled:opacity-50"
        >
          {isLoading ? 'Redirecting...' : '🔐 Login with Esigns'}
        </button>
      </div>
    </div>
  )
}
