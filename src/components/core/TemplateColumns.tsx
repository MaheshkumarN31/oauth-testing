import { FileText, Users, Send } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

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
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const template = row.original

            const handleSend = () => {
                const userId = localStorage.getItem('user_id') || ''
                const companyId = template.company_id || localStorage.getItem('company_id') || ''
                // Navigate to contact selection screen
                window.location.href = `/documents/create-from-template?template_id=${template._id}&user_id=${userId}&company_id=${companyId}`
            }

            return (
                <button
                    onClick={handleSend}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <Send className="h-4 w-4" />
                    Send
                </button>
            )
        },
    },
]
