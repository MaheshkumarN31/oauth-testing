import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Display as full screen centered */
  fullScreen?: boolean
  /** Loading message */
  message?: string
  /** Additional class name */
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

/**
 * Reusable loading spinner component
 * Replaces duplicated loading states across dashboard.tsx, templates.tsx, etc.
 */
export function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  message = 'Loading...',
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <Loader2
        className={cn('animate-spin text-indigo-500', sizeClasses[size])}
      />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">{spinner}</div>
    )
  }

  return spinner
}

export default LoadingSpinner
