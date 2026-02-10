import { AlertCircle, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  fullScreen?: boolean
  className?: string
}

export function ErrorState({
  title = 'Error loading data',
  message = 'Please try again later',
  onRetry,
  fullScreen = false,
  className,
}: ErrorStateProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center gap-4 text-destructive',
        className,
      )}
    >
      <AlertCircle className="h-12 w-12" />
      <div className="text-center">
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">{content}</div>
    )
  }

  return content
}

export default ErrorState
