import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  /** Card title */
  title: string
  /** Value to display */
  value: number | string
  /** Icon component */
  icon: LucideIcon
  /** Gradient color class */
  colorClass?: string
}

/**
 * Reusable statistics card component
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  colorClass = 'bg-gradient-to-br from-blue-500 to-indigo-600',
}: StatCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`${colorClass} rounded-lg p-2`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

export default StatCard
