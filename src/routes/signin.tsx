import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { initiateOAuthLogin } from '@/services/api'

export const Route = createFileRoute('/signin')({
  component: SignIn,
})

function SignIn() {
  const { isLoading, isError, refetch } = useQuery({
    queryKey: ['getOauthUrl'],
    queryFn: initiateOAuthLogin,
    enabled: false,
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-xl rounded-2xl px-10 py-12 w-full max-w-md text-center border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome to Esigns
        </h1>
        <p className="text-slate-500 mb-8">
          Sign in to manage your documents securely
        </p>

        {isError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm">❌ Failed to get auth URL</p>
          </div>
        )}

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-white font-medium py-3.5 px-6 rounded-xl shadow-lg disabled:opacity-50 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Redirecting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🔐 Login with Esigns
            </span>
          )}
        </button>

        <p className="mt-6 text-xs text-slate-400">
          Powered by secure OAuth 2.0 authentication
        </p>
      </div>
    </div>
  )
}
