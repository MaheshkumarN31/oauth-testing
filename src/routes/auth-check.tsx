import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { validateToken } from '@/services/api'
import { LoadingSpinner } from '@/components/common'

export const Route = createFileRoute('/auth-check')({
  component: AuthCheckPage,
})

function AuthCheckPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>(
    'loading',
  )

  useEffect(() => {
    const checkToken = async () => {
      const result = await validateToken()
      if (result.valid) {
        console.log('✅ Token valid, user:', result.user)
        setStatus('valid')
      } else {
        console.error('❌ Token validation failed')
        setStatus('invalid')
      }
    }

    checkToken()
  }, [])

  useEffect(() => {
    if (status === 'invalid') {
      navigate({ to: '/signin', replace: true })
    }
  }, [status, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {status === 'loading' && (
        <LoadingSpinner message="🔐 Validating session..." />
      )}
      {status === 'valid' && (
        <LoadingSpinner message="✅ Access token is valid" />
      )}
    </div>
  )
}
