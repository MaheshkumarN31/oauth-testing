import { FileText, Users } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'

export const TemplateColumns: Array<ColumnDef<any>> = [
    {
        accessorKey: 'title',
        header: 'Template Name',
        cell: ({ getValue }) => (
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-500" />
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
        accessorKey: 'document_users',
        header: 'Recipients',
        cell: ({ getValue }) => {
            const users = getValue() as Array<any> || []
            const count = users.length

            return (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                        {count} {count === 1 ? 'recipient' : 'recipients'}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Created',
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
    {
        accessorKey: 'is_published',
        header: 'Status',
        cell: ({ getValue }) => {
            const isPublished = getValue() as boolean

            return (
                <Badge
                    variant={isPublished ? 'default' : 'outline'}
                    className={isPublished
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20'
                    }
                >
                    {isPublished ? 'Published' : 'Draft'}
                </Badge>
            )
        },
    },
]
