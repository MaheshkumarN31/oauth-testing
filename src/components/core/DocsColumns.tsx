// DocsColumns.ts
import { CheckCircle2, Clock, Edit, FileText, Send } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'

const statusConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    icon: any
    className: string
  }
> = {
  completed: {
    label: 'Completed',
    variant: 'default',
    icon: CheckCircle2,
    className:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20',
  },
  pending: {
    label: 'Pending',
    variant: 'secondary',
    icon: Clock,
    className:
      'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20',
  },
  sent: {
    label: 'Sent',
    variant: 'outline',
    icon: Send,
    className:
      'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20',
  },
  draft: {
    label: 'Draft',
    variant: 'outline',
    icon: Edit,
    className:
      'bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20',
  },
}

export const DocsColumns: Array<ColumnDef<any>> = [
  {
    accessorKey: 'title',
    header: 'Document',
    cell: ({ getValue }) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
          <FileText className="h-4 w-4 text-indigo-500" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {getValue() as string}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'document_status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = (getValue() as string).toLowerCase() || 'draft'
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const config = statusConfig[status] || statusConfig.draft
      const Icon = config.icon

      return (
        <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Last Modified',
    cell: ({ getValue }) => {
      const date = getValue() as string
      if (!date) return <span className="text-muted-foreground">—</span>

      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      const formattedTime = new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })

      return (
        <div className="flex flex-col">
          <span className="text-sm text-foreground">{formattedDate}</span>
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>
      )
    },
  },
]
