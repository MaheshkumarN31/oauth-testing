import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, UserPlus } from 'lucide-react'
import type { Workspace } from '@/types'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TanStackTable from '@/components/core/TanstackTable'
import { createContactsColumns } from '@/components/core/ContactsColumns'
import { getContactsAPI, type Contact } from '@/services/api/contacts'
import { CreateContactDialog } from './CreateContactDialog'
import { EditContactDialog } from './EditContactDialog'
import { DeleteContactDialog } from './DeleteContactDialog'

interface ContactsContentProps {
    selectedWorkspace: Workspace | null
}

export function ContactsContent({ selectedWorkspace }: ContactsContentProps) {
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

    const companyId = selectedWorkspace?._id || ''

    // Fetch contacts
    const {
        data: contactsResponse,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ['contacts', companyId, pageIndex, pageSize],
        queryFn: () =>
            getContactsAPI({
                company_id: companyId,
                page: pageIndex + 1, // API uses 1-based indexing
                limit: pageSize,
            }),
        enabled: !!companyId,
    })

    const contactsData = contactsResponse?.data?.data || []
    const totalContacts = contactsResponse?.data?.total || 0
    const pageCount = Math.ceil(totalContacts / pageSize)

    // Filter contacts by search term (client-side filtering)
    const filteredContacts = searchTerm
        ? contactsData.filter((contact: Contact) => {
            const searchLower = searchTerm.toLowerCase()
            const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase()
            const email = contact.email.toLowerCase()
            return fullName.includes(searchLower) || email.includes(searchLower)
        })
        : contactsData

    // Handle edit
    const handleEdit = (contact: Contact) => {
        setSelectedContact(contact)
        setEditDialogOpen(true)
    }

    // Handle delete
    const handleDelete = (contact: Contact) => {
        setSelectedContact(contact)
        setDeleteDialogOpen(true)
    }

    // Create columns with callbacks
    const columns = createContactsColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    })

    return (
        <>
            <PageHeader
                title="Contacts"
                icon={Users}
                badge={selectedWorkspace?.name || 'No workspace'}
                searchPlaceholder="Search contacts..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="flex-1 space-y-6 p-6 overflow-auto">
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">
                                    All Contacts
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Manage your contacts and their information
                                </p>
                            </div>
                            <Button
                                onClick={() => setCreateDialogOpen(true)}
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-sm"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Contact
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <TanStackTable
                            data={filteredContacts}
                            columns={columns}
                            pageIndex={pageIndex}
                            pageSize={pageSize}
                            pageCount={pageCount}
                            totalCount={totalContacts}
                            onPageChange={setPageIndex}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize)
                                setPageIndex(0)
                            }}
                            loading={isLoading || isFetching}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs */}
            <CreateContactDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                companyId={companyId}
            />

            <EditContactDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                contact={selectedContact}
                companyId={companyId}
            />

            <DeleteContactDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                contact={selectedContact}
            />
        </>
    )
}

export default ContactsContent
