import { Tag, Trash2, Pencil } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { ContactType } from '@/services/api/contact-types'

interface ContactTypesColumnsProps {
    onDelete: (contactType: ContactType) => void
    onEdit: (contactType: ContactType) => void
}

export const createContactTypesColumns = ({
    onDelete,
    onEdit,
}: ContactTypesColumnsProps): Array<ColumnDef<ContactType>> => [
        {
            accessorKey: 'name',
            header: 'Contact Type Name',
            cell: ({ getValue, row }) => {
                const contactType = row.original
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Tag className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                                {getValue() as string}
                            </span>
                            {contactType.description && (
                                <span className="text-xs text-muted-foreground">
                                    {contactType.description}
                                </span>
                            )}
                        </div>
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
                const contactType = row.original

                // Only allow deletion of CUSTOM types
                if (contactType.type === 'SYSTEM') {
                    return (
                        <span className="text-xs text-muted-foreground italic">
                            System type
                        </span>
                    )
                }

                return (
                    <div className="flex gap-2 justify-end mr-4">
                        <button
                            onClick={() => onEdit(contactType)}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-600 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Edit contact type"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(contactType)}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 text-red-600 hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Delete contact type"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )
            },
        },
    ]
