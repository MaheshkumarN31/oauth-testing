import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/auth-check')({
  component: AuthCheckPage,
})

function AuthCheckPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>(
    'loading',
  )

  useEffect(() => {
    const validateAccessToken = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setStatus('invalid')
        return
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_PUBLIC_URL}/oauth/protected1`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!res.ok) throw new Error('Token invalid or expired')

        const user = await res.json()
        console.log('✅ Token valid, user:', user)

        setStatus('valid')
      } catch (err) {
        console.error('❌ Token validation failed:', err)
        setStatus('invalid')
      }
    }

    validateAccessToken()
  }, [])

  useEffect(() => {
    if (status === 'invalid') {
      navigate({ to: '/signin', replace: true })
    }
  }, [status])

  return (
    <div className="min-h-screen flex items-center justify-center text-lg font-medium text-gray-800">
      {status === 'loading' && '🔐 Validating session...'}
      {status === 'valid' && '✅ Access token is valid'}
    </div>
  )
}
