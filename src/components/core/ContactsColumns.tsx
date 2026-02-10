import { Mail, Edit, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { Contact } from '@/services/api/contacts'

interface ContactsColumnsProps {
    onEdit: (contact: Contact) => void
    onDelete: (contact: Contact) => void
}

export const createContactsColumns = ({
    onEdit,
    onDelete,
}: ContactsColumnsProps): Array<ColumnDef<Contact>> => [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => {
                const contact = row.original
                const fullName = `${contact.first_name} ${contact.last_name}`
                const initials = `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`

                return (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
                            {initials}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">{fullName}</span>
                            {contact.title && (
                                <span className="text-xs text-muted-foreground">
                                    {contact.title}
                                </span>
                            )}
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{getValue() as string}</span>
                </div>
            ),
        },
        {
            accessorKey: 'contact_types',
            header: 'Contact Types',
            cell: ({ getValue }) => {
                const contactTypes = (getValue() as any[]) || []
                const displayTypes = contactTypes.slice(0, 2)
                const remainingCount = contactTypes.length - 2

                return (
                    <div className="flex items-center gap-2 flex-wrap">
                        {displayTypes.map((ct, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                            >
                                {ct.contact_type?.name || 'Unknown'}
                            </Badge>
                        ))}
                        {remainingCount > 0 && (
                            <Badge
                                variant="outline"
                                className="bg-slate-100 text-slate-600 border-slate-200"
                            >
                                +{remainingCount} more
                            </Badge>
                        )}
                        {contactTypes.length === 0 && (
                            <span className="text-sm text-muted-foreground">—</span>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'phone_number',
            header: 'Phone',
            cell: ({ getValue }) => {
                const phone = getValue() as string
                return phone ? (
                    <span className="text-sm text-foreground">{phone}</span>
                ) : (
                    <span className="text-sm text-muted-foreground">—</span>
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
                const contact = row.original

                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(contact)}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-600 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Edit contact"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(contact)}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 text-red-600 hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Delete contact"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )
            },
        },
    ]
