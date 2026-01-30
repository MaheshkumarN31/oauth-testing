import { AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react'
import { StatCard } from '@/components/common'

interface DashboardStatsProps {
  total: number
  pending: number
  completed: number
  draft: number
}

const statsConfig = [
  {
    key: 'total',
    title: 'Total Documents',
    icon: FileText,
    colorClass: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  {
    key: 'pending',
    title: 'Pending',
    icon: Clock,
    colorClass: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  {
    key: 'completed',
    title: 'Completed',
    icon: CheckCircle2,
    colorClass: 'bg-gradient-to-br from-emerald-500 to-green-600',
  },
  {
    key: 'draft',
    title: 'Draft',
    icon: AlertCircle,
    colorClass: 'bg-gradient-to-br from-slate-500 to-gray-600',
  },
] as const

/**
 * Dashboard statistics cards grid
 */
export function DashboardStats({
  total,
  pending,
  completed,
  draft,
}: DashboardStatsProps) {
  const values = { total, pending, completed, draft }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => (
        <StatCard
          key={stat.key}
          title={stat.title}
          value={values[stat.key]}
          icon={stat.icon}
          colorClass={stat.colorClass}
        />
      ))}
    </div>
  )
}

export default DashboardStats
